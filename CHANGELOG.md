# Changelog

All notable changes to this project are documented in this file.

## [0.1.4] - 2026-02-21

### Changed

- Hardened the GitHub Actions publish workflow for npm release automation.

## [0.1.3] - 2026-02-21

### Added

- Added GitHub Actions publish workflow automation for tagged releases.

## [0.1.2] - 2026-02-20

### Fixed

- Fixed shorthand property expansion when renaming changes a property key but not the local variable.
- Fixed property access renames through anonymous inline type casts.
- Fixed object literal key renames passed to functions with anonymous inline parameter types.
- Fixed anonymous destructuring property rename propagation.

### Tests

- Added wrapper pass-through rename regression coverage.

## [0.1.1] - 2026-02-20

### Added

- Added a one-command release script for version bump and publish.

### Changed

- Updated release script to prompt for npm OTP.

## [0.1.0] - 2026-02-20

### Added

- Initial public release of `ts-prefix-internals`.
- TypeScript program and language service setup.
- Public API surface discovery and internal/public symbol classification.
- Rename engine using the TypeScript Language Service.
- Main orchestration flow for rewrite output and validation.
- CLI argument parsing and output formatting.
- End-to-end pipeline test coverage.
- Packaging for installable npm usage and GitHub install support.
- CI workflow and README documentation.
- npm metadata and release-ready packaging setup.

### Fixed

- API surface discovery for heritage clauses, constructors, and accessors.
- Decorator-check bug caused by incorrect modifier kind comparison.

### Tests

- Added tests for heritage clause, accessor, and decorator handling.
