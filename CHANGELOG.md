# Change Log

All notable changes to the "diffy-explain-ai" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.6.0](https://github.com/Hi7cl4w/diffy-explain-ai/compare/diffy-explain-ai-v1.5.0...diffy-explain-ai-v1.6.0) (2025-11-07)


### ✨ Features

* **diffy:** add configurable large diff threshold ([324d811](https://github.com/Hi7cl4w/diffy-explain-ai/commit/324d811a10ae78fcd6e2942d9fe3deec68f4b810))
* **git:** add silent option to getDiffAndWarnUser method ([4edc49a](https://github.com/Hi7cl4w/diffy-explain-ai/commit/4edc49a486782a97e230cc36adb8af86d48b82f0))


### 🐛 Bug Fixes

* **git:** do not warn message on updateStagedChanges ([6f3813d](https://github.com/Hi7cl4w/diffy-explain-ai/commit/6f3813d9f173e044f74802d41d80f50cc2fa550f))
* remove unused imports and organize imports ([48975ce](https://github.com/Hi7cl4w/diffy-explain-ai/commit/48975ce595130c238023f43301f43a27c3a78574))

## [1.5.0](https://github.com/Hi7cl4w/diffy-explain-ai/compare/diffy-explain-ai-v1.4.1...diffy-explain-ai-v1.5.0) (2025-11-06)


### ✨ Features

* add Git staging event listeners and diff pre-warming ([228eb08](https://github.com/Hi7cl4w/diffy-explain-ai/commit/228eb08a0fec513bd91bca5557921ba8fbded049))

## [1.4.1](https://github.com/Hi7cl4w/diffy-explain-ai/compare/diffy-explain-ai-v1.4.0...diffy-explain-ai-v1.4.1) (2025-11-06)


### ⚡ Performance Improvements

* improve performance with parallel processing, optimized caching, and pre-initialization ([a9a492e](https://github.com/Hi7cl4w/diffy-explain-ai/commit/a9a492e95551c1a95303c29db9bfdc60e00ae215))

## [1.4.0](https://github.com/Hi7cl4w/diffy-explain-ai/compare/diffy-explain-ai-v1.3.0...diffy-explain-ai-v1.4.0) (2025-11-06)


### ✨ Features

* **config:** add codebase indexing strategy setting ([8f27ee7](https://github.com/Hi7cl4w/diffy-explain-ai/commit/8f27ee7f5c6eb801fab8237180a3e20ea8471733))
* **diff:** integrate DiffAnalyzer with structured mode ([d15fa30](https://github.com/Hi7cl4w/diffy-explain-ai/commit/d15fa30389ed27457a7c6cd9ff555fa8c0cfe4a4))
* **indexing:** implement multi-strategy codebase indexing ([7210f9e](https://github.com/Hi7cl4w/diffy-explain-ai/commit/7210f9e67ac759605a80e6a995b66796beab8859))
* **service:** add DiffAnalyzer for analyzing git diffs ([dcb188e](https://github.com/Hi7cl4w/diffy-explain-ai/commit/dcb188edcef78ad17b7216b8e6522f0849a9a6ec))


### ♻️ Code Refactoring

* **logging:** replace sendToOutput with structured logger ([b03fdde](https://github.com/Hi7cl4w/diffy-explain-ai/commit/b03fddef78ab14616e7c538f98406da3544a8f03))

## [1.3.0](https://github.com/Hi7cl4w/diffy-explain-ai/compare/diffy-explain-ai-v1.2.1...diffy-explain-ai-v1.3.0) (2025-11-04)


### ✨ Features

* add codebase indexing service and improve configuration handling ([b53f132](https://github.com/Hi7cl4w/diffy-explain-ai/commit/b53f1325e2b243d6aab8fc6b9294ac5bac06fed5))
* add support for Grok Code Fast 1 and GPT-5 mini Copilot models ([869eb03](https://github.com/Hi7cl4w/diffy-explain-ai/commit/869eb036770344a00b3babf30b44ebfd8f30c4cc))


### 📝 Documentation

* **changelog:** update for version 1.2.0 and unreleased fixes ([e2c0a8d](https://github.com/Hi7cl4w/diffy-explain-ai/commit/e2c0a8d0fc820de94ef2f4a21f90d1bc2daae785))
* enhance README with comprehensive features, installation, and configuration details ([cce7142](https://github.com/Hi7cl4w/diffy-explain-ai/commit/cce7142bb2337f8864407e76d5f5d32eb82bcb35))
* update README with new Copilot models and codebase indexing features ([f1dfca5](https://github.com/Hi7cl4w/diffy-explain-ai/commit/f1dfca5bffd3c997a0766d2bf8952573eee5987c))


### 💅 Styles

* apply code formatting and linting fixes ([4d73066](https://github.com/Hi7cl4w/diffy-explain-ai/commit/4d730665a8d21e72415a88858e566388b4219ac9))


### 🔧 Continuous Integration

* **release:** update workflow to use dynamic release body and automate changelog commits ([8cedee2](https://github.com/Hi7cl4w/diffy-explain-ai/commit/8cedee2d740b8ff5bfc035927b9d97362330a91e))

## [1.2.1](https://github.com/Hi7cl4w/diffy-explain-ai/compare/diffy-explain-ai-v1.2.0...diffy-explain-ai-v1.2.1) (2025-11-03)

### 💅 Styles

* **config:** format release-please configuration files ([b1bd5be](https://github.com/Hi7cl4w/diffy-explain-ai/commit/b1bd5beaab289834f0b8a2ffd86cf25aa185560b))

## [1.2.0](https://github.com/Hi7cl4w/diffy-explain-ai/compare/c11f9549a937b3ad7f01449f3e092741a1e9b98c...diffy-explain-ai-v1.2.0) (2025-11-03)

### ✨ Features

* Add 'DIFFY: Explain and Preview' command to package.json ([b214edd](https://github.com/Hi7cl4w/diffy-explain-ai/commit/b214eddb59780fac56d535304a6ce340ef018c1d))
* Add 'ExtensionContext' to Diffy class ([f2ad4b1](https://github.com/Hi7cl4w/diffy-explain-ai/commit/f2ad4b10ff2f05148ff6b37e696e3069932d3d35))
* Add 'No Changes' message ([82b3968](https://github.com/Hi7cl4w/diffy-explain-ai/commit/82b39686da0fb4f3307a7bb530ecefa13b283a04))
* Add automated GitHub release workflow with comprehensive documentation ([dbfafb7](https://github.com/Hi7cl4w/diffy-explain-ai/commit/dbfafb7f7d5db4c96daaf6455fdb7a4c9b998518))
* Add Biome as project linter and formatter ([a01ce71](https://github.com/Hi7cl4w/diffy-explain-ai/commit/a01ce7167bc87d4690ef2ad18cd772c18cb16a31))
* add Biome as the project linter and formatter ([0ecdc62](https://github.com/Hi7cl4w/diffy-explain-ai/commit/0ecdc626d884290abc7558f97006ceec0fe629e9))
* Add custom commit message template support with placeholders ([5ac67c0](https://github.com/Hi7cl4w/diffy-explain-ai/commit/5ac67c0d9a6a8377d3ef51bebfb2a52cb76e01a1))
* add Gemini configuration methods to WorkspaceService ([55cb2fa](https://github.com/Hi7cl4w/diffy-explain-ai/commit/55cb2faa886646e84255a52284583479ae5e96fd))
* add Google Gemini API dependency ([9dbc802](https://github.com/Hi7cl4w/diffy-explain-ai/commit/9dbc802cf62440e73072a2d697d7724454605181))
* add intelligent code indexing for AI commit generation ([b2f2393](https://github.com/Hi7cl4w/diffy-explain-ai/commit/b2f2393980b94809ea40c73c5538dae85bb96b14))
* add type-check script and update VS Code engine requirement ([ae582b8](https://github.com/Hi7cl4w/diffy-explain-ai/commit/ae582b876dc91f9db4115a3060fba7d456d52d8a))
* Add VS Code Language Model API integration ([87e0b20](https://github.com/Hi7cl4w/diffy-explain-ai/commit/87e0b200bdc0af4892c9775e1208233d77f907bc))
* Add VS Code Language Model API integration and Biome linting ([5bca5d6](https://github.com/Hi7cl4w/diffy-explain-ai/commit/5bca5d6cb653a175042539a0ce1e9dd275d66673))
* Add VS Code Language Model API integration and Biome linting ([98fbeb4](https://github.com/Hi7cl4w/diffy-explain-ai/commit/98fbeb441a61804fb4e7f2edcd1b258a5969e659))
* Added getDiffAndWarnUser() to GitService ([daee4a0](https://github.com/Hi7cl4w/diffy-explain-ai/commit/daee4a0746219c438c4549dfec0ab6f96ca9a7f6))
* Changed the getGitDiff call to the getDiffAndWarnUser call ([0db05e1](https://github.com/Hi7cl4w/diffy-explain-ai/commit/0db05e1f5d9da949858a27cce0c2889bce18b37a))
* Create WindowService class ([624d459](https://github.com/Hi7cl4w/diffy-explain-ai/commit/624d4592838b734de15ef18f8b802b93e5243797))
* Explain and Preview Changes of Staged Files ([bfc9108](https://github.com/Hi7cl4w/diffy-explain-ai/commit/bfc9108101801856c4feca9c0b1014800f1899b9))
* explainAndPreview() ([1b29733](https://github.com/Hi7cl4w/diffy-explain-ai/commit/1b2973373976b00937f06c37be066f1e127eb631))
* implement GeminiService for Google Gemini API integration ([5c6b9cc](https://github.com/Hi7cl4w/diffy-explain-ai/commit/5c6b9cca879e7b9e4820938bfeab63653e8e2bf2))
* integrate GeminiService into Diffy extension ([80e3af9](https://github.com/Hi7cl4w/diffy-explain-ai/commit/80e3af92c869298b8753e7d9caae00368e231948))
* **package.json:** update version to 1.0.15 ([95a50ae](https://github.com/Hi7cl4w/diffy-explain-ai/commit/95a50ae27d0cb1ab2ff0f84bb75384f7613e34ca))
* Set VS Code LLM (GitHub Copilot) as default AI provider ([b353a87](https://github.com/Hi7cl4w/diffy-explain-ai/commit/b353a87efb514c1c0602cbe22c0ce901cd7d630f))
* Update OpenAI Service to ([bfdf59d](https://github.com/Hi7cl4w/diffy-explain-ai/commit/bfdf59dc9c506eecd8b84fd85e8d5f01f8a20d50))
* warn user to stage ([0355228](https://github.com/Hi7cl4w/diffy-explain-ai/commit/0355228795f40593b31317753a15119c67e10112))

### 🐛 Bug Fixes

* Add logic to return null on OpenAiService error ([e45c5eb](https://github.com/Hi7cl4w/diffy-explain-ai/commit/e45c5eb4be0766028f56134c0e98cdc64d36a864))
* Added conditional statement to check for changes ([b6e9faa](https://github.com/Hi7cl4w/diffy-explain-ai/commit/b6e9faaac4c7903a74465dd9bf9f27e9ae593214))
* commit message generation improved ([506b424](https://github.com/Hi7cl4w/diffy-explain-ai/commit/506b424b4d09e3b2555a272c6c302bd685161daa))
* Ensure Promise rejection reasons are Error objects ([dc48f8a](https://github.com/Hi7cl4w/diffy-explain-ai/commit/dc48f8a86360fd752f0226be20940faac6aa45f0))
* getExplainedChanges Returns string or null ([de80941](https://github.com/Hi7cl4w/diffy-explain-ai/commit/de80941e3de61bcad747c8e4d1d662813693232d))
* Handle git repositories with submodules correctly ([0674002](https://github.com/Hi7cl4w/diffy-explain-ai/commit/0674002bd4d0a36c171ff25bb145e4c3a0ca5694))
* Handle git repositories with submodules correctly ([de66bfe](https://github.com/Hi7cl4w/diffy-explain-ai/commit/de66bfe302f03079b3dccde065b25ad8739e48c2)), closes [#14](https://github.com/Hi7cl4w/diffy-explain-ai/issues/14)
* OpenAI error handling ([e849178](https://github.com/Hi7cl4w/diffy-explain-ai/commit/e849178392a22f11bdc57aeda4b8d60a794fe330))
* Properly handle promises to prevent unhandled rejections ([7a47650](https://github.com/Hi7cl4w/diffy-explain-ai/commit/7a4765059d4302698495b546119216d9828f4d8f))
* Resolve TypeScript issues in test suite ([c5addb0](https://github.com/Hi7cl4w/diffy-explain-ai/commit/c5addb0a430b5a76df40b6fdd6bf6fd9874cd097))
* Update type definitions for better type safety ([774cbf2](https://github.com/Hi7cl4w/diffy-explain-ai/commit/774cbf205ac6a5dde8567dc9179efb7a82c39cf3))
* Update VS Code API usage for compatibility with v1.90.0 ([c44a740](https://github.com/Hi7cl4w/diffy-explain-ai/commit/c44a74091caafa45f62d9d2a3a98ec86450a16ac))
* warning not shown when there is no changes ([1f31528](https://github.com/Hi7cl4w/diffy-explain-ai/commit/1f3152881fcd9c51645f7149485465d046d8225e))
* warning not shown when there is no changes ([c07ca89](https://github.com/Hi7cl4w/diffy-explain-ai/commit/c07ca89022038c75b21c33e71314c42a6f77f55b))
* windows is not updating after first call ([aea8186](https://github.com/Hi7cl4w/diffy-explain-ai/commit/aea81865c57d0e3ca787ca0cad0723eb5c3c4ed6))

### 💅 Styles

* Apply Biome formatting to all files ([4af1f48](https://github.com/Hi7cl4w/diffy-explain-ai/commit/4af1f48ee3eddf1ae80b087a92bd0b5ee8d3b3fc))
* Format configuration files with consistent style ([4aa09f3](https://github.com/Hi7cl4w/diffy-explain-ai/commit/4aa09f370adbf05024aabecebdf38ba35f946610))
* reformat package.json with proper indentation ([19721da](https://github.com/Hi7cl4w/diffy-explain-ai/commit/19721da16d8a86337dcaf4a1b9966d5b203a01de))
* reformat package.json with proper indentation ([c7d74aa](https://github.com/Hi7cl4w/diffy-explain-ai/commit/c7d74aae457ed8039b81477c22b8159ef90abf6a))

### ♻️ Code Refactoring

* Change fields to private ([82507ec](https://github.com/Hi7cl4w/diffy-explain-ai/commit/82507ec03f1be2c760360ab77ec9ec2e09964707))
* Changed the context to required in Diffy class ([9654243](https://github.com/Hi7cl4w/diffy-explain-ai/commit/9654243b440520b9de69637c51809d3e7ae6a862))
* fix explicit type declarations ([3ec3c2c](https://github.com/Hi7cl4w/diffy-explain-ai/commit/3ec3c2c7ee4e2dcd255e5489fdad51ec674a2a58))
* fix explicit type declarations ([894ee2a](https://github.com/Hi7cl4w/diffy-explain-ai/commit/894ee2a06c8e500175d53e07770345af3877a856))
* fix explicit type declarations ([8d26db9](https://github.com/Hi7cl4w/diffy-explain-ai/commit/8d26db9f8a2912449cddea323bf4895ea0b754ab))
* fix explicit type declarations ([f6a2a52](https://github.com/Hi7cl4w/diffy-explain-ai/commit/f6a2a521ac8e15e34896b0c5df1a91a38f76bd0b))
* Fix singleton pattern in service constructors ([6ae9a54](https://github.com/Hi7cl4w/diffy-explain-ai/commit/6ae9a548bba20a6f4ff6c0f303075ec174314d2e))
* Fix singleton patterns and code formatting in services ([307c4c1](https://github.com/Hi7cl4w/diffy-explain-ai/commit/307c4c19f0ada872d799132df5b7e514c8e9bb76))
* Generate commit message to SCM with progress ([90feef9](https://github.com/Hi7cl4w/diffy-explain-ai/commit/90feef90802c40390a6d0362392fce796babd3c0))
* git service ([8af23c8](https://github.com/Hi7cl4w/diffy-explain-ai/commit/8af23c86c55d74164fc705f3977205f51040ddee))
* import window from vscode ([2a70438](https://github.com/Hi7cl4w/diffy-explain-ai/commit/2a70438ec574f72261c918fffbc8867327fcee3c))
* Increase max tokens from 256 to 2000 ([901eee1](https://github.com/Hi7cl4w/diffy-explain-ai/commit/901eee15ad743e7bbf28f5eeabb59ea7da86dc84))
* Increase max_tokens and tweak prompt formatting ([49dd7c8](https://github.com/Hi7cl4w/diffy-explain-ai/commit/49dd7c8f32af88114ec9c462ad0b75f288800ffb))
* Modernize test files with node: protocol and formatting ([d255e8e](https://github.com/Hi7cl4w/diffy-explain-ai/commit/d255e8e02a882659133315cee24717b67798bbd5))
* open ai request ([f4cc2f4](https://github.com/Hi7cl4w/diffy-explain-ai/commit/f4cc2f41726b392998fa61808e80c1164f50b922))
* optimized imports Diffy ([6e98ca2](https://github.com/Hi7cl4w/diffy-explain-ai/commit/6e98ca2df74438cf4c34026d74a29528ac24226e))
* optimized imports WorkspaceService ([26109ff](https://github.com/Hi7cl4w/diffy-explain-ai/commit/26109ff110e4abc03a5b532ef694a1474afa03bf))
* remove ESLint, use Biome exclusively ([0acf5d1](https://github.com/Hi7cl4w/diffy-explain-ai/commit/0acf5d12d3d1c16c35165c4a9e614a0e45b084d4))
* remove unnecessary async/await from command handler ([5a32cf6](https://github.com/Hi7cl4w/diffy-explain-ai/commit/5a32cf68367a5567711030e945f897c0d2eac4c3))
* Remove unnecessary async/await from command handlers ([f65ea2b](https://github.com/Hi7cl4w/diffy-explain-ai/commit/f65ea2bca8fc8747d38b58ba6d811942cd190d96))
* Removed import lines for simpleGit, OpenAI, Axios, and Repository ([5a0760e](https://github.com/Hi7cl4w/diffy-explain-ai/commit/5a0760e6f2d98e6ddaecd251747657466728de9d))
* Replace all 'any' types with proper type definitions ([f8f42b5](https://github.com/Hi7cl4w/diffy-explain-ai/commit/f8f42b5f34cc8d40454b8344d700ccbe1054daca))
* Replace any type with proper Mocha import syntax ([f3677ff](https://github.com/Hi7cl4w/diffy-explain-ai/commit/f3677ff63aecef3f67e781ac45b5d899430bff82))
* Replace hardcoded param with optional ([297e14e](https://github.com/Hi7cl4w/diffy-explain-ai/commit/297e14e0a6b6dbeb4c8ec60bca1237eac5d6993b))
* replace template strings with regular string literals ([0d68c23](https://github.com/Hi7cl4w/diffy-explain-ai/commit/0d68c238540ae78144fac875b2963ffc4ef70a09))
* replace template strings with regular string literals ([b75d2a9](https://github.com/Hi7cl4w/diffy-explain-ai/commit/b75d2a954045a30c021ff8938a5d690d6e4a0934))
* suggested message as newline instead of space ([201891a](https://github.com/Hi7cl4w/diffy-explain-ai/commit/201891a41771a877e77b1a9f37f79e457a958951))
* **types:** reorder imports in git.d.ts for consistency ([4ff48ac](https://github.com/Hi7cl4w/diffy-explain-ai/commit/4ff48ac6ee49cd7aa267bd49f2571d0e1248dc50))
* Update OpenAiService ([0a497b5](https://github.com/Hi7cl4w/diffy-explain-ai/commit/0a497b52c9ca7f2ba0556ad038d980ae721fbcb3))
* Update version of @types/vscode ([6b25fce](https://github.com/Hi7cl4w/diffy-explain-ai/commit/6b25fcecdb155a01fad90343548cd54eb93eee96))
* Update version of @types/vscode ([775fa20](https://github.com/Hi7cl4w/diffy-explain-ai/commit/775fa20cc69cca1dd2e6c3175f4d2094f93b1088))

## [1.1.0] - 2025-11-03

### Added

* **VS Code Language Model API Integration**: Support for GitHub Copilot as an AI service provider
* New configuration option `aiServiceProvider` to choose between OpenAI and VS Code LM
* New configuration option `vscodeLmModel` to select between `copilot-gpt-4o` and `copilot-gpt-3.5-turbo`
* Dual AI provider architecture allowing users to switch between OpenAI API and GitHub Copilot

### Changed

* Updated VS Code engine requirement to ^1.90.0 for Language Model API support
* Improved singleton pattern implementation in service classes
* Modernized imports with `node:` protocol for Node.js built-in modules
* Enhanced type safety with better TypeScript type definitions

### Fixed

* Fixed singleton constructor patterns in OpenAiService, WorkspaceService, and VsCodeLlmService
* Fixed confusing void type in EventEmitter type definitions
* Removed unused variables and parameters warnings

### Documentation

* Updated README with instructions for both OpenAI and GitHub Copilot setup
* Added comprehensive configuration guide for dual AI provider support

## [Unreleased]

### 🩹 Fixes

* Correct changelog comparison links to match actual git tags ([ccf5cab](https://github.com/Hi7cl4w/diffy-explain-ai/commit/ccf5cab))

### 📖 Documentation

* Update changelog formatting for older versions and fix lint errors ([d5ca660](https://github.com/Hi7cl4w/diffy-explain-ai/commit/d5ca660))

## [0.0.6] - 2022-12-24

### Added

* Generate Commit Message.
* Explain Changes in Natural Language.
* Directly Generate Commit Message to VScode git commit input box. Copy to Clipboard

## [0.0.7] - 2022-12-24

### Fixed

* Commit Message Generation Improved

## [0.0.8] - 2022-12-24

### Changes

* Suggested Message as Newline Instead of Space

## [0.0.9] - 2022-12-24

### Added

* Explain and Preview Changes of Staged Files

### Bug Fixes

* Bug Fixes

## [0.0.10] - 2022-12-24

### Additional Bug Fixes

* Bug Fixes
