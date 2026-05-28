---
draft: false
title: "Building a Claude API Load Indicator for Your Terminal"
description: "How I built a zsh oh-my-zsh plugin that shows Claude API latency directly in my Powerlevel10k prompt — using a background launchd job and a rolling baseline so you always know if it's slow right now or just your network."
publishDate: 2026-04-08
cover: ../../../assets/images/claude-api-load-indicator.png
coverAlt: Terminal showing Claude API load indicator
selfHealing: bldngc
lang: en
category: devops
author: giorgio-saud
collections:
  - architecture
tags:
  - terminal
  - zsh
  - shell
  - claude
  - ai
  - devops
  - "2026"
linkedinCopy: |
  Fellow devs — I was tired of not knowing if Claude API was slow or if it was just my network. So I built a zsh plugin that shows live API latency in my Powerlevel10k prompt using a background launchd job and a rolling baseline. Every terminal prompt now tells me the current state. This is the kind of devtools rabbit hole I cannot stop going down. Sign in and tell me what terminal customizations you are obsessed with.
  Read more: https://www.giorgiosaud.io/notebook/bldngc
  
  #Terminal #ZSH #DevOps #AI #Claude #TerminalPersonalityDisorder #PromptEngineeringButLiterally
twitterCopy: |
  Fellow devs — I put Claude API latency in my terminal prompt using a launchd background job. Because why not. Sign in and comment: https://www.giorgiosaud.io/notebook/bldngc #Terminal #Claude #PromptEngineeringButLiterally
---

If you spend a lot of time in Claude Code or the Anthropic API, you've probably wondered: *is it slow right now, or is it just me?* This post walks through how I built a small zsh plugin that answers that question directly in my terminal prompt.

## What It Does

The final result is a Powerlevel10k segment on the right side of my prompt that shows:

| Icon | Color | Meaning |
|------|-------|---------|
|  | Green | API responding normally |
|  | Yellow | Elevated latency (baseline + 1σ) |
|  | Red | Peak load (baseline + 2σ) |
|  | Grey | API unreachable |

It also shows the raw latency in milliseconds. The icon updates every minute automatically via a background macOS launchd job — no shell slowdown, no tokens consumed.

## Architecture Overview

The whole thing is packaged as an oh-my-zsh custom plugin with five files:

```
~/.oh-my-zsh/custom/plugins/claude-status/
├── claude-status.plugin.zsh          # entry point — loaded by oh-my-zsh
├── statusline.sh                     # Claude Code statusline renderer
├── latency-common.sh                 # shared cache reader (p10k + statusline)
├── latency-sampler.sh                # background ping script
└── com.giorgiosaud.claude.latency.plist  # launchd job template
```

Two JSON files are written at runtime:

```
~/.claude/latency_log.json       # rolling 30-day history
~/.claude/latency_cache.json     # latest result, read by the prompt
```

## Part 1: Measuring Latency

The sampler script (`latency-sampler.sh`) makes an unauthenticated HTTP POST to `api.anthropic.com/v1/messages` using `curl`. The server returns a `401` immediately — no API key needed, no tokens consumed — but the full TCP + TLS + HTTP stack is exercised:

```bash
curl_time=$(curl -s -o /dev/null -w "%{time_total}" \
  --max-time "$TIMEOUT" \
  -X POST \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-haiku-4-5-20251001","max_tokens":1,"messages":[{"role":"user","content":"h"}]}' \
  "https://api.anthropic.com/v1/messages" 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$curl_time" ]; then
  ms=$(python3 -c "print(int(float('$curl_time') * 1000))")
fi
```

This measures the full HTTP stack — TCP handshake, TLS negotiation, and the server's time-to-first-byte — making it a better proxy for API load than a bare TCP ping.

## Part 2: Building a Baseline with Statistics

A single measurement tells you the current latency. To know if that's *fast or slow*, you need context. The sampler builds a rolling baseline using the last 30 days of samples taken at the same hour (±1) on the same weekday:

```python
samples = [
    e["ms"] for e in log
    if e["weekday"] == current_weekday
    and abs(e["hour"] - current_hour) <= 1
    and e["ts"] != current_ts
    and e["ms"] is not None
]

if len(samples) >= 30:
    baseline = statistics.median(samples)
    stdev = statistics.stdev(samples)
    warn_threshold = baseline + stdev       # ~84th percentile
    peak_threshold = baseline + 2 * stdev  # ~97.5th percentile
```

