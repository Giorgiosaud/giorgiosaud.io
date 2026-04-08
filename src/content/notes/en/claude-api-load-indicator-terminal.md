---
draft: false
title: "Building a Claude API Load Indicator for Your Terminal"
description: "How I built a zsh oh-my-zsh plugin that shows Claude API latency directly in my Powerlevel10k prompt — using a background launchd job and a rolling baseline so you always know if it's slow right now or just your network."
publishDate: 2026-04-08
cover: ../../../assets/images/home-notebook.webp
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
---

If you spend a lot of time in Claude Code or hitting the Anthropic API directly, you've probably wondered: *is it slow right now, or is it just me?* I got tired of wondering and built a small zsh plugin that answers that question directly in my terminal prompt.

## What It Does

The result is a Powerlevel10k segment on the right side of my prompt that shows the current API load:

| Icon | Color | Meaning |
|------|-------|---------|
| ⚡ | Green | API responding normally |
| ⚠ | Yellow | Elevated latency (1.4× baseline) |
| ❤ | Red | Peak load (2× baseline) |
| 🛡 | Grey | API unreachable |

It also shows the raw latency in milliseconds. The icon updates every 15 minutes via a background macOS launchd job — no shell slowdown, no tokens consumed.

## Architecture Overview

The whole thing is packaged as an oh-my-zsh custom plugin with four files:

```
~/.oh-my-zsh/custom/plugins/claude-status/
├── claude-status.plugin.zsh     # entry point — loaded by oh-my-zsh
├── statusline.sh                # Claude Code statusline renderer
├── latency-sampler.sh           # background ping script
└── com.claude.latency.plist     # launchd job template
```

Two JSON files are written at runtime:

```
~/.claude/latency_log.json       # rolling 7-day history
~/.claude/latency_cache.json     # latest result, read by the prompt
```

The prompt only ever reads `latency_cache.json` — a tiny file written by the background job. No blocking, no waiting.

## Part 1: Measuring Latency Without Using the API

The sampler script does a TCP handshake to `api.anthropic.com:443` using `nc` and measures the round-trip time in milliseconds:

```bash
start=$(python3 -c "import time; print(int(time.time()*1000))")
if nc -z -w 10 api.anthropic.com 443 2>/dev/null; then
  end=$(python3 -c "import time; print(int(time.time()*1000))")
  ms=$(( end - start ))
fi
```

This measures network + TLS negotiation time — a good proxy for API load without making any actual API calls (and thus consuming zero tokens). It won't catch every type of slowdown, but it catches the ones that matter: the server being under load at the network edge.

## Part 2: Building a Meaningful Baseline

A single measurement tells you the current latency. To know if that's *fast or slow*, you need context. The sampler builds a rolling baseline using the last 7 days of samples taken at the same hour (±1) on the same weekday:

```python
samples = [
    e["ms"] for e in log
    if e["weekday"] == current_weekday
    and abs(e["hour"] - current_hour) <= 1
    and e["ts"] != current_ts
]

if len(samples) >= 3:
    baseline = statistics.median(samples)
    ratio = current_ms / baseline
```

Using the **median** rather than the mean avoids outliers — a single spike doesn't inflate the baseline. The weekday + hour window accounts for predictable traffic patterns; Tuesday afternoon looks very different from Sunday morning.

### Level Thresholds

| Ratio vs baseline | Level |
|-------------------|-------|
| < 1.4× | normal |
| 1.4× – 2× | warn |
| ≥ 2× | peak |
| TCP timeout | unavailable |

Until 3 samples exist for the current time window, only the raw ms is shown with no level indicator. Better to show nothing than something misleading.

### Log Management

Every run appends one entry and prunes entries older than 7 days. At 15-minute intervals that's a maximum of ~672 entries (~35KB) — a fixed-size rolling window that doesn't grow unbounded:

```python
log.append({"ts": now, "ms": ms, "hour": hour, "weekday": weekday})
log = [e for e in log if e["ts"] >= cutoff]  # cutoff = now - 7 days
```

## Part 3: Running It in the Background with launchd

On macOS, `launchd` is the right tool for recurring background jobs. It runs even when no terminal is open, survives reboots, and doesn't require cron.

The plugin ships a plist template with `__SAMPLER_PATH__` and `__HOME__` as placeholders:

```xml
<key>StartInterval</key>
<integer>900</integer>   <!-- 15 minutes -->
<key>RunAtLoad</key>
<true/>                  <!-- run once immediately on install -->
```

