# Skills

Upstream skills live in `.agents/skills/`. Their descriptions identify when to use
them. Keep downloaded skills unchanged; maintain project-specific rules in
[`AGENTS.md`](../AGENTS.md) and [topic documentation](README.md).

## Project overrides

Project requirements take precedence over upstream defaults. In Codex, use managed
worktree tools when a new worktree is needed; the `conventional-git` skill's
`.claude/worktrees/` location is not a project requirement.

## Installation and updates

Install selected external skills from the repository root:

```sh
npx skills add <owner/repo> --skill <name> -a codex -y
```

Do not use `-g` or install entire skill bundles. Review selected upstream updates:

```sh
npx skills update <name> -p
```

Commit `.agents/skills/` and `skills-lock.json` together. Do not edit the lockfile
by hand: it records sources and hashes, while committed skill files preserve the
reviewed contents. Check skill discovery, lockfile consistency, links, and
formatting after changes.