Rather than fixed ratio multipliers, the thresholds are expressed in standard deviations from the median. This adapts automatically to your network environment — a fast connection and a slow one will have appropriately different thresholds.

### Level Thresholds

| Condition | Level |
|-----------|-------|
| ms ≤ baseline + σ | normal |
| baseline + σ < ms ≤ baseline + 2σ | warn |
| ms > baseline + 2σ | peak |
| curl timeout | unavailable |
| fewer than 30 samples | normal (no level indicator) |

The minimum sample count is 30 (not 3) to ensure the standard deviation estimate is stable before it's used for decisions.

### Log Management

Every run appends one entry and prunes entries older than 30 days. At 1-minute intervals the log grows quickly, but the weekday+hour filter window means the effective working set for any baseline calculation is much smaller.

```python
log.append({"ts": now, "ms": ms, "hour": hour, "weekday": weekday})
log = [e for e in log if e["ts"] >= cutoff]  # cutoff = now - 30 days
```

## Part 3: Running It in the Background with launchd

On macOS, `launchd` is the right tool for recurring background jobs. It runs even when no terminal is open, survives reboots, and doesn't require cron.

The plugin ships a plist template with `__SAMPLER_PATH__` and `__HOME__` as placeholders. The sampler runs every 60 seconds:

```xml
<key>Label</key>
<string>com.giorgiosaud.claude.latency</string>
<key>StartInterval</key>
<integer>60</integer>
<key>RunAtLoad</key>
<true/>
```

The plugin entry point renders the template with real paths and loads it silently on every shell start (idempotent — skips if already loaded):

```zsh
sed \
  -e "s|__SAMPLER_PATH__|$_claude_sampler|g" \
  -e "s|__HOME__|$HOME|g" \
  "$_claude_plist_src" > "$_claude_plist_dest"

if ! launchctl list "$_claude_plist_label" &>/dev/null; then
  launchctl bootstrap "gui/$(id -u)" "$_claude_plist_dest" 2>/dev/null \
    || launchctl load "$_claude_plist_dest" 2>/dev/null \
    || true
fi
```

No manual setup required — install the plugin, reload your shell, and the sampler starts running.

## Part 4: The Shared Cache Reader

Both the Powerlevel10k segment and the statusline renderer need to read the same cache file and resolve icons. Rather than duplicating that logic, a shared `latency-common.sh` sets three environment variables:

```bash
# latency-common.sh
claude_latency_read() {
  CLAUDE_LATENCY_LEVEL=$(jq -r '.level // "normal"' "$CLAUDE_LATENCY_CACHE")
  CLAUDE_LATENCY_MS=$(jq -r '.ms // ""' "$CLAUDE_LATENCY_CACHE")

  case "$CLAUDE_LATENCY_LEVEL" in
    normal)      CLAUDE_LATENCY_ICON=$(printf '\xef\x83\xa7') ;;   # U+F0E7 bolt
    warn)        CLAUDE_LATENCY_ICON=$(printf '\xef\x81\xb1') ;;   # U+F071 warning
    peak)        CLAUDE_LATENCY_ICON=$(printf '\xef\x88\x9e') ;;   # U+F21E heartbeat
    unavailable) CLAUDE_LATENCY_ICON=$(printf '\xef\xae\xa4') ;;   # U+FBA4 shield
  esac
}
```

Icons are encoded as raw UTF-8 byte sequences via `printf` rather than embedded literals — this avoids the invisible zero-width character issue that occurs when editors silently mangle Nerd Font codepoints.

## Part 5: The Powerlevel10k Segment

The prompt segment sources the shared reader and uses foreground-only coloring (no background fill — cleaner on transparent terminals):