The plugin entry point renders the template with real paths and loads it on every shell start — idempotently, skipping the load if already registered:

```zsh
sed \
  -e "s|__SAMPLER_PATH__|$_claude_sampler|g" \
  -e "s|__HOME__|$HOME|g" \
  "$_claude_plist_src" > "$_claude_plist_dest"

if ! launchctl list "com.claude.latency" &>/dev/null; then
  launchctl bootstrap "gui/$(id -u)" "$_claude_plist_dest" 2>/dev/null
fi
```

No manual setup required. Install the plugin, reload your shell, and the sampler starts running. After ~15 seconds `~/.claude/latency_cache.json` exists and the segment appears.

## Part 4: The Powerlevel10k Segment

The prompt segment reads `latency_cache.json` and calls `p10k segment` with the appropriate icon and color. The key lesson here: use `-i` for the icon and hardcode color numbers directly — don't pass variables:

```zsh
function prompt_claude_latency() {
  local cache="$HOME/.claude/latency_cache.json"
  [[ -f "$cache" ]] || return

  local level ms icon fg bg
  level=$(jq -r '.level // "normal"' "$cache" 2>/dev/null) || return
  ms=$(jq -r '.ms // ""' "$cache" 2>/dev/null)

  case "$level" in
    normal)      icon=$'\uf0e7'; fg=0; bg=2 ;;   # bolt,    black on green
    warn)        icon=$'\uf071'; fg=0; bg=3 ;;   # warning, black on yellow
    peak)        icon=$'\uf21e'; fg=0; bg=1 ;;   # pulse,   black on red
    unavailable) icon=$'\ufba4'; fg=0; bg=7 ;;   # shield,  black on grey
    *)           return ;;
  esac

  if [[ -n "$ms" && "$ms" != "null" ]]; then
    p10k segment -b $bg -f $fg -i "$icon" -t "${ms}ms"
  else
    p10k segment -b $bg -f $fg -i "$icon"
  fi
}
```

Register it in `~/.p10k.zsh`:

```zsh
typeset -g POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=(
  # ... existing segments ...
  claude_latency
)
```

Then `p10k reload` to activate without restarting the shell.

> **Font requirement:** Nerd Font icons require a patched font. MesloLGS NF (the default for Powerlevel10k) works perfectly — all icon codepoints used are in the Font Awesome v4 / Powerline range.

## Part 5: The Claude Code Statusline

Claude Code has a built-in statusline that shows context window usage and rate limits. The plugin also ships a statusline renderer that adds the latency indicator there, reading the same cache file:

```bash
if [ -f "$CACHE" ]; then
  level=$(jq -r '.level' "$CACHE")
  ms=$(jq -r '.ms // ""' "$CACHE")
  # ... pick icon by level ...
  latency_segment=" | ${icon} ${ms}ms"
fi
```

This means you get the same signal whether you're looking at your prompt or inside a Claude Code session.

## Gotchas I Hit

**Nerd Font bytes not written correctly.** When the agent wrote icon codepoints to the shell script, they were stored as invisible zero-width characters. The fix was writing the file with Python and embedding the Unicode directly:

```python
with open('statusline.sh', 'w', encoding='utf-8') as f:
    f.write(script)  # script contains actual \uf0e7 etc. characters
```

**p10k segment colors need hardcoded numbers.** Passing variable values to `-b` doesn't work for custom segments. Use literal numbers: `-b 2 -f 0`.

**`/dev/tcp` is unreliable in bash for timing.** Using `nc -z -w $TIMEOUT` is cleaner and works consistently across macOS bash versions.

## Installation

1. Clone or copy the plugin into `~/.oh-my-zsh/custom/plugins/claude-status/`
2. Add `claude-status` to your `plugins=(...)` list in `~/.zshrc`
3. Add `claude_latency` to `POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS` in `~/.p10k.zsh`
4. Run `exec zsh && p10k reload`

The launchd job installs itself. After ~15 seconds (RunAtLoad fires), the cache file will exist and the segment will appear.

## What's Next

A few things I want to add:

- **Color-coded ms text** — yellow/red when latency exceeds thresholds even without a full baseline yet
- **Historical chart** — a `claude-latency-history` command to visualize the rolling log in the terminal
- **Notification on peak** — `osascript` alert when ratio crosses 2× during active work sessions

It's a small thing, but having this information ambient in the prompt has genuinely changed how I interpret Claude's response time. When it feels slow, I now know within a glance whether that's my machine, my connection, or the API itself.
