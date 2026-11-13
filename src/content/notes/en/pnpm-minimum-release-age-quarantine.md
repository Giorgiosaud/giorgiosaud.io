---
draft: false
title: "pnpm 11's Release-Age Quarantine: Why `pnpm outdated` Hides Versions and Forcing One Punches Holes"
description: "pnpm 11 refuses to install anything published in the last 24 hours. That's a good supply-chain default with two surprising side effects: pnpm outdated quietly lies about 'latest', and forcing a fresh version writes bypass entries into your workspace config."
publishDate: 2026-11-13
cover: ../../../assets/images/pnpm-minimum-release-age-quarantine.webp
coverAlt: "Package boxes waiting behind a glowing quarantine barrier with a clock, while one box is forced through a hole punched in the barrier"
selfHealing: pnpm11
lang: en
category: DevOps
author: giorgio-saud
collections:
  - security
  - frontend
tags:
  - pnpm
  - supply-chain
  - security
  - dependencies
  - "2026"
linkedinCopy: |
  Fellow devs — pnpm 11 turned on a 24-hour quarantine for new package versions by default, and it fooled me twice in one afternoon. First, pnpm outdated reported versions as "latest" that were already a release behind — it hides anything still in quarantine, without saying so. Second, when I forced the newer version, pnpm silently wrote sixteen bypass entries into pnpm-workspace.yaml, one per transitive dependency. A routine bump had just punched sixteen holes in a supply-chain guard. I wrote up how to see the real latest, how to spot the bypass in a diff, and when an exception is actually justified. Sign in and tell me whether your team keeps the quarantine on.
  Read more: https://www.giorgiosaud.io/notebook/pnpm11

  #pnpm #SupplyChainSecurity #NodeJS #WebDev #DevOps #WaitADay #QuarantineIsAFeature

twitterCopy: |
  Fellow devs — pnpm 11: `pnpm outdated` hides versions under 24h old, and forcing one writes bypass entries into pnpm-workspace.yaml. Check your diff. Sign in and comment: https://www.giorgiosaud.io/notebook/pnpm11 #pnpm #QuarantineIsAFeature
---

I was doing a routine dependency bump on a project and two things looked like bugs.

`pnpm outdated` said the "latest" version of a package was one I already knew was a release behind. And after I forced the newer version, the diff included a file I hadn't touched: `pnpm-workspace.yaml` had grown sixteen new lines.

Neither was a bug. Both were pnpm 11 doing exactly what it was designed to do, and it took me a while to see it.

## The feature: a 24-hour quarantine

Since pnpm 11, `minimumReleaseAge` defaults to `1440` minutes. pnpm won't resolve a version that was published less than a day ago.

The reasoning is sound. The recent wave of npm supply-chain attacks follows the same pattern: an attacker takes over a maintainer account, publishes a malicious version, and the community spots and yanks it within hours. If your install waits a day, you skip most of that window without doing anything.

It's a good default. It also changes how two everyday commands behave.

## Surprise 1: `pnpm outdated` hides the quarantine

`pnpm outdated` only reports versions that are *installable under your current policy*. A version published three hours ago isn't, so as far as `outdated` is concerned it doesn't exist. You see the previous version labeled as latest, and nothing says a newer one is waiting.

That's how you end up thinking the registry cache is stale, or the package didn't actually publish, or your lockfile is lying.

To see the actual latest on the registry, ask for it directly:

```bash
pnpm view <package> version
pnpm view <package> time --json | tail -5   # publish timestamps, to see how fresh it is
```

If `pnpm view` shows a newer version than `pnpm outdated`, and it's less than a day old, you've found the quarantine.

## Surprise 2: forcing a version writes bypass entries

The obvious next move is to force it:

```bash
pnpm up some-sdk@3.1102.0
```

It works. And pnpm quietly records an exception for every package it had to let through, in `minimumReleaseAgeExclude`:

```yaml
# pnpm-workspace.yaml
minimumReleaseAgeExclude:
  - some-sdk@3.1102.0
  - '@some-sdk/core@3.1102.0'
  - '@some-sdk/middleware-retry@3.1102.0'
  # ...one entry per fresh transitive dependency
```

A modular SDK publishes all its packages together, so one bump pulled in sixteen fresh transitive packages and sixteen bypass entries.

Look at what that means. The quarantine exists for exactly one scenario: *a version that was published hours ago might be malicious*. Forcing a routine upgrade skips the check in that same scenario, for every package in the tree, and leaves no trace beyond a YAML diff that's easy to wave through in review.

## The archaeology bit

When I looked at the existing `minimumReleaseAgeExclude` list in that repo, it already had entries: a test runner, a deploy CLI, a few others. Nobody remembered adding them.

`git log` showed they all came in with the commit that bumped pnpm to v11. They weren't deliberate exceptions. They were the same automatic bypass, written the first time someone ran an install right after the quarantine switched on and pnpm met versions that were still fresh.

So the list that's supposed to document "packages we consciously trust early" was mostly accidental.

## What I do now

**When a bump looks "missing":** check `pnpm view` before concluding anything. Usually the answer is that the version is a few hours old.

**When `pnpm-workspace.yaml` changes during a dependency bump:** treat it as a signal to back off, not something to commit. Revert the file, drop the forced version, and bump again tomorrow. Waiting a day costs nothing for a routine upgrade.

**When an exception is justified:** there is a real case for one, and it's a security fix you need now. `pnpm audit --fix` does this explicitly, adding the minimum patched version to the exclude list. That's a deliberate, reviewable exception. Pin it to the exact version, say why in the commit message, and remove it once the version ages out.

**Clean up the accidental ones.** Anything in `minimumReleaseAgeExclude` whose version is now days old isn't protecting or bypassing anything. It's just noise that makes the next deliberate exception harder to spot.

**In review:** a PR titled "bump dependencies" shouldn't touch `minimumReleaseAgeExclude`. If it does, ask why.

## The general lesson

Supply-chain guards fail the same way most security controls do. Nobody turns them off. They get bypassed one convenient exception at a time, and every exception looks reasonable in isolation.

pnpm made the safe behavior the default, which is the hard part. The rest is noticing when a tool quietly writes an exception for you and refusing to commit it.

> **Quick check for your repo:** `grep -A50 minimumReleaseAgeExclude pnpm-workspace.yaml`. For every entry, can you say who added it and why?
