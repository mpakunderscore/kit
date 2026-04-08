# AGENTS.md — Code Quality Standards

## Purpose

- Keep the codebase maintainable, reliable, and easy to evolve.
- Optimize for clarity first, then performance and flexibility.

## Formatting

- Use 4-space indentation in all files (matches project Prettier config: `tabWidth: 4`).

## Core Quality Principles

- Prefer simple solutions over clever ones.
- Make behavior explicit; avoid hidden coupling between modules.
- Keep changes small, scoped, and reversible.
- Leave touched code cleaner than it was before.

## Source Tree Organization

- Keep `src` structure simple, explicit, and stable over time.
- Prefer domain-driven grouping over generic buckets.
- Avoid wrapper directories that add no architectural value.

### General Rules

- Group by feature/domain first, then by technical type inside that feature.
- Keep shared code clearly separated from feature-local code.
- Place entry/bootstrap logic in a dedicated app-level area.
- Put static assets in dedicated asset directories (e.g., fonts, styles, media).
- Use consistent naming for top-level folders; avoid parallel synonyms (for example, do not mix `css` and `styles`).

### Directory Hygiene

- Do not keep a directory that only contains one file/subdirectory unless there is a clear scaling reason.
- If a folder becomes crowded, split it into meaningful subgroups by domain/responsibility.
- If a folder has become too fragmented, flatten it to reduce navigation overhead.
- Keep folder depth intentional; avoid deep nesting without clear boundaries.

### Hooks, Utilities, and Network

- Keep global hooks in shared scope; move feature-specific hooks next to the feature.
- Avoid catch-all utility folders; organize shared helpers by purpose/domain.
- Keep network layer structure minimal and explicit; introduce subfolders only when multiple independent clients/modules exist.

### Refactoring Expectations

- Structural refactors must not change runtime behavior.
- Update imports/aliases in the same change.
- Avoid long-lived transitional paths or duplicate locations.
- Keep refactors scoped, reviewable, and reversible.

## Mandatory Quality Gates

- Run `npm run check` before commit for all code/config/style changes.
- During iteration, minimum local gate is `npm run check:types` and `npm run lint`.
- If a gate fails, fix the issue and rerun before continuing.
- Do not bypass lint/type rules without a short in-code rationale.

## TypeScript Standards

- Use strict, explicit types for public APIs, props, return values, and shared utilities.
- Avoid `any`; use `unknown` + narrowing when exact type is not known.
- Prefer `readonly` data shapes and immutable updates where practical.
- Keep naming descriptive and intention-revealing.
- Remove dead code, unused exports, and unused imports immediately.

## React Standards

- Keep components and hooks pure; no side effects during render.
- Follow Hooks rules strictly; call hooks unconditionally at top level.
- Use `useEffect` only for real side effects, not for deriving render state.
- Do not silence hook dependency warnings to force behavior.
- Prefer derived values (`useMemo` only when needed) over duplicated state.
- Keep component boundaries clean: UI rendering in components, logic in hooks/utilities.
- Use stable keys from data for lists; avoid index keys for dynamic content.
- Preserve accessibility basics: semantic elements, keyboard focus, meaningful text labels.

## CSS Standards

- Keep style architecture layered: `tokens`, `base`, `sections`, `utilities`.
- Use `snake_case` class names only.
- Do not use `__` or `--` in class names.
- Prefer class selectors over tag-based selectors for feature styling.
- Keep selector specificity low and predictable; avoid `!important` unless justified.
- Use design tokens from `src/assets/styles/tokens/variables.css` instead of magic numbers.
- Keep responsive rules explicit and local to affected sections.
- Keep motion intentional; avoid excessive animation and respect readability.

## Reliability and Safety

- Validate external input at boundaries (API, query params, payloads, env values).
- Fail fast on invalid state and surface actionable errors.
- Keep production logs meaningful; remove debug logging before merge.
- Avoid introducing behavior that depends on timing hacks or implicit globals.

## Change Hygiene

- Never erase or discard existing code changes unless the user explicitly requests it.
- Never run repository-wide auto-fix or auto-format commands (for example, commands that modify many files) unless the user explicitly asks for it.
- Never modify files outside the requested scope without explicit user approval, even if a tool changes them automatically.
- If any command changes unrelated files, stop immediately, restore those unrelated changes, and ask the user before continuing.
- One logical change per commit.
- Update TSX and CSS together when renaming classes or restructuring UI.
- Remove obsolete comments, temporary code paths, and stale TODOs during refactors.
- Keep file/module responsibilities focused; split oversized modules when needed.

## Absolute Git Safety Rule (Highest Priority)

- The assistant must never run any command that discards local uncommitted changes.
- Forbidden commands include (non-exhaustive):
    - `git checkout -- ...`
    - `git restore ...`
    - `git reset --hard`
    - `git clean -fd`
    - `git clean -fdx`
- This prohibition applies even if the assistant believes changes are unrelated, accidental, or tool-generated.
- If rollback appears necessary, the assistant must stop and ask the user first.
- On any violation, the assistant must immediately report the exact command and affected files, then wait for user instruction.

## Definition of Done

- Type checks pass.
- Lint checks pass.
- Build passes.
- No dead code, no temporary workarounds, no unexplained rule suppressions.
- The resulting code is clearer than before the change.

## Absolute Scope Rule (Highest Priority)

- The assistant must always follow these instructions in this section without exception.
- The assistant must execute only what the user explicitly requested.
- The assistant must not perform proactive improvements, cleanup, refactors, style tweaks, or other extra changes.
- The assistant must not run lint/format/test/build commands unless the user explicitly requested them.
- If the request is "make commit(s)", the assistant may only use git commands required for commit creation.
- In commit-only requests, file edits are forbidden unless the user explicitly asked to edit files first.
- If unrelated local changes exist, the assistant must ask the user what to include and must not decide unilaterally.
- If any command causes unrelated file changes, the assistant must stop, report it, and wait for user instruction.
- If the request is ambiguous, the assistant must ask a clarification question before making any change.
- This rule overrides autonomous optimization behavior and default workflows.
- For commit requests, user intent is execution-only, not correction.

## Commit Request Lock (Mandatory)

- When the user asks to "commit" or "make commits", the assistant must enter COMMIT_LOCK mode.
- In COMMIT_LOCK mode, the assistant is forbidden to edit any file for any reason.
- In COMMIT_LOCK mode, the assistant is forbidden to run any non-git command.
- Allowed commands in COMMIT_LOCK mode: `git status`, `git add ...`, `git commit ...`, `git log -1 --stat`.
- If the assistant believes any file must be changed before commit, it must stop and ask the user first; no changes are allowed until explicit user approval.
- The assistant must never perform preventive fixes, restorations, cleanup, or formatting during COMMIT_LOCK mode.
- Violation handling: if the assistant edited anything in COMMIT_LOCK mode, it must immediately stop, report exactly what changed, and wait for user instruction.
