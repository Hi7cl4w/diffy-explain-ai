# Change Log

All notable changes to the "diffy-explain-ai" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.2.0](https://github.com/Hi7cl4w/diffy-explain-ai/compare/diffy-explain-ai-v1.1.0...diffy-explain-ai-v1.2.0) (2025-11-03)


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


### 📝 Documentation

* jsdoc for getCommitMessageFromDiff ([4d84356](https://github.com/Hi7cl4w/diffy-explain-ai/commit/4d84356555d649b779c5136d8c20140d50825014))
* Update CHANGELOG for version 1.1.0 ([b3b7b20](https://github.com/Hi7cl4w/diffy-explain-ai/commit/b3b7b201cd9e6878267167aec6aca48cabf7643e))
* Update README with VS Code Language Model integration ([de45e2e](https://github.com/Hi7cl4w/diffy-explain-ai/commit/de45e2e3ec329f582115af39c55891fb0128a540))


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


### 🔧 Build System

* Bump version to 0.0.12 ([c0bd96e](https://github.com/Hi7cl4w/diffy-explain-ai/commit/c0bd96e7617e9d3d6adbebcc054e7c860feff749))
* Bump version to 0.0.19 ([145326e](https://github.com/Hi7cl4w/diffy-explain-ai/commit/145326e97bc8611ea8807a640e0f64ca0e75aba8))
* Bump version to 0.0.20 ([fcdec4b](https://github.com/Hi7cl4w/diffy-explain-ai/commit/fcdec4b90c603b906507314e05c4b5a6f4bfa1a7))
* Bump version to 0.0.21 ([add78cd](https://github.com/Hi7cl4w/diffy-explain-ai/commit/add78cdcdc637128a9a1d9381e2b966311279909))
* Bump version to 0.0.22 ([97f9456](https://github.com/Hi7cl4w/diffy-explain-ai/commit/97f94564a9ab9e64bb54438f641e47436844ef2f))
* Bump version to 0.0.23 ([c2ce6e8](https://github.com/Hi7cl4w/diffy-explain-ai/commit/c2ce6e8c7eade7b591bf75dcd530e285481f1385))
* Bumped version in package.json to 0.0.10 ([2a80d0f](https://github.com/Hi7cl4w/diffy-explain-ai/commit/2a80d0f0f71afdc3dee594cf57b7f9792dc414e0))
* Bumped version to 0.0.11 ([4462d99](https://github.com/Hi7cl4w/diffy-explain-ai/commit/4462d9949d9a2585a9e69d32b9051b403bca246c))
* Bumped version to 0.0.9 ([5d9cd32](https://github.com/Hi7cl4w/diffy-explain-ai/commit/5d9cd323b79e2cde234df8e7b6ef34c44d11d94c))
* Bumped version to 0.0.9 ([8f4a8c8](https://github.com/Hi7cl4w/diffy-explain-ai/commit/8f4a8c8453e9796eb8a61c8cff4984db01e1f94b))
* **deps-dev:** bump webpack from 5.75.0 to 5.76.0 ([433036e](https://github.com/Hi7cl4w/diffy-explain-ai/commit/433036ee6cd73fbc4036710ad2818c218059ac16))
* **deps-dev:** bump webpack from 5.75.0 to 5.76.0 ([dae56b1](https://github.com/Hi7cl4w/diffy-explain-ai/commit/dae56b1d75af7deafdaaddedf2f8f6d07feac744))
* **deps-dev:** bump word-wrap from 1.2.3 to 1.2.4 ([99917f8](https://github.com/Hi7cl4w/diffy-explain-ai/commit/99917f8840175e5122de7c7a2bb1f65b0a8c767d))
* **deps-dev:** bump word-wrap from 1.2.3 to 1.2.4 ([6e985ca](https://github.com/Hi7cl4w/diffy-explain-ai/commit/6e985ca5f46ab49e7594d82f0dc20c492d6e6e51))
* **deps:** bump @babel/runtime from 7.22.5 to 7.28.4 ([b2afed7](https://github.com/Hi7cl4w/diffy-explain-ai/commit/b2afed797bd066d00df8d6c58edea49b9afa8607))
* **deps:** bump @babel/runtime from 7.22.5 to 7.28.4 ([f543c3b](https://github.com/Hi7cl4w/diffy-explain-ai/commit/f543c3b97b34383f02012a217c858cda3de3d2df))
* **deps:** bump axios from 1.2.1 to 1.6.0 ([feca596](https://github.com/Hi7cl4w/diffy-explain-ai/commit/feca596edfa23987e0eee1fee9a0cd574965e301))
* **deps:** bump axios from 1.2.1 to 1.6.0 ([da817b9](https://github.com/Hi7cl4w/diffy-explain-ai/commit/da817b9609b2dd8830704f36d81d150b503cbd0b))
* **deps:** bump axios from 1.8.4 to 1.12.0 ([d03f9bf](https://github.com/Hi7cl4w/diffy-explain-ai/commit/d03f9bf2e9eda7d1e6e75fdbc16faf1d8cf3f966))
* **deps:** bump axios from 1.8.4 to 1.12.0 ([1e7dd12](https://github.com/Hi7cl4w/diffy-explain-ai/commit/1e7dd128d61e652e029b51c7c10c2be401e2ca68))
* **deps:** bump follow-redirects from 1.15.2 to 1.15.4 ([bde14a1](https://github.com/Hi7cl4w/diffy-explain-ai/commit/bde14a1b8168d908757d23052416db64facf998d))
* **deps:** bump follow-redirects from 1.15.2 to 1.15.4 ([2ed2fcf](https://github.com/Hi7cl4w/diffy-explain-ai/commit/2ed2fcfdfd408fcc081286b384dc5d5c8e40a5e4))
* **deps:** bump follow-redirects from 1.15.4 to 1.15.6 ([64890f9](https://github.com/Hi7cl4w/diffy-explain-ai/commit/64890f9dbe9248d0d06056dc1b7c1215bc599596))
* **deps:** bump follow-redirects from 1.15.4 to 1.15.6 ([0d37d2a](https://github.com/Hi7cl4w/diffy-explain-ai/commit/0d37d2a8d6446dce739c47363c2e44ccef485820))
* **deps:** bump simple-git from 3.15.1 to 3.16.0 ([144a35f](https://github.com/Hi7cl4w/diffy-explain-ai/commit/144a35f61c75b8413640a7bc9f05c32d1121a442))
* **deps:** bump simple-git from 3.15.1 to 3.16.0 ([899a1f2](https://github.com/Hi7cl4w/diffy-explain-ai/commit/899a1f223ddc16e082db00ba62491bc68bf0d685))
* **deps:** update Node.js types and add undici types ([4233b38](https://github.com/Hi7cl4w/diffy-explain-ai/commit/4233b382fcf8777d9f8b6412411dbb77198742ea))
* version bumped  to 0.0.14 ([a246210](https://github.com/Hi7cl4w/diffy-explain-ai/commit/a246210b9f2db8c4a3be6afcc4ab04239ca847c0))
* version bumped  to 0.0.24 ([d56aedf](https://github.com/Hi7cl4w/diffy-explain-ai/commit/d56aedf0c354d671e5dd5ee94e61df4a68f0f5e5))
* version bumped to 0.0.12 ([32eba9f](https://github.com/Hi7cl4w/diffy-explain-ai/commit/32eba9fa4d420e496170d3ad945020e9cbf6e1c2))
* version bumped to 0.0.13 ([d9f2b66](https://github.com/Hi7cl4w/diffy-explain-ai/commit/d9f2b6690eff7c304091a5c44439169a2d9f2408))
* version bumped to 1.0.3. ([3b602d3](https://github.com/Hi7cl4w/diffy-explain-ai/commit/3b602d3f730e284b5722ee8923190af12c6253ba))


### 🔧 Continuous Integration

* add type-check to CI workflow ([051e966](https://github.com/Hi7cl4w/diffy-explain-ai/commit/051e9669ae8b455a0dfe879455ed8dffdeab052a))
* always bump version for publishing to avoid marketplace conflicts ([e388ee9](https://github.com/Hi7cl4w/diffy-explain-ai/commit/e388ee944ed4f131cc23ff72a7fd15a2bf9484a0))
* update release workflow to handle protected branches with PRs ([6f79bd9](https://github.com/Hi7cl4w/diffy-explain-ai/commit/6f79bd96c1e92382b24a63fc24fade641f9ed11c))
* **workflows:** always bump patch version in release workflow ([50eae91](https://github.com/Hi7cl4w/diffy-explain-ai/commit/50eae91a435d0a5804175a60b9b210f961a68266))
* **workflows:** migrate release workflow to use release-please ([19a350a](https://github.com/Hi7cl4w/diffy-explain-ai/commit/19a350a356dbc807dc8d99341aadbfc11fda454d))
* **workflows:** update supported Node.js versions ([2ab275f](https://github.com/Hi7cl4w/diffy-explain-ai/commit/2ab275fc0249324071d60ddf1410a14340d1b2c4))

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
