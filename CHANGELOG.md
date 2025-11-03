# Change Log

All notable changes to the "diffy-explain-ai" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.1.0] - 2025-11-03

### Added

- **VS Code Language Model API Integration**: Support for GitHub Copilot as an AI service provider
- New configuration option `aiServiceProvider` to choose between OpenAI and VS Code LM
- New configuration option `vscodeLmModel` to select between `copilot-gpt-4o` and `copilot-gpt-3.5-turbo`
- Dual AI provider architecture allowing users to switch between OpenAI API and GitHub Copilot

### Changed

- Updated VS Code engine requirement to ^1.90.0 for Language Model API support
- Improved singleton pattern implementation in service classes
- Modernized imports with `node:` protocol for Node.js built-in modules
- Enhanced type safety with better TypeScript type definitions

### Fixed

- Fixed singleton constructor patterns in OpenAiService, WorkspaceService, and VsCodeLlmService
- Fixed confusing void type in EventEmitter type definitions
- Removed unused variables and parameters warnings

### Documentation

- Updated README with instructions for both OpenAI and GitHub Copilot setup
- Added comprehensive configuration guide for dual AI provider support

## [Unreleased]

- Initial release

## [0.0.6] - 2022-12-24

### Added

- Generate Commit Message.
- Explain Changes in Natural Language.
- Directly Generate Commit Message to VScode git commit input box. Copy to Clipboard

## [0.0.7] - 2022-12-24

### Fixed

- Commit Message Generation Improved

## [0.0.8] - 2022-12-24

### Changes

- Suggested Message as Newline Instead of Space

## [0.0.9] - 2022-12-24

### Added

- Explain and Preview Changes of Staged Files
### Changes

- Bug Fixes

## [0.0.10] - 2022-12-24
### Changes

- Bug Fixes