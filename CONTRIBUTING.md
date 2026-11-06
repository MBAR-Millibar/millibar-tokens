# Contributing

Thank you for helping improve the Millibar brand tokens.

This package isn't open source: it is published so Millibar's own projects can install it. Issues and pull requests are welcome, and by contributing you agree that Millibar may use your contribution in this package. Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

> **Security issues are not reported in issues.** See [SECURITY.md](SECURITY.md).

## What to contribute

- A wrong or missing value in a generated file
- A token that a Millibar project needs (open a [feature request](https://github.com/MBAR-Millibar/millibar-tokens/issues/new?template=feature.yml) first)
- Clearer README examples, typos and broken links

Changes to the brand itself (colours, type scale, logos) are decided in the Millibar Design Kit, not in a pull request.

## Setup

```bash
git clone https://github.com/MBAR-Millibar/millibar-tokens.git
cd millibar-tokens
```

There are no dependencies. Node 18 or later runs the build.

## How to propose a change

1. Fork the repository and create a branch (`fix/…`, `add/…`, `docs/…`).
2. Edit `tokens.json`, the single source. Never edit `dist/` by hand.
3. Run `npm run build` and commit `tokens.json` and `dist/` together.
4. If you added or renamed a token, a utility or a file, update the README.
5. Open a pull request.

## Code style

- 2 spaces, single quotes, semicolons.
- Every CSS variable, class and utility name carries `mbar`, so nothing replaces a project's own defaults.
- Comments say why, not what.
- British English in docs and comments (`colour`, `behaviour`).

## Commit messages

One line, starting with the kind of change, then what it does from a project's point of view:

```text
add: Design Kit foundations and logo files
docs: install from the release tarball, not github:
fix: …
change: …
```

## Checks

CI runs on every pull request:

- **dist is up to date**: `npm run build` leaves `dist/` unchanged.
- **Logos**: every file in `logos/` is an SVG.

## Releases

Maintainers release by bumping `version` in `package.json` and the install URL in the README, tagging `vX.Y.Z` on `main`, and publishing a GitHub release that lists the changes. Projects pin the tag's tarball, so nothing changes for them until they bump it.