```zsh
function prompt_claude_latency() {
  claude_latency_read || return

  local fg
  case "$CLAUDE_LATENCY_LEVEL" in
    normal)      fg=76  ;;   # green  (matches VCS_CLEAN)
    warn)        fg=178 ;;   # yellow (matches VCS_MODIFIED)
    peak)        fg=160 ;;   # red    (matches STATUS_ERROR)
    unavailable) fg=66  ;;   # grey   (matches TIME)
  esac

  if [[ -n "$CLAUDE_LATENCY_MS" && "$CLAUDE_LATENCY_MS" != "null" ]]; then
    p10k segment -f $fg -i "$CLAUDE_LATENCY_ICON" -t "${CLAUDE_LATENCY_MS}ms"
  else
    p10k segment -f $fg -i "$CLAUDE_LATENCY_ICON"
  fi
}
```

The segment auto-registers itself via a `precmd` hook — no manual `.p10k.zsh` edit required:

```zsh
function _claude_status_register() {
  if (( ${#POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS} )); then
    if [[ ${POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS[(Ie)claude_latency]} -eq 0 ]]; then
      POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS+=(claude_latency)
    fi
    add-zsh-hook -d precmd _claude_status_register
    unfunction _claude_status_register
  fi
}
autoload -Uz add-zsh-hook
add-zsh-hook precmd _claude_status_register
```

The hook fires once on the first prompt, appends the segment, then removes itself.

> **Color note:** Use literal 256-color numbers with `-f`, not variables. Passing `$POWERLEVEL9K_*` color variables to `p10k segment` doesn't work for custom segments.

## Part 6: The Claude Code Statusline

Claude Code's built-in statusline shows context window usage and rate limits. The plugin adds a richer statusline that integrates all of this alongside the latency indicator, git branch, and model name:

```bash
# Reads JSON piped from Claude Code on stdin
cwd=$(echo "$input"    | jq -r '.workspace.current_dir // .cwd // ""')
model=$(echo "$input"  | jq -r '.model.display_name // ""')
used_pct=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
five_pct=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // empty')
```

Progress bars are rendered in pure bash:

```bash
make_bar() {
  local pct=$1
  local filled=$(( pct * 10 / 100 ))
  local empty=$(( 10 - filled ))
  local bar="" i
  for (( i=0; i<filled; i++ )); do bar="${bar}█"; done
  for (( i=0; i<empty;  i++ )); do bar="${bar}░"; done
  printf "%s" "$bar"
}
```

The final line looks like:

```
user@host  ~/projects/myapp  main  claude-sonnet-4-6 |  [████████░░] 82% |  [███░░░░░░░] 31% |  45ms
```

Register it with the provided helper:

```zsh
claude-status-register
```

This writes the `statusLine` key to `~/.claude/settings.json` automatically via `jq`.

## Gotchas I Hit

**Nerd Font bytes not written correctly.** When the agent wrote icon codepoints to the shell script, they were stored as invisible zero-width characters. The fix was using `printf '\xNN\xNN\xNN'` with explicit UTF-8 byte sequences instead of embedding the characters directly.

**p10k segment colors need hardcoded numbers.** Passing variable values to `-f` or `-b` doesn't work for custom segments. Use literal 256-color numbers: `-f 76`.

**Background vs. foreground coloring.** Using `-b` (background fill) looks cluttered on transparent terminal backgrounds. Foreground-only (`-f`) blends better and still matches p10k's standard color palette.

**`/dev/tcp` is unreliable for timing in bash.** `curl -w "%{time_total}"` is precise and portable across macOS bash versions.

**TCP ping underestimates API load.** A bare `nc` TCP handshake only measures network RTT — it doesn't reflect TLS negotiation or server-side processing time. The `curl` approach captures the full stack and correlates much better with actual API latency under load.

## Installation

1. Clone or copy the plugin into `~/.oh-my-zsh/custom/plugins/claude-status/`
2. Add `claude-status` to your `plugins=(...)` list in your zshrc
3. Run `exec zsh` — the launchd job and p10k segment install themselves
4. To add the Claude Code statusline: run `claude-status-register` in your terminal

After ~60 seconds (RunAtLoad fires), `~/.claude/latency_cache.json` will exist and both the p10k segment and statusline will show live data.

## What's Next

- **Color-coded ms text** — yellow/red on the ms value itself when latency exceeds thresholds, even before a full baseline exists
- **Historical chart** — `claude-latency-history` command to visualize the rolling log in the terminal
- **Notification on peak** — `osascript` alert when ratio crosses 2σ during active work
