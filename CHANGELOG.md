# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
- better handle weird edgecases when copying from word

### Internal
- use `github.token` for github checkout action
### Dependencies
- Bumps `prosemirror-view` from 1.31.3 to 1.31.4
- Bumps `xml-formatter` from 3.3.2 to 3.4.1
- Bumps `@types/uuid` from 9.0.1 to 9.0.2
### Changed
- fix woodpecker syntax
- replacement of github ensure-changelog action by changelog check in woodpecker CI
- `SayController::setHtmlContent` can now receive `shouldFocus` option which determines whether editor will be focused or not after calling `setHtmlContent`. Defaults to `true` for back compatibility.

## [3.9.0] - 2023-06-18

### Added
- add pr template
- add ability to completely override plugin array
- Addition of `getGroups` and `hasGroups` utility functions
### Dependencies
- Bumps `@codemirror/state` from 6.2.0 to 6.2.1
- Bumps `sinon` from 15.0.4 to 15.1.2
- Bumps `prettier` from 2.8.7 to 2.8.8
- Bumps `webpack` from 5.86.0 to 5.87.0
- Bumps `prosemirror-tables` from 1.3.2 to 1.3.3
- Bumps `@types/ember__error` from 4.0.2 to 4.0.3
- Bumps `@ember/test-helpers` from 2.9.3 to 2.9.4
- Bumps `@codemirror/lang-html` from 6.4.3 to 6.4.4
- Bumps `@appuniversum/ember-appuniversum` from 2.5.0 to 2.7.0

## [3.8.1] - 2023-06-13

### Dependencies
- Bumps `caniuse-lite` to 1.0.30001492
- Bumps `ember-focus-trap` from 1.0.1 to 1.0.2
- Bumps `ember-velcro` to 2.1.0
- Pin `typescript` to 5.0.x
- Bumps `prosemirror-state` from 1.4.2 to 1.4.3
- Bumps `eslint` from 8.38.0 to 8.42.0
- Bumps `release-it` from 15.10.1 to 15.11.0
- Bumps `@typescript-eslint/parser` from 5.59.2 to 5.59.9
- Bumps `eslint-plugin-ember` from 11.5.2 to 11.8.0
- Bumps `prosemirror-keymap` from 1.2.1 to 1.2.2
- Bumps `webpack` from 5.81.0 to 5.86.0
- Bumps `prosemirror-transform` from 1.7.1 to 1.7.3
- Bumps `@codemirror/view` from 6.13.0 to 6.13.1
- Bumps `@codemirror/view` from 6.10.1 to 6.13.1
- Bumps `prosemirror-inputrules` from 1.2.0 to 1.2.1
- Bumps `@types/debug` from 4.1.7 to 4.1.8
- Bumps `iter-tools` from 7.5.1 to 7.5.3
- Bumps `@typescript-eslint/eslint-plugin` from 5.59.5 to 5.59.11
- Bumps `prosemirror-commands` from 1.5.1 to 1.5.2
- Bumps `prosemirror-schema-list` from 1.2.2 to 1.3.0

## [3.8.0] - 2023-05-31
### Added
- Allow the parent component to get the innerView in Embedded Editor
### Dependencies
- Bumps `prosemirror-view` from 1.30.2 to 1.31.3
- Bumps `prosemirror-history` from 1.3.0 to 1.3.2
- Bumps `prosemirror-gapcursor` from 1.3.1 to 1.3.2
- Bumps `prosemirror-model` from 1.19.0 to 1.19.2

## [3.7.2] - 2023-05-30
### Dependencies
- Bumps `vm2` from 3.9.17 to 3.9.19
- Bumps `ember-template-lint` from 5.7.2 to 5.7.3
- Bumps `dompurify` from 3.0.1 to 3.0.3
- Bumps `socket.io-parser` from 4.2.1 to 4.2.3
- Bumps `engine.io` from 6.2.1 to 6.4.2
- Bumps `socket.io` from 4.5.4 to 4.6.1
- Bumps `prosemirror-dropcursor` from 1.8.0 to 1.8.1
### Fixed
- Annotation UX not present for some structures

## [3.7.1] - 2023-05-17
### Fixed
- Show correct import for heading node in documentation
- Whitespace is not removed in table headers
- correct woodpecker secret indentation

## [3.7.0] - 2023-05-12
### Dependencies
- Bumps `sass` from 1.62.0 to 1.62.1
- Bumps `@typescript-eslint/eslint-plugin` from 5.59.0 to 5.59.5
### Added
- Update `EmberNodeConfig` type

## [3.6.0] - 2023-05-04

### Added
- Addition of list inputrules
- Possibility to pass `ignoreMutation` to the EmberNodeSpec when creating Ember Nodes
### Fixed
- Also observe responsive toolbar children for resize
- Solve bug with cursor in front a multiple line link
- Add color mark to dummy-plugins schema
- Use `flex-start` instead of `start` as justify-content value
- Backspace into nested list


### Changed
- Ensure the list toggle button removes selected content completely out of all lists when untoggling
### Dependencies
- Bumps `@typescript-eslint/parser` from 5.58.0 to 5.59.2
- Bumps `@typescript-eslint/parser` from 5.55.0 to 5.59.2
- Bumps `linkifyjs` from 4.1.0 to 4.1.1
- Bumps `@appuniversum/ember-appuniversum` from 2.4.2 to 2.5.0
- Bumps `vm2` from 3.9.16 to 3.9.17
- Bumps `vm2` from 3.9.15 to 3.9.17
- Bumps `vm2` from 3.9.12 to 3.9.16
- Bumps `typescript` from 4.9.5 to 5.0.4
- Bumps `sinon` from 15.0.3 to 15.0.4
- Bumps `sinon` from 15.0.2 to 15.0.4
- Bumps `eslint-plugin-deprecation` from 1.3.3 to 1.4.1
- Bumps `@typescript-eslint/eslint-plugin` from 5.58.0 to 5.59.0
- Bumps `@typescript-eslint/eslint-plugin` from 5.57.1 to 5.59.0
- Bumps `eslint` from 8.36.0 to 8.38.0
- Bumps `webpack` from 5.79.0 to 5.81.0
- Bumps `webpack` from 5.76.2 to 5.81.0
- Bumps `ember-template-lint` from 5.7.1 to 5.7.2
- Bumps `eslint-config-prettier` from 8.7.0 to 8.8.0
- Bumps `@codemirror/view` from 6.9.4 to 6.10.1
- Bumps `@codemirror/view` from 6.9.3 to 6.10.1
- Bumps `sass` from 1.59.3 to 1.62.0
- Bumps `@codemirror/lang-html` from 6.4.2 to 6.4.3
- Bumps `ember-auto-import` from 2.6.1 to 2.6.3
- Bumps `release-it` from 15.9.0 to 15.10.1
- Bumps `eslint-plugin-ember` from 11.4.8 to 11.5.2
- Bumps `@types/qunit` from 2.19.4 to 2.19.5

## [3.5.0] - 2023-04-07
### Added
- Added the possibility to use Insert Card as open by default

### Fixed:
- Add unique id package missing

### Dependencies
- Bumps `prettier` from 2.8.4 to 2.8.7
- Bumps `@typescript-eslint/eslint-plugin` from 5.55.0 to 5.57.1
- Bumps `@codemirror/view` from 6.9.2 to 6.9.3

### Fixed:
- Support SVG without height/width
- Validate the URL when inserting an image

## [3.4.1] - 2023-03-27

### Dependencies
- bump prosemirror dependencies to latest
 
## [3.4.0] - 2023-03-23

### Added:
- Addition of a `ResponsiveToolbar` component which takes into account container and screen size.
- Addition of a color highlighting mark and toolbar menu
- Addition of a toolbar menu which allows for inserting an image given it's URL.
- Support for resizable images
- Addition of an optional stopEvent attribute which can be provided when configuring an ember-node, it can be used to override the default behaviour of the stopEvent attribute of the ember-node node-view.
- Addition of a text color mark
- Required parts of `AuPill` extracted into `Pill` component

### Fixed:
- embedded-editor: only set data-placeholder when placeholder argument is supplied
- toolbar: add missing missing toolbar divider styles
- Fix switching unordered list to ordered and applying correct styling
- ember-node: Fix cursor placement inside of `ember-node` when navigating from left
- Un-indent paragraph on backspace at the front of paragraph
- Change `EmberNode` "inline" style to be `inline-block` to avoid pushing away surrounding content
- Change `outline` for `Link` "ember-node" to have `outline-offset` `-2px` for it not to cover nearby content when focused
- fix backspacing into link nodes on firefox
- When the `prosemirror-invisibles` is enabled, an `undefined` is no longer thrown on some occasions
- More clear handling of delete at end of rdfa-block

### Changed:
- disable broken firefox cursor fix plugin
- usage of ember-velcro for toolbar-dropdown component
- remove support for base64 images
- Improve appearance of fake firefox cursor
 
### Dependencies
- Bumps `@codemirror/lang-html` from 6.4.1 to 6.4.2
- Bumps `@codemirror/view` from 6.9.1 to 6.9.2
- Bumps `@types/dompurify` from 2.4.0 to 3.0.0
- Bumps `@typescript-eslint/eslint-plugin` from 5.50.0 to 5.55.0
- Bumps `@typescript-eslint/parser` from 5.54.0 to 5.55.0
- Bumps `dompurify` from 3.0.0 to 3.0.1
- Bumps `ember-template-lint` from 5.7.0 to 5.7.1
- Bumps `ember-template-lint` from 5.6.0 to 5.7.1
- Bumps `ember-template-lint` from 5.3.3 to 5.7.0
- Bumps `eslint-config-prettier` from 8.6.0 to 8.7.0
- Bumps `eslint-plugin-ember` from 11.4.6 to 11.4.8
- Bumps `eslint` from 8.29.0 to 8.36.0
- Bumps `prosemirror-commands` from 1.5.0 to 1.5.1
- Bumps `prosemirror-dropcursor` from 1.7.0 to 1.7.1
- Bumps `prosemirror-view` from 1.30.1 to 1.30.2
- Bumps `release-it` from 15.8.0 to 15.9.0
- Bumps `release-it` from 15.7.0 to 15.9.0
- Bumps `sass` from 1.58.3 to 1.59.3
- Bumps `sinon` from 15.0.1 to 15.0.2
- Bumps `webpack` from 5.76.1 to 5.76.2
- Bumps `webpack` from 5.75.0 to 5.76.2
- Bumps `xml-formatter` from 3.3.0 to 3.3.2

## [3.3.0] - 2023-03-02
### Added
- Addition of a formatting toggle component which allows showing formatting marks
- Addition of linkPasteHandler plugin which detects and converts links in pasted content
### Changed
- Disable toolbar buttons when not applicable instead of hiding them
- Use the new view pasteHTML method inside the Word paste handler.
- Updated selection background-color of selections inside highlighted elements
### Dependencies
- Bumps `@embroider/test-setup` from 1.8.3 to 2.1.1
- Bumps `@typescript-eslint/parser` from 5.50.0 to 5.54.0
- Bumps `tracked-built-ins` from 3.1.0 to 3.1.1
- Bumps `ember-qunit` from 6.1.1 to 6.2.0
- Bumps `prettier` from 2.8.3 to 2.8.4
- Bumps `minimist` from 0.2.2 to 0.2.4
- Bumps `release-it` from 15.6.0 to 15.7.0
- Bumps `prosemirror-keymap` from 1.2.0 to 1.2.1
- Bumps `@codemirror/view` from 6.7.3 to 6.9.1

### Fixed
- Inherit ordered list style correctly 
- Fixed white-space issue in links
- Fix issue with parsing links from pasted html

## [3.2.1] - 2023-02-28
### Fixed
- Fix `ember.js` 3.28 compatibility issue
### Dependencies
- Bumps `@codemirror/lang-xml` from 6.0.1 to 6.0.2
- Bumps `prosemirror-dropcursor` from 1.6.1 to 1.7.0

## [3.2.0] - 2023-02-27

### Added
- Addition of the paragraph/heading indentation functionality

### Fixed
- Add padding to rdfa-toggle
- Fix shrinking issue with toolbar groups
- Fix disappearing cursor problems in firefox

### Deprecated
- Usage of `Plugins::List::IndentationControls`, use `Plugins::Indentation::IndentationMenu` instead.
### Dependencies
- Bumps `@types/uuid` from 9.0.0 to 9.0.1
- Bumps `sass` from 1.58.0 to 1.58.3
- Bumps `prosemirror-schema-basic` from 1.2.0 to 1.2.1
- Bumps `ember-auto-import` from 2.6.0 to 2.6.1
- Bumps `prosemirror-view` from 1.29.2 to 1.30.1

## [3.1.0] - 2023-02-24

### Changed
- export link nodes in the plugin and deprecate the other import

### Removed
- Removed `ember-cli-app-version` package

### Dependencies
- Add `ember-cli-sass` 11.0.1 as peerdependency
- Bumps `typescript` from 4.9.3 to 4.9.5
- Bumps `@codemirror/state` from 6.1.4 to 6.2.0


## [3.0.0] - 2023-02-23

### Added
- Handle ctrl click on links
- Add ordered list feature.
  Adds the button and appropriate toggling behavior when combined with unordered lists
  Also includes some needed css fixes
- Addition of interactive link node
- Add tab key handler to indent/unindent list items
- Add eslint-plugin-deprecation package to check for use of deprecated code.
- Disable undo and redo button when there's no more steps
- Add support for ordered list styles
- Added the ability to pass optional attributes to the `toggleList` command.
- Addition of spacing between paragraphs/tables and other elements.
- Added features to add table headings

### Changed
- Increase left-padding of lists
- BREAKING: Rename Toolbar::Icon to Toolbar::Button
- remove overflow: hidden on editor container div
- Replace drone by woodpecker
- Modernize toolbar dropdown
- BREAKING: Rework how widgets are passed to the editor
- BREAKING: Rename of the editor component: `Rdfa::RdfaEditor` to `Editor`
- BREAKING: Removal of the `RdfaEditorWithDebug` component, use `DebugTools` instead.
- BREAKING: Removal of `toolbarOptions` argument of the editor component
- BREAKING: Removal of `widgets` argument of the editor component
- BREAKING: Rework how embedded views are accessed and operated on from the controller
- Allow users to set a cursor by clicking in the margin of the editor


### Fixed
- Modify the base keymaps to better support macos users
- Replace text marks in another way in attribute generation plugin to fix cursor jumping
- Keep selection on the document when toggling annotations
- Fix shrinking issues with toolbar buttons and dropdowns
- Fix sidebar area not clickable when sidebar is hidden
- Fix alignment of table buttons
- Only allow paragraphs and lists in the list items

### Removed
- BREAKING: removal of `RdfaEditorPlugin` class
- BREAKING: removal of `toggleMark` controller method, use `doCommand` in combination with the `toggleMark` or `toggleMarkAddFirst` commands instead

### Dependencies
- Bumps `@appuniversum/ember-appuniversum` from 2.2.0 to 2.4.2
- Bumps `@codemirror/lang-html` from 6.4.1 to 6.4.2
- Bumps `@codemirror/lang-xml` from 6.0.1 to 6.0.2
- Bumps `@codemirror/state` from 6.1.4 to 6.2.0
- Bumps `@codemirror/view` from 6.7.3 to 6.9.1
- Bumps `@types/uuid` from 9.0.0 to 9.0.1
- Bumps `@typescript-eslint/eslint-plugin` from 5.50.0 to 5.53.0
- Bumps `@typescript-eslint/parser` from 5.50.0 to 5.53.0
- Bumps `dompurify` from 2.4.1 to 3.0.0
- Bumps `ember-cli-app-version` from 5.0.0 to 6.0.0
- Bumps `ember-template-lint` from 5.3.3 to 5.5.1
- Bumps `eslint` from 8.29.0 to 8.34.0
- Bumps `prettier` from 2.8.3 to 2.8.4
- Bumps `prosemirror-dropcursor` from 1.6.1 to 1.7.0
- Bumps `prosemirror-keymap` from 1.2.0 to 1.2.1
- Bumps `prosemirror-schema-basic` from 1.2.0 to 1.2.1
- Bumps `prosemirror-view` from 1.29.2 to 1.30.1
- Bumps `sass` from 1.58.0 to 1.58.3
- Bumps `sinon` from 14.0.2 to 15.0.1
- Bumps `tracked-built-ins` from 3.1.0 to 3.1.1
- Bumps `typescript` from 4.9.3 to 4.9.5
- Bumps `xml-formatter` from 2.6.1 to 3.3.0


## [2.1.4] - 2023-02-23

### Fixed
- move ember-intl config in editor constructor to beforeModel hook

## [2.1.3] - 2023-02-09

### Fixed

- fix paragraph parsing rule so paragraphs are skipped when they contain block content, not inline content.

## [2.1.2] - 2023-02-07

### Fixed

- skip paragraph parsing when they contain (erroneous) block content

Some existing documents erroneously contain block elements inside `p` tags, most notably tables.
These got ignored before and parsed as flat text. Now we detect this case and skip the paragraph.

- remove lump-node css

Now that all tables are editable, we don't need this anymore.

## [2.1.1] - 2023-02-07

### Fixed

- Preserve whitespace when parsing an html document

### Added

- addition of an attribute generation plugin which auto-generates specific missing attributes.

## [2.1.0] - 2023-02-06

### Fixed

- Fix space insertion in table cells
- Fix delete and backspace selecting the whole table when inside of one

### Added

- add canSpec property to nodespecs which is checked before splitting the node with enter

### Changed

- Update and modernize README.

### Added
- A deprecation eslint rule using the eslint-plugin-deprecation package.

### Deprecated
- Usage of `ProseController.view`, use `ProseController.getView` instead.
- Usage of `ProseController.state`, use `ProseController.getState` instead.
- Usage of `ProseController.checkAndDoCommand`, use `ProseController.doCommand` instead.
- Usage of `NodeConfig`, `MarkConfig`, `PluginConfig`, `ResolvedPluginConfig` and `RdfaEditorPlugin`
- Usage of the string-based version of `toggleMark`, use the `MarkType`-based version instead.

## [2.0.1] - 2023-02-02

### Fixed

- Fix wrapping of spaces at line end

### Dependencies

- Bumps `eslint-plugin-ember` from 11.2.1 to 11.4.6
- Bumps `prosemirror-transform` from 1.7.0 to 1.7.1
- Bumps `@types/uuid` from 8.3.4 to 9.0.0
- Bumps `iter-tools` from 7.5.0 to 7.5.1

## [2.0.0] - 2023-02-01

### Added

- add a plugin to enable regeneration of UUIDs on paste #556

### Changed

- BREAKING 💥: findNodes now takes an arg object and supports an end position #564
- Upgrade ember-source to 4.8.2-lts. #568
- build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.48.2 to 5.50.0 #576
- build(deps-dev): bump @typescript-eslint/parser from 5.45.1 to 5.50.0 #575
- build(deps-dev): bump sass from 1.56.1 to 1.58.0 #574
- build(deps-dev): bump qunit from 2.19.3 to 2.19.4 #573
- build(deps): bump @codemirror/view from 6.7.0 to 6.7.3 #569

### Removed

- BREAKING 💥: Drop official support for node < 18

## [1.1.0] - 2023-01-30

### Changed

- Use keep-a-changelog instead of lerna-changelog for changelog generation
- build(deps): bump prosemirror-model from 1.18.3 to 1.19.0 #558
- build(deps-dev): bump ember-template-lint from 4.18.2 to 5.3.3 #565
- build(deps): bump prosemirror-view from 1.29.2 to 1.30.0 #559

### Removed

- remove ember-cli-coverage dependency #567

### Fixed

- ensure delete and backspace behavior around tables is consistent #566
- improve performance in chrome #563

## [1.0.0] - 2023-01-26

#### :rocket: Enhancement
* [#560](https://github.com/lblod/ember-rdfa-editor/pull/560) Add redo button ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#562](https://github.com/lblod/ember-rdfa-editor/pull/562) Remove ember-instance from window and pass it through for ember-nodes ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-beta.7 (2023-01-25)

fix(commands): focus and scrollintoview on insert-html

## 1.0.0-beta.6 (2023-01-24)

improve insert-html logic so it doesn't insert unnecessary paragraphs

## 1.0.0-beta.5 (2023-01-20)

#### :rocket: Enhancement
* [#553](https://github.com/lblod/ember-rdfa-editor/pull/553) Add functionality to support an embedded view and allow widgets to perform actions on either the outer or inner view ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-beta.4 (2023-01-20)

#### :rocket: Enhancement
* [#552](https://github.com/lblod/ember-rdfa-editor/pull/552) Make paragraphs not parse when they contain rdfa ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 1.0.0-beta.3 (2023-01-19)

#### :bug: Bug Fix
* [#546](https://github.com/lblod/ember-rdfa-editor/pull/546) Set word-wrap as break-word on editor ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-beta.2 (2023-01-17)

#### :house: Internal
* [#540](https://github.com/lblod/ember-rdfa-editor/pull/540) update prosemirror packages to latest versions ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-beta.1 (2023-01-17)

#### :boom: Breaking Change
* [#538](https://github.com/lblod/ember-rdfa-editor/pull/538) Prosemirror ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement
* [#538](https://github.com/lblod/ember-rdfa-editor/pull/538) Prosemirror ([@abeforgit](https://github.com/abeforgit))
* [#451](https://github.com/lblod/ember-rdfa-editor/pull/451) GN-3716 - Improve copy/paste from word ([@usrtim](https://github.com/usrtim))

#### :bug: Bug Fix
* [#499](https://github.com/lblod/ember-rdfa-editor/pull/499) fix(initialization): emit a selectionchanged after init ([@abeforgit](https://github.com/abeforgit))
* [#481](https://github.com/lblod/ember-rdfa-editor/pull/481) fix(paste): preserve list indentation when copying from word ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal
* [#536](https://github.com/lblod/ember-rdfa-editor/pull/536) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.43.0 to 5.48.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#533](https://github.com/lblod/ember-rdfa-editor/pull/533) build(deps-dev): bump prettier from 2.7.1 to 2.8.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#539](https://github.com/lblod/ember-rdfa-editor/pull/539) build(deps): bump loader-utils from 1.0.4 to 2.0.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#525](https://github.com/lblod/ember-rdfa-editor/pull/525) build(deps-dev): bump @appuniversum/ember-appuniversum from 2.0.0 to 2.2.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#505](https://github.com/lblod/ember-rdfa-editor/pull/505) build(deps): bump decode-uri-component from 0.2.0 to 0.2.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#491](https://github.com/lblod/ember-rdfa-editor/pull/491) build(deps-dev): bump eslint-plugin-qunit from 7.3.2 to 7.3.4 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- [@usrtim](https://github.com/usrtim)

## v0.65.0 (2022-11-23)

#### :boom: Breaking Change
* [#468](https://github.com/lblod/ember-rdfa-editor/pull/468) Update ember-appuniversum to v2 ([@Windvis](https://github.com/Windvis))

#### :house: Internal
* [#480](https://github.com/lblod/ember-rdfa-editor/pull/480) build(deps): bump engine.io from 6.2.0 to 6.2.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#475](https://github.com/lblod/ember-rdfa-editor/pull/475) build(deps-dev): bump eslint from 8.27.0 to 8.28.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#469](https://github.com/lblod/ember-rdfa-editor/pull/469) build(deps): bump @codemirror/lang-html from 6.1.4 to 6.2.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#466](https://github.com/lblod/ember-rdfa-editor/pull/466) build(deps): bump @codemirror/view from 6.5.0 to 6.5.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#464](https://github.com/lblod/ember-rdfa-editor/pull/464) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.9.0 to 1.10.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#457](https://github.com/lblod/ember-rdfa-editor/pull/457) build(deps-dev): bump typescript from 4.8.4 to 4.9.3 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))

## v0.64.0 (2022-11-15)

#### :boom: Breaking Change
* [#455](https://github.com/lblod/ember-rdfa-editor/pull/455) Inline components: serializable properties ([@elpoelma](https://github.com/elpoelma))

#### :rocket: Enhancement
* [#455](https://github.com/lblod/ember-rdfa-editor/pull/455) Inline components: serializable properties ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#456](https://github.com/lblod/ember-rdfa-editor/pull/456) Remove unnecessary read in htmlContent method ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.63.8 (2022-11-15)

#### :house: Internal
* [#454](https://github.com/lblod/ember-rdfa-editor/pull/454) fix(deps): use proper versions of the @types packages ([@abeforgit](https://github.com/abeforgit))
* [#448](https://github.com/lblod/ember-rdfa-editor/pull/448) build(deps-dev): bump eslint-plugin-qunit from 7.3.1 to 7.3.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#450](https://github.com/lblod/ember-rdfa-editor/pull/450) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.8.2 to 1.9.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#447](https://github.com/lblod/ember-rdfa-editor/pull/447) build(deps): bump @codemirror/view from 6.4.0 to 6.4.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## v0.63.7 (2022-11-04)

#### :bug: Bug Fix
* [#443](https://github.com/lblod/ember-rdfa-editor/pull/443) Refresh inline components after model read ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#444](https://github.com/lblod/ember-rdfa-editor/pull/444) Remove unnecessary read on mouseup ([@elpoelma](https://github.com/elpoelma))
* [#442](https://github.com/lblod/ember-rdfa-editor/pull/442) build(deps-dev): bump @types/ember__polyfills from 4.0.0 to 4.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#441](https://github.com/lblod/ember-rdfa-editor/pull/441) build(deps-dev): bump @types/ember__engine from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#440](https://github.com/lblod/ember-rdfa-editor/pull/440) build(deps-dev): bump @types/ember__test-helpers from 2.8.1 to 2.8.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#439](https://github.com/lblod/ember-rdfa-editor/pull/439) build(deps-dev): bump @types/ember__runloop from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#438](https://github.com/lblod/ember-rdfa-editor/pull/438) build(deps-dev): bump @types/ember__template from 4.0.0 to 4.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#433](https://github.com/lblod/ember-rdfa-editor/pull/433) build(deps-dev): bump eslint-plugin-ember from 11.1.0 to 11.2.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#434](https://github.com/lblod/ember-rdfa-editor/pull/434) build(deps-dev): bump @types/ember__component from 4.0.10 to 4.0.11 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#435](https://github.com/lblod/ember-rdfa-editor/pull/435) build(deps-dev): bump @types/ember__application from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#436](https://github.com/lblod/ember-rdfa-editor/pull/436) build(deps-dev): bump @types/ember__routing from 4.0.11 to 4.0.12 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#437](https://github.com/lblod/ember-rdfa-editor/pull/437) build(deps-dev): bump @types/ember__controller from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.63.6 (2022-10-27)

#### :house: Internal
* [#429](https://github.com/lblod/ember-rdfa-editor/pull/429) build(deps-dev): bump @types/ember__utils from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#428](https://github.com/lblod/ember-rdfa-editor/pull/428) build(deps-dev): bump @types/ember__array from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#427](https://github.com/lblod/ember-rdfa-editor/pull/427) build(deps-dev): bump @typescript-eslint/parser from 5.40.1 to 5.41.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#426](https://github.com/lblod/ember-rdfa-editor/pull/426) build(deps-dev): bump @types/ember-resolver from 5.0.11 to 5.0.12 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#432](https://github.com/lblod/ember-rdfa-editor/pull/432) build(deps): bump ember-cli-typescript from 5.1.1 to 5.2.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

## v0.63.5 (2022-10-26)

#### :house: Internal
* [#425](https://github.com/lblod/ember-rdfa-editor/pull/425) build(deps): bump @codemirror/lang-html from 6.1.2 to 6.1.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#424](https://github.com/lblod/ember-rdfa-editor/pull/424) build(deps): bump @codemirror/lang-xml from 6.0.0 to 6.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#423](https://github.com/lblod/ember-rdfa-editor/pull/423) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.40.1 to 5.41.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#422](https://github.com/lblod/ember-rdfa-editor/pull/422) build(deps-dev): bump qunit from 2.19.2 to 2.19.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#421](https://github.com/lblod/ember-rdfa-editor/pull/421) build(deps-dev): bump eslint from 8.25.0 to 8.26.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#420](https://github.com/lblod/ember-rdfa-editor/pull/420) build(deps-dev): bump @types/ember__controller from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#419](https://github.com/lblod/ember-rdfa-editor/pull/419) build(deps): bump @codemirror/view from 6.3.1 to 6.4.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#418](https://github.com/lblod/ember-rdfa-editor/pull/418) build(deps-dev): bump eslint-plugin-ember from 11.0.6 to 11.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#417](https://github.com/lblod/ember-rdfa-editor/pull/417) build(deps-dev): bump ember-template-lint from 4.15.0 to 4.16.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#416](https://github.com/lblod/ember-rdfa-editor/pull/416) fix deprecations ([@usrtim](https://github.com/usrtim))
* [#413](https://github.com/lblod/ember-rdfa-editor/pull/413) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.8.1 to 1.8.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#412](https://github.com/lblod/ember-rdfa-editor/pull/412) build(deps-dev): bump @typescript-eslint/parser from 5.40.0 to 5.40.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#411](https://github.com/lblod/ember-rdfa-editor/pull/411) build(deps): bump ember-auto-import from 2.4.2 to 2.4.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#414](https://github.com/lblod/ember-rdfa-editor/pull/414) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.40.0 to 5.40.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#415](https://github.com/lblod/ember-rdfa-editor/pull/415) build(deps-dev): bump qunit from 2.19.1 to 2.19.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#408](https://github.com/lblod/ember-rdfa-editor/pull/408) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.39.0 to 5.40.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#409](https://github.com/lblod/ember-rdfa-editor/pull/409) build(deps): bump @xmldom/xmldom from 0.8.2 to 0.8.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#407](https://github.com/lblod/ember-rdfa-editor/pull/407) build(deps-dev): bump ember-template-lint from 4.14.0 to 4.15.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#406](https://github.com/lblod/ember-rdfa-editor/pull/406) build(deps): bump @codemirror/view from 6.3.0 to 6.3.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#405](https://github.com/lblod/ember-rdfa-editor/pull/405) build(deps-dev): bump @typescript-eslint/parser from 5.39.0 to 5.40.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#403](https://github.com/lblod/ember-rdfa-editor/pull/403) build(deps-dev): bump eslint from 8.24.0 to 8.25.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#402](https://github.com/lblod/ember-rdfa-editor/pull/402) build(deps-dev): bump ember-qunit from 5.1.5 to 6.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#401](https://github.com/lblod/ember-rdfa-editor/pull/401) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.8.0 to 1.8.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1
- [@usrtim](https://github.com/usrtim)

## 1.0.0-alpha.14 (2023-01-17)

#### :rocket: Enhancement
* [#532](https://github.com/lblod/ember-rdfa-editor/pull/532) Addition of a menu which allows to insert headings ([@elpoelma](https://github.com/elpoelma))
* [#531](https://github.com/lblod/ember-rdfa-editor/pull/531) Support for subscript and superscript marks ([@elpoelma](https://github.com/elpoelma))
* [#530](https://github.com/lblod/ember-rdfa-editor/pull/530) feat(datastore): make datastore lazy ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix
* [#537](https://github.com/lblod/ember-rdfa-editor/pull/537) Remove context from parsing rule paragraph ([@elpoelma](https://github.com/elpoelma))
* [#535](https://github.com/lblod/ember-rdfa-editor/pull/535) Add translation for 'insert' and 'show annotations' buttons. ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.13 (2023-01-03)

#### :house: Internal
* [#521](https://github.com/lblod/ember-rdfa-editor/pull/521) Ensure placeholders are non-draggable and use placeholder-text as leafText ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.12 (2022-12-22)
- Datastore: fix issue with node mappings

## 1.0.0-alpha.11 (2022-12-20)

#### :rocket: Enhancement
* [#516](https://github.com/lblod/ember-rdfa-editor/pull/516) Fix table insertion menu and keymapping ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 1.0.0-alpha.10 (2022-12-20)
fix test import

## 1.0.0-alpha.9 (2022-12-20)

#### :boom: Breaking Change
* [#515](https://github.com/lblod/ember-rdfa-editor/pull/515) fix/list behavior - rdfa as marks ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement
* [#507](https://github.com/lblod/ember-rdfa-editor/pull/507) Rework placeholders ([@elpoelma](https://github.com/elpoelma))
* [#513](https://github.com/lblod/ember-rdfa-editor/pull/513) Addition of utility functions which allow for searching nodes in a specific range or with a specific condition ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.8 (2022-12-14)

#### :boom: Breaking Change
* [#511](https://github.com/lblod/ember-rdfa-editor/pull/511) Return pos instead of resolved pos from datastore ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#511](https://github.com/lblod/ember-rdfa-editor/pull/511) Return pos instead of resolved pos from datastore ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.7 (2022-12-14)

#### :boom: Breaking Change
* [#498](https://github.com/lblod/ember-rdfa-editor/pull/498) Utility functions to create ember-node-views and ember-node-specs ([@elpoelma](https://github.com/elpoelma))

#### :rocket: Enhancement
* [#509](https://github.com/lblod/ember-rdfa-editor/pull/509) feature(datastore): implement ds as a plugin ([@abeforgit](https://github.com/abeforgit))
* [#498](https://github.com/lblod/ember-rdfa-editor/pull/498) Utility functions to create ember-node-views and ember-node-specs ([@elpoelma](https://github.com/elpoelma))
* [#495](https://github.com/lblod/ember-rdfa-editor/pull/495) Add resolved-positions to prose-store ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix
* [#508](https://github.com/lblod/ember-rdfa-editor/pull/508) bug(datastore): guarantee reference stability for datastore data ([@abeforgit](https://github.com/abeforgit))
* [#501](https://github.com/lblod/ember-rdfa-editor/pull/501) fix(npm): fix infinite loop by moving devtools to devdeps ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal
* [#502](https://github.com/lblod/ember-rdfa-editor/pull/502) Cleanup unused code, tighten linting, fix linting ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.6 (2022-12-06)

#### :boom: Breaking Change
* [#494](https://github.com/lblod/ember-rdfa-editor/pull/494) restructure plugins ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement
* [#492](https://github.com/lblod/ember-rdfa-editor/pull/492) feature(dev): add devtools ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal
* [#494](https://github.com/lblod/ember-rdfa-editor/pull/494) restructure plugins ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 1.0.0-alpha.5 (2022-11-30)
* fix mark active state on buttons
* fix enter handling in lists

## 1.0.0-alpha.4 (2022-11-30)

#### :rocket: Enhancement
* [#410](https://github.com/lblod/ember-rdfa-editor/pull/410) feature/simple positions ([@abeforgit](https://github.com/abeforgit))

#### :memo: Documentation
* [#400](https://github.com/lblod/ember-rdfa-editor/pull/400) Correct the description for the text-only paste behaviour. ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.3 (2022-10-06)

#### :boom: Breaking Change
* [#397](https://github.com/lblod/ember-rdfa-editor/pull/397) TEDI: live mark set rework ([@elpoelma](https://github.com/elpoelma))
* [#390](https://github.com/lblod/ember-rdfa-editor/pull/390) Feature: allow for plugins to reload dynamically ([@elpoelma](https://github.com/elpoelma))
* [#389](https://github.com/lblod/ember-rdfa-editor/pull/389) Enable html pasting by passing a property to the editor component ([@elpoelma](https://github.com/elpoelma))

#### :rocket: Enhancement
* [#390](https://github.com/lblod/ember-rdfa-editor/pull/390) Feature: allow for plugins to reload dynamically ([@elpoelma](https://github.com/elpoelma))
* [#358](https://github.com/lblod/ember-rdfa-editor/pull/358) Introduction of a MarksManager ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix
* [#398](https://github.com/lblod/ember-rdfa-editor/pull/398) Bugfix: inline component reload ([@elpoelma](https://github.com/elpoelma))
* [#396](https://github.com/lblod/ember-rdfa-editor/pull/396) Fix issue with computing differences on transaction dispatch  ([@elpoelma](https://github.com/elpoelma))
* [#389](https://github.com/lblod/ember-rdfa-editor/pull/389) Enable html pasting by passing a property to the editor component ([@elpoelma](https://github.com/elpoelma))
* [#386](https://github.com/lblod/ember-rdfa-editor/pull/386) Fix: inline component selection issues ([@elpoelma](https://github.com/elpoelma))
* [#385](https://github.com/lblod/ember-rdfa-editor/pull/385) Ensure dom nodes are correctly converted to model nodes ([@elpoelma](https://github.com/elpoelma))
* [#373](https://github.com/lblod/ember-rdfa-editor/pull/373) Fix: view to model behaviour ([@elpoelma](https://github.com/elpoelma))
* [#365](https://github.com/lblod/ember-rdfa-editor/pull/365) Fix issue with inline components not being persisted correctly across reloads ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#399](https://github.com/lblod/ember-rdfa-editor/pull/399) build(typescript): enable strict type-checking ([@abeforgit](https://github.com/abeforgit))
* [#397](https://github.com/lblod/ember-rdfa-editor/pull/397) TEDI: live mark set rework ([@elpoelma](https://github.com/elpoelma))
* [#395](https://github.com/lblod/ember-rdfa-editor/pull/395) build(deps-dev): bump ember-cli from 3.28.5 to 3.28.6 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#394](https://github.com/lblod/ember-rdfa-editor/pull/394) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.38.1 to 5.39.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#393](https://github.com/lblod/ember-rdfa-editor/pull/393) build(deps-dev): bump release-it from 15.4.2 to 15.5.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#392](https://github.com/lblod/ember-rdfa-editor/pull/392) build(deps-dev): bump sinon from 14.0.0 to 14.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#391](https://github.com/lblod/ember-rdfa-editor/pull/391) build(deps-dev): bump @typescript-eslint/parser from 5.38.1 to 5.39.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#384](https://github.com/lblod/ember-rdfa-editor/pull/384) Chore/cleanup feature flags ([@nvdk](https://github.com/nvdk))
* [#387](https://github.com/lblod/ember-rdfa-editor/pull/387) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.7.0 to 1.8.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#382](https://github.com/lblod/ember-rdfa-editor/pull/382) build(deps-dev): bump @types/ember__routing from 4.0.10 to 4.0.11 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#383](https://github.com/lblod/ember-rdfa-editor/pull/383) build(deps-dev): bump @types/ember__application from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#381](https://github.com/lblod/ember-rdfa-editor/pull/381) build(deps): bump @codemirror/lang-html from 6.1.1 to 6.1.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#347](https://github.com/lblod/ember-rdfa-editor/pull/347) build(deps-dev): bump ember-template-lint from 3.16.0 to 4.14.0 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 3
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Niels V ([@nvdk](https://github.com/nvdk))

## vv1.0.0-alpha.1 (2022-09-12)

#### :boom: Breaking Change
* [#310](https://github.com/lblod/ember-rdfa-editor/pull/310) Transactional Edits ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement
* [#301](https://github.com/lblod/ember-rdfa-editor/pull/301) Internal/tree diffing ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#306](https://github.com/lblod/ember-rdfa-editor/pull/306) Merge latest dev, Remove non-TEDI code, cleanup types&tests, rework commands ([@abeforgit](https://github.com/abeforgit))
* [#307](https://github.com/lblod/ember-rdfa-editor/pull/307) Feature/transactional api steps ([@elpoelma](https://github.com/elpoelma))
* [#302](https://github.com/lblod/ember-rdfa-editor/pull/302) Improve selection handler ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.2 (2022-09-12)

## v1.0.0-alpha.1 (2022-09-12)

#### :boom: Breaking Change
* [#310](https://github.com/lblod/ember-rdfa-editor/pull/310) Transactional Edits ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement
* [#301](https://github.com/lblod/ember-rdfa-editor/pull/301) Internal/tree diffing ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#344](https://github.com/lblod/ember-rdfa-editor/pull/344) build(deps-dev): bump ember-cli-sass from 10.0.1 to 11.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#306](https://github.com/lblod/ember-rdfa-editor/pull/306) Merge latest dev, Remove non-TEDI code, cleanup types&tests, rework commands ([@abeforgit](https://github.com/abeforgit))
* [#307](https://github.com/lblod/ember-rdfa-editor/pull/307) Feature/transactional api steps ([@elpoelma](https://github.com/elpoelma))
* [#302](https://github.com/lblod/ember-rdfa-editor/pull/302) Improve selection handler ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.65.0 (2022-11-23)

#### :boom: Breaking Change
* [#468](https://github.com/lblod/ember-rdfa-editor/pull/468) Update ember-appuniversum to v2 ([@Windvis](https://github.com/Windvis))

#### :house: Internal
* [#480](https://github.com/lblod/ember-rdfa-editor/pull/480) build(deps): bump engine.io from 6.2.0 to 6.2.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#475](https://github.com/lblod/ember-rdfa-editor/pull/475) build(deps-dev): bump eslint from 8.27.0 to 8.28.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#469](https://github.com/lblod/ember-rdfa-editor/pull/469) build(deps): bump @codemirror/lang-html from 6.1.4 to 6.2.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#466](https://github.com/lblod/ember-rdfa-editor/pull/466) build(deps): bump @codemirror/view from 6.5.0 to 6.5.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#464](https://github.com/lblod/ember-rdfa-editor/pull/464) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.9.0 to 1.10.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#457](https://github.com/lblod/ember-rdfa-editor/pull/457) build(deps-dev): bump typescript from 4.8.4 to 4.9.3 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))

## 0.64.0 (2022-11-15)

#### :boom: Breaking Change
* [#455](https://github.com/lblod/ember-rdfa-editor/pull/455) Inline components: serializable properties ([@elpoelma](https://github.com/elpoelma))

#### :rocket: Enhancement
* [#455](https://github.com/lblod/ember-rdfa-editor/pull/455) Inline components: serializable properties ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#456](https://github.com/lblod/ember-rdfa-editor/pull/456) Remove unnecessary read in htmlContent method ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.63.8 (2022-11-15)

#### :house: Internal
* [#454](https://github.com/lblod/ember-rdfa-editor/pull/454) fix(deps): use proper versions of the @types packages ([@abeforgit](https://github.com/abeforgit))
* [#448](https://github.com/lblod/ember-rdfa-editor/pull/448) build(deps-dev): bump eslint-plugin-qunit from 7.3.1 to 7.3.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#450](https://github.com/lblod/ember-rdfa-editor/pull/450) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.8.2 to 1.9.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#447](https://github.com/lblod/ember-rdfa-editor/pull/447) build(deps): bump @codemirror/view from 6.4.0 to 6.4.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.63.7 (2022-11-04)

#### :bug: Bug Fix
* [#443](https://github.com/lblod/ember-rdfa-editor/pull/443) Refresh inline components after model read ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#444](https://github.com/lblod/ember-rdfa-editor/pull/444) Remove unnecessary read on mouseup ([@elpoelma](https://github.com/elpoelma))
* [#442](https://github.com/lblod/ember-rdfa-editor/pull/442) build(deps-dev): bump @types/ember__polyfills from 4.0.0 to 4.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#441](https://github.com/lblod/ember-rdfa-editor/pull/441) build(deps-dev): bump @types/ember__engine from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#440](https://github.com/lblod/ember-rdfa-editor/pull/440) build(deps-dev): bump @types/ember__test-helpers from 2.8.1 to 2.8.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#439](https://github.com/lblod/ember-rdfa-editor/pull/439) build(deps-dev): bump @types/ember__runloop from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#438](https://github.com/lblod/ember-rdfa-editor/pull/438) build(deps-dev): bump @types/ember__template from 4.0.0 to 4.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#433](https://github.com/lblod/ember-rdfa-editor/pull/433) build(deps-dev): bump eslint-plugin-ember from 11.1.0 to 11.2.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#434](https://github.com/lblod/ember-rdfa-editor/pull/434) build(deps-dev): bump @types/ember__component from 4.0.10 to 4.0.11 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#435](https://github.com/lblod/ember-rdfa-editor/pull/435) build(deps-dev): bump @types/ember__application from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#436](https://github.com/lblod/ember-rdfa-editor/pull/436) build(deps-dev): bump @types/ember__routing from 4.0.11 to 4.0.12 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#437](https://github.com/lblod/ember-rdfa-editor/pull/437) build(deps-dev): bump @types/ember__controller from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.63.6 (2022-10-27)

#### :house: Internal
* [#429](https://github.com/lblod/ember-rdfa-editor/pull/429) build(deps-dev): bump @types/ember__utils from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#428](https://github.com/lblod/ember-rdfa-editor/pull/428) build(deps-dev): bump @types/ember__array from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#427](https://github.com/lblod/ember-rdfa-editor/pull/427) build(deps-dev): bump @typescript-eslint/parser from 5.40.1 to 5.41.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#426](https://github.com/lblod/ember-rdfa-editor/pull/426) build(deps-dev): bump @types/ember-resolver from 5.0.11 to 5.0.12 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#432](https://github.com/lblod/ember-rdfa-editor/pull/432) build(deps): bump ember-cli-typescript from 5.1.1 to 5.2.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

## 0.63.5 (2022-10-26)

#### :bug: Bug Fix
* [#398](https://github.com/lblod/ember-rdfa-editor/pull/398) Bugfix: inline component reload ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#425](https://github.com/lblod/ember-rdfa-editor/pull/425) build(deps): bump @codemirror/lang-html from 6.1.2 to 6.1.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#424](https://github.com/lblod/ember-rdfa-editor/pull/424) build(deps): bump @codemirror/lang-xml from 6.0.0 to 6.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#423](https://github.com/lblod/ember-rdfa-editor/pull/423) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.40.1 to 5.41.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#422](https://github.com/lblod/ember-rdfa-editor/pull/422) build(deps-dev): bump qunit from 2.19.2 to 2.19.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#421](https://github.com/lblod/ember-rdfa-editor/pull/421) build(deps-dev): bump eslint from 8.25.0 to 8.26.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#420](https://github.com/lblod/ember-rdfa-editor/pull/420) build(deps-dev): bump @types/ember__controller from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#419](https://github.com/lblod/ember-rdfa-editor/pull/419) build(deps): bump @codemirror/view from 6.3.1 to 6.4.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#418](https://github.com/lblod/ember-rdfa-editor/pull/418) build(deps-dev): bump eslint-plugin-ember from 11.0.6 to 11.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#417](https://github.com/lblod/ember-rdfa-editor/pull/417) build(deps-dev): bump ember-template-lint from 4.15.0 to 4.16.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#413](https://github.com/lblod/ember-rdfa-editor/pull/413) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.8.1 to 1.8.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#412](https://github.com/lblod/ember-rdfa-editor/pull/412) build(deps-dev): bump @typescript-eslint/parser from 5.40.0 to 5.40.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#411](https://github.com/lblod/ember-rdfa-editor/pull/411) build(deps): bump ember-auto-import from 2.4.2 to 2.4.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#414](https://github.com/lblod/ember-rdfa-editor/pull/414) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.40.0 to 5.40.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#415](https://github.com/lblod/ember-rdfa-editor/pull/415) build(deps-dev): bump qunit from 2.19.1 to 2.19.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#408](https://github.com/lblod/ember-rdfa-editor/pull/408) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.39.0 to 5.40.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#409](https://github.com/lblod/ember-rdfa-editor/pull/409) build(deps): bump @xmldom/xmldom from 0.8.2 to 0.8.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#407](https://github.com/lblod/ember-rdfa-editor/pull/407) build(deps-dev): bump ember-template-lint from 4.14.0 to 4.15.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#406](https://github.com/lblod/ember-rdfa-editor/pull/406) build(deps): bump @codemirror/view from 6.3.0 to 6.3.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#405](https://github.com/lblod/ember-rdfa-editor/pull/405) build(deps-dev): bump @typescript-eslint/parser from 5.39.0 to 5.40.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#403](https://github.com/lblod/ember-rdfa-editor/pull/403) build(deps-dev): bump eslint from 8.24.0 to 8.25.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#402](https://github.com/lblod/ember-rdfa-editor/pull/402) build(deps-dev): bump ember-qunit from 5.1.5 to 6.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#401](https://github.com/lblod/ember-rdfa-editor/pull/401) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.8.0 to 1.8.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#395](https://github.com/lblod/ember-rdfa-editor/pull/395) build(deps-dev): bump ember-cli from 3.28.5 to 3.28.6 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#394](https://github.com/lblod/ember-rdfa-editor/pull/394) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.38.1 to 5.39.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#393](https://github.com/lblod/ember-rdfa-editor/pull/393) build(deps-dev): bump release-it from 15.4.2 to 15.5.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#392](https://github.com/lblod/ember-rdfa-editor/pull/392) build(deps-dev): bump sinon from 14.0.0 to 14.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#391](https://github.com/lblod/ember-rdfa-editor/pull/391) build(deps-dev): bump @typescript-eslint/parser from 5.38.1 to 5.39.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#384](https://github.com/lblod/ember-rdfa-editor/pull/384) Chore/cleanup feature flags ([@nvdk](https://github.com/nvdk))
* [#387](https://github.com/lblod/ember-rdfa-editor/pull/387) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.7.0 to 1.8.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#382](https://github.com/lblod/ember-rdfa-editor/pull/382) build(deps-dev): bump @types/ember__routing from 4.0.10 to 4.0.11 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#383](https://github.com/lblod/ember-rdfa-editor/pull/383) build(deps-dev): bump @types/ember__application from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#381](https://github.com/lblod/ember-rdfa-editor/pull/381) build(deps): bump @codemirror/lang-html from 6.1.1 to 6.1.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#347](https://github.com/lblod/ember-rdfa-editor/pull/347) build(deps-dev): bump ember-template-lint from 3.16.0 to 4.14.0 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 3
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Niels V ([@nvdk](https://github.com/nvdk))
- [@usrtim](https://github.com/usrtim)

## 0.63.4 (2022-09-29)

#### :bug: Bug Fix
* [#376](https://github.com/lblod/ember-rdfa-editor/pull/376) fix(selection-handler): handle cases where selection is empty ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal
* [#380](https://github.com/lblod/ember-rdfa-editor/pull/380) build(deps-dev): bump @types/qunit from 2.19.2 to 2.19.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#379](https://github.com/lblod/ember-rdfa-editor/pull/379) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.37.0 to 5.38.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#378](https://github.com/lblod/ember-rdfa-editor/pull/378) build(deps-dev): bump sass from 1.54.9 to 1.55.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#377](https://github.com/lblod/ember-rdfa-editor/pull/377) build(deps-dev): bump typescript from 4.8.3 to 4.8.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#375](https://github.com/lblod/ember-rdfa-editor/pull/375) build(deps): bump @codemirror/state from 6.1.1 to 6.1.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#374](https://github.com/lblod/ember-rdfa-editor/pull/374) build(deps): bump @codemirror/view from 6.2.5 to 6.3.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#371](https://github.com/lblod/ember-rdfa-editor/pull/371) build(deps-dev): bump eslint from 8.22.0 to 8.24.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#372](https://github.com/lblod/ember-rdfa-editor/pull/372) build(deps-dev): bump @types/ember-qunit from 5.0.1 to 5.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#370](https://github.com/lblod/ember-rdfa-editor/pull/370) build(deps): bump mout from 1.2.3 to 1.2.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#369](https://github.com/lblod/ember-rdfa-editor/pull/369) build(deps): bump iter-tools from 7.4.0 to 7.5.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#368](https://github.com/lblod/ember-rdfa-editor/pull/368) build(deps-dev): bump @typescript-eslint/parser from 5.37.0 to 5.38.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#367](https://github.com/lblod/ember-rdfa-editor/pull/367) build(deps): bump @codemirror/view from 6.2.3 to 6.2.5 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#366](https://github.com/lblod/ember-rdfa-editor/pull/366) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.6.0 to 1.7.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#360](https://github.com/lblod/ember-rdfa-editor/pull/360) build(deps-dev): bump release-it from 15.4.1 to 15.4.2 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.63.3 (2022-09-20)

#### :bug: Bug Fix
* [#363](https://github.com/lblod/ember-rdfa-editor/pull/363) Remove tracked array from inline components registry ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#362](https://github.com/lblod/ember-rdfa-editor/pull/362) Implement htmlContent setter and getter on the RawEditorController ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.63.2 (2022-09-13)

#### :house: Internal
* [#354](https://github.com/lblod/ember-rdfa-editor/pull/354) build(deps-dev): bump @typescript-eslint/parser from 5.36.2 to 5.37.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#357](https://github.com/lblod/ember-rdfa-editor/pull/357) build(deps-dev): bump typescript from 4.8.2 to 4.8.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#356](https://github.com/lblod/ember-rdfa-editor/pull/356) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.36.2 to 5.37.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#353](https://github.com/lblod/ember-rdfa-editor/pull/353) build(deps): bump tracked-built-ins from 2.0.1 to 3.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#352](https://github.com/lblod/ember-rdfa-editor/pull/352) build(deps-dev): bump ember-page-title from 6.2.2 to 7.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#348](https://github.com/lblod/ember-rdfa-editor/pull/348) build(deps): bump ember-concurrency from 2.3.6 to 2.3.7 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#351](https://github.com/lblod/ember-rdfa-editor/pull/351) build(deps-dev): bump sass from 1.54.8 to 1.54.9 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#350](https://github.com/lblod/ember-rdfa-editor/pull/350) build(deps): bump @codemirror/view from ddac2d27f42839dc3d84f46ef8bc65d1a99c3140 to 6.2.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#349](https://github.com/lblod/ember-rdfa-editor/pull/349) build(deps): bump ember-cli-htmlbars from 6.1.0 to 6.1.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#344](https://github.com/lblod/ember-rdfa-editor/pull/344) build(deps-dev): bump ember-cli-sass from 10.0.1 to 11.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

## 0.63.1 (2022-09-07)

#### :house: Internal
* [#342](https://github.com/lblod/ember-rdfa-editor/pull/342) build(deps-dev): bump eslint-plugin-ember from 10.6.1 to 11.0.6 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#340](https://github.com/lblod/ember-rdfa-editor/pull/340) Bump eslint-plugin-qunit from 7.2.0 to 7.3.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#339](https://github.com/lblod/ember-rdfa-editor/pull/339) Bump @types/sinon from 10.0.11 to 10.0.13 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#338](https://github.com/lblod/ember-rdfa-editor/pull/338) Bump @embroider/test-setup from 1.6.0 to 1.8.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#341](https://github.com/lblod/ember-rdfa-editor/pull/341) Update to new codemirror name and fix associated problems ([@abeforgit](https://github.com/abeforgit))
* [#337](https://github.com/lblod/ember-rdfa-editor/pull/337) Bump prettier from 2.6.2 to 2.7.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.63.0 (2022-09-07)

#### :boom: Breaking Change
* [#319](https://github.com/lblod/ember-rdfa-editor/pull/319) Fix/ember appuniversum ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal
* [#336](https://github.com/lblod/ember-rdfa-editor/pull/336) Bump parse-path, release-it and release-it-lerna-changelog ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#333](https://github.com/lblod/ember-rdfa-editor/pull/333) Bump @typescript-eslint/parser from 5.22.0 to 5.36.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#332](https://github.com/lblod/ember-rdfa-editor/pull/332) Bump ember-cli-typescript from 5.1.0 to 5.1.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#330](https://github.com/lblod/ember-rdfa-editor/pull/330) Bump @types/ember__utils from 4.0.0 to 4.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#329](https://github.com/lblod/ember-rdfa-editor/pull/329) Bump @types/ember__array from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#326](https://github.com/lblod/ember-rdfa-editor/pull/326) Bump @types/ember__engine from 4.0.0 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#328](https://github.com/lblod/ember-rdfa-editor/pull/328) Bump @types/ember from 4.0.0 to 4.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#327](https://github.com/lblod/ember-rdfa-editor/pull/327) Bump prettier from 2.6.2 to 2.7.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#325](https://github.com/lblod/ember-rdfa-editor/pull/325) Bump sinon from 13.0.2 to 14.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#320](https://github.com/lblod/ember-rdfa-editor/pull/320) Bump ember-cli-htmlbars from 5.7.2 to 6.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#324](https://github.com/lblod/ember-rdfa-editor/pull/324) Bump ember-cli-autoprefixer from 1.0.3 to 2.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#323](https://github.com/lblod/ember-rdfa-editor/pull/323) Bump @embroider/test-setup from 1.6.0 to 1.8.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#321](https://github.com/lblod/ember-rdfa-editor/pull/321) Bump @typescript-eslint/eslint-plugin from 5.22.0 to 5.36.2 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.62.2 (2022-09-06)

#### :bug: Bug Fix
* [#318](https://github.com/lblod/ember-rdfa-editor/pull/318) Modify emit order of selectionChangedEvents and modelReadEvents ([@elpoelma](https://github.com/elpoelma))

#### :memo: Documentation
* [#315](https://github.com/lblod/ember-rdfa-editor/pull/315) RFC: Efficient datastore calculations ([@abeforgit](https://github.com/abeforgit))
* [#314](https://github.com/lblod/ember-rdfa-editor/pull/314) RFC: ModelNode rework ([@abeforgit](https://github.com/abeforgit))
* [#311](https://github.com/lblod/ember-rdfa-editor/pull/311) RFC: Transactional Edits ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.62.1 (2022-09-05)

#### :bug: Bug Fix
* [#316](https://github.com/lblod/ember-rdfa-editor/pull/316) Fix getRdfaAttributes() behaviour ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.62.0 (2022-09-01)

#### :boom: Breaking Change
* [#312](https://github.com/lblod/ember-rdfa-editor/pull/312) Replace selection arg by range arg in insert-component-command ([@elpoelma](https://github.com/elpoelma))

#### :rocket: Enhancement
* [#313](https://github.com/lblod/ember-rdfa-editor/pull/313) Improved inline components management ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix
* [#312](https://github.com/lblod/ember-rdfa-editor/pull/312) Replace selection arg by range arg in insert-component-command ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.61.1 (2022-08-12)

#### :bug: Bug Fix
* [#309](https://github.com/lblod/ember-rdfa-editor/pull/309) Remove the appuniversum SASS includePath ([@Windvis](https://github.com/Windvis))

#### Committers: 1
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))

## 0.61.0 (2022-08-12)

#### :bug: Bug Fix
* [#303](https://github.com/lblod/ember-rdfa-editor/pull/303) Reduce selectionChanged events ([@elpoelma](https://github.com/elpoelma))
* [#304](https://github.com/lblod/ember-rdfa-editor/pull/304) Fix/lump node plugin selection ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#308](https://github.com/lblod/ember-rdfa-editor/pull/308) Bump used node version and builder image ([@abeforgit](https://github.com/abeforgit))
* [#305](https://github.com/lblod/ember-rdfa-editor/pull/305) Bump terser from 4.8.0 to 4.8.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#300](https://github.com/lblod/ember-rdfa-editor/pull/300) Replace ix by itertools ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.61.0-0 (2022-07-15)

#### :rocket: Enhancement
* [#286](https://github.com/lblod/ember-rdfa-editor/pull/286) Vdom-based deletion ([@Asergey91](https://github.com/Asergey91))
* [#288](https://github.com/lblod/ember-rdfa-editor/pull/288) Feature/tab handler vdom ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Sergey Andreev ([@Asergey91](https://github.com/Asergey91))

## 0.60.5 (2022-07-14)

#### :rocket: Enhancement
* [#299](https://github.com/lblod/ember-rdfa-editor/pull/299) Enabling reload of plugins ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix
* [#298](https://github.com/lblod/ember-rdfa-editor/pull/298) Use GentreeWalker in make-list-command ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.60.4 (2022-07-13)

#### :rocket: Enhancement
* [#297](https://github.com/lblod/ember-rdfa-editor/pull/297) Allow plugins to send arguments to their components ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.60.3 (2022-07-11)

#### :bug: Bug Fix
* [#294](https://github.com/lblod/ember-rdfa-editor/pull/294) when storing the previous selection, clone the anchor nodes ([@elpoelma](https://github.com/elpoelma))
* [#296](https://github.com/lblod/ember-rdfa-editor/pull/296) Remove erroneous check to avoid duplicate selectionchange events ([@abeforgit](https://github.com/abeforgit))
* [#293](https://github.com/lblod/ember-rdfa-editor/pull/293) Null check on the parent of the range in live mark set ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.60.2 (2022-07-08)

#### :bug: Bug Fix
* [#295](https://github.com/lblod/ember-rdfa-editor/pull/295) Insert empty space when inserting an li above another one ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#292](https://github.com/lblod/ember-rdfa-editor/pull/292) Bump parse-url from 6.0.0 to 6.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.60.1 (2022-07-07)

#### :rocket: Enhancement
* [#291](https://github.com/lblod/ember-rdfa-editor/pull/291) Pass options object to plugins ([@abeforgit](https://github.com/abeforgit))
* [#287](https://github.com/lblod/ember-rdfa-editor/pull/287) Article plugin styling ([@Dietr](https://github.com/Dietr))

#### :bug: Bug Fix
* [#290](https://github.com/lblod/ember-rdfa-editor/pull/290) Fix cursor behavior in empty lists ([@abeforgit](https://github.com/abeforgit))
* [#289](https://github.com/lblod/ember-rdfa-editor/pull/289) fixed issue where insert a list a the end of line caused the insertion of a newline ([@elpoelma](https://github.com/elpoelma))

#### Committers: 3
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.60.0 (2022-06-30)

#### :rocket: Enhancement
* [#284](https://github.com/lblod/ember-rdfa-editor/pull/284) Feature/inline components ([@elpoelma](https://github.com/elpoelma))
* [#271](https://github.com/lblod/ember-rdfa-editor/pull/271) Feature/better remove algo ([@Asergey91](https://github.com/Asergey91))

#### :bug: Bug Fix
* [#283](https://github.com/lblod/ember-rdfa-editor/pull/283) modified the lists sample data so it contains valid html ([@elpoelma](https://github.com/elpoelma))
* [#282](https://github.com/lblod/ember-rdfa-editor/pull/282) Fix/tree walker ([@elpoelma](https://github.com/elpoelma))
* [#281](https://github.com/lblod/ember-rdfa-editor/pull/281) fix dissappearing nodes in text writer ([@elpoelma](https://github.com/elpoelma))

#### :memo: Documentation
* [#176](https://github.com/lblod/ember-rdfa-editor/pull/176) [RFC] ember-rdfa-editor stage 1 ([@abeforgit](https://github.com/abeforgit))

#### Committers: 4
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))
- Sergey Andreev ([@Asergey91](https://github.com/Asergey91))

## 0.59.1 (2022-06-08)

fix issues with disappearing text nodes after inserting newlines

## 0.59.0 (2022-05-27)

#### :rocket: Enhancement
* [#269](https://github.com/lblod/ember-rdfa-editor/pull/269) implemented merging of marks on adjacent text nodes ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix
* [#277](https://github.com/lblod/ember-rdfa-editor/pull/277) Bug/fix copy ([@abeforgit](https://github.com/abeforgit))
* [#274](https://github.com/lblod/ember-rdfa-editor/pull/274) Bug/editor-initialization ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.58.1 (2022-05-23)

#### :bug: Bug Fix
* [#275](https://github.com/lblod/ember-rdfa-editor/pull/275) Fix error this.app is not defined on loket ([@lagartoverde](https://github.com/lagartoverde))
* [#270](https://github.com/lblod/ember-rdfa-editor/pull/270) Make sidebar min-height same as window height ([@Dietr](https://github.com/Dietr))

#### Committers: 2
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 0.58.0 (2022-05-16)

#### :rocket: Enhancement
* [#267](https://github.com/lblod/ember-rdfa-editor/pull/267) Addition of a loading indicator when the editor has not yet fully loaded ([@elpoelma](https://github.com/elpoelma))
* [#264](https://github.com/lblod/ember-rdfa-editor/pull/264) Ember upgrade to v3.28 and others ([@benjay10](https://github.com/benjay10))
* [#266](https://github.com/lblod/ember-rdfa-editor/pull/266) Rework styling of mark-highlight-manual and codelist highlight ([@Dietr](https://github.com/Dietr))
* [#263](https://github.com/lblod/ember-rdfa-editor/pull/263) Remove dummy Say theming ([@benjay10](https://github.com/benjay10))
* [#265](https://github.com/lblod/ember-rdfa-editor/pull/265) Successful package upgrades ([@benjay10](https://github.com/benjay10))

#### :bug: Bug Fix
* [#272](https://github.com/lblod/ember-rdfa-editor/pull/272) rework backspace rdfa plugin to avoid some ts issues ([@nvdk](https://github.com/nvdk))

#### :house: Internal
* [#268](https://github.com/lblod/ember-rdfa-editor/pull/268) Addition of the shiftedVisually method which determines a new position based on an existing position and a number of visual steps. ([@elpoelma](https://github.com/elpoelma))

#### Committers: 4
- Ben ([@benjay10](https://github.com/benjay10))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Niels V ([@nvdk](https://github.com/nvdk))

## 0.57.0 (2022-04-27)

#### :rocket: Enhancement
* [#262](https://github.com/lblod/ember-rdfa-editor/pull/262) feature/improved prefix handling ([@abeforgit](https://github.com/abeforgit))
* [#257](https://github.com/lblod/ember-rdfa-editor/pull/257) Enhancement/better handlers ([@nvdk](https://github.com/nvdk))
* [#256](https://github.com/lblod/ember-rdfa-editor/pull/256) widget redesign ([@Asergey91](https://github.com/Asergey91))

#### Committers: 3
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Niels V ([@nvdk](https://github.com/nvdk))
- Sergey Andreev ([@Asergey91](https://github.com/Asergey91))

## 0.57.0-0 (2022-04-27)

#### :rocket: Enhancement
* [#262](https://github.com/lblod/ember-rdfa-editor/pull/262) feature/improved prefix handling ([@abeforgit](https://github.com/abeforgit))
* [#257](https://github.com/lblod/ember-rdfa-editor/pull/257) Enhancement/better handlers ([@nvdk](https://github.com/nvdk))
* [#256](https://github.com/lblod/ember-rdfa-editor/pull/256) widget redesign ([@Asergey91](https://github.com/Asergey91))

#### Committers: 3
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Niels V ([@nvdk](https://github.com/nvdk))
- Sergey Andreev ([@Asergey91](https://github.com/Asergey91))

## 0.56.6 (2022-05-20)

fix types again

## 0.56.5 (2022-05-20)
Fix type issues preventing the build

## 0.56.4 (2022-05-20)

:bug: fix drone config

## 0.56.3 (2022-05-20)

#### :bug: Bug Fix
* [#273](https://github.com/lblod/ember-rdfa-editor/pull/273) Fix initialization issues ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.56.2 (2022-04-27)

#### :bug: Bug Fix
* [#260](https://github.com/lblod/ember-rdfa-editor/pull/260) Fixed bug with making list at the end of the document ([@lagartoverde](https://github.com/lagartoverde))
* [#258](https://github.com/lblod/ember-rdfa-editor/pull/258) Fix bug that selection was wrong when creating en empty list ([@lagartoverde](https://github.com/lagartoverde))
* [#261](https://github.com/lblod/ember-rdfa-editor/pull/261) Fix textsearch on quads defined outside the root element ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 0.56.1 (2022-04-25)

#### :bug: Bug Fix
* [#259](https://github.com/lblod/ember-rdfa-editor/pull/259) Fix collapsed selections not detecting marks correctly ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.56.0 (2022-04-25)

#### :boom: Breaking Change
* [#232](https://github.com/lblod/ember-rdfa-editor/pull/232) Breaking/remove old plugin wiring ([@nvdk](https://github.com/nvdk))

#### :rocket: Enhancement
* [#249](https://github.com/lblod/ember-rdfa-editor/pull/249) Improved table insert, and column and row insert ([@benjay10](https://github.com/benjay10))

#### :bug: Bug Fix
* [#254](https://github.com/lblod/ember-rdfa-editor/pull/254) Fixed weird cases where the unindent button appeared without being available ([@lagartoverde](https://github.com/lagartoverde))
* [#255](https://github.com/lblod/ember-rdfa-editor/pull/255) improve whitespace collapsing ([@nvdk](https://github.com/nvdk))
* [#253](https://github.com/lblod/ember-rdfa-editor/pull/253) More consice removing of RDFa type ([@benjay10](https://github.com/benjay10))

#### Committers: 3
- Ben ([@benjay10](https://github.com/benjay10))
- Niels V ([@nvdk](https://github.com/nvdk))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 0.55.2 (2022-04-08)

#### :bug: Bug Fix
* [#252](https://github.com/lblod/ember-rdfa-editor/pull/252) Fix space-eating issues ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.55.1 (2022-04-07)

#### :bug: Bug fix

* [#251](https://github.com/lblod/ember-rdfa-editor/pull/251) Fix toolbar marks using wrong command arguments ([@abeforgit](https://github.com/abeforgit))

## 0.55.0 (2022-04-07)

#### :boom: Breaking Change
* [#250](https://github.com/lblod/ember-rdfa-editor/pull/250) Provide ranges per capture group ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement
* [#250](https://github.com/lblod/ember-rdfa-editor/pull/250) Provide ranges per capture group ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.54.0 (2022-04-05)

#### :boom: Breaking Change
* [#246](https://github.com/lblod/ember-rdfa-editor/pull/246) Implement self-updating regex-constrained sets of marks ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement
* [#246](https://github.com/lblod/ember-rdfa-editor/pull/246) Implement self-updating regex-constrained sets of marks ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix
* [#247](https://github.com/lblod/ember-rdfa-editor/pull/247) convert newlines to br elements when inserting text ([@nvdk](https://github.com/nvdk))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Niels V ([@nvdk](https://github.com/nvdk))

## 0.53.0 (2022-04-05)

#### :rocket: Enhancement
* [#245](https://github.com/lblod/ember-rdfa-editor/pull/245) replace all special spaces when regular spaces when parsing html ([@nvdk](https://github.com/nvdk))

#### :house: Internal
* [#244](https://github.com/lblod/ember-rdfa-editor/pull/244) ran npm update ([@nvdk](https://github.com/nvdk))

#### Committers: 1
- Niels V ([@nvdk](https://github.com/nvdk))

## 0.52.1 (2022-04-01)

#### :bug: Bug Fix
* [#243](https://github.com/lblod/ember-rdfa-editor/pull/243) Fix object node matching ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.52.0 (2022-03-30)

#### :rocket: Enhancement
* [#239](https://github.com/lblod/ember-rdfa-editor/pull/239) execute undo on VDOM ([@nvdk](https://github.com/nvdk))
* [#236](https://github.com/lblod/ember-rdfa-editor/pull/236) Implement incremental dom writing ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix
* [#237](https://github.com/lblod/ember-rdfa-editor/pull/237) Fixing unindenting ([@benjay10](https://github.com/benjay10))

#### :house: Internal
* [#242](https://github.com/lblod/ember-rdfa-editor/pull/242) dev packages spring cleaning ([@nvdk](https://github.com/nvdk))
* [#240](https://github.com/lblod/ember-rdfa-editor/pull/240) add embroider test scenarios to ember try ([@nvdk](https://github.com/nvdk))
* [#241](https://github.com/lblod/ember-rdfa-editor/pull/241) bump ember-cli-app-version to 5.0.0 ([@nvdk](https://github.com/nvdk))
* [#238](https://github.com/lblod/ember-rdfa-editor/pull/238) bump ember-truth-helpers to 3.0.0 ([@nvdk](https://github.com/nvdk))
* [#230](https://github.com/lblod/ember-rdfa-editor/pull/230) Bump tar from 2.2.1 to 2.2.2 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 3
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Ben ([@benjay10](https://github.com/benjay10))
- Niels V ([@nvdk](https://github.com/nvdk))

## 0.51.0 (2022-03-11)

#### :rocket: Enhancement
* [#231](https://github.com/lblod/ember-rdfa-editor/pull/231) debounce text input slightly ([@nvdk](https://github.com/nvdk))
* [#223](https://github.com/lblod/ember-rdfa-editor/pull/223) Enhancement/whitespace handling ([@nvdk](https://github.com/nvdk))

#### :bug: Bug Fix
* [#233](https://github.com/lblod/ember-rdfa-editor/pull/233) Fix bug with predicate node generation ([@abeforgit](https://github.com/abeforgit))
* [#234](https://github.com/lblod/ember-rdfa-editor/pull/234) Bug/mark attribute rendering ([@abeforgit](https://github.com/abeforgit))
* [#235](https://github.com/lblod/ember-rdfa-editor/pull/235) Fix list indentation ([@Dietr](https://github.com/Dietr))

#### :house: Internal
* [#229](https://github.com/lblod/ember-rdfa-editor/pull/229) Bump nanoid from 3.1.30 to 3.3.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#228](https://github.com/lblod/ember-rdfa-editor/pull/228) Bump follow-redirects from 1.14.5 to 1.14.9 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#227](https://github.com/lblod/ember-rdfa-editor/pull/227) Bump engine.io from 6.1.0 to 6.1.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#226](https://github.com/lblod/ember-rdfa-editor/pull/226) Bump node-fetch from 2.6.6 to 2.6.7 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 3
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Niels V ([@nvdk](https://github.com/nvdk))

## 0.50.0 (2022-02-25)

#### :rocket: Enhancement
* [#224](https://github.com/lblod/ember-rdfa-editor/pull/224) Add isEmpty utility method on resultset and term-mapping ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix
* [#225](https://github.com/lblod/ember-rdfa-editor/pull/225) Make backspace handler trigger contentchanged event ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.50.0-beta.10 (2022-02-25)

#### :boom: Breaking Change
* [#222](https://github.com/lblod/ember-rdfa-editor/pull/222) Provide a single stylesheet for the dummy app ([@Dietr](https://github.com/Dietr))

#### :rocket: Enhancement
* [#211](https://github.com/lblod/ember-rdfa-editor/pull/211) Improve datastore interface ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal
* [#222](https://github.com/lblod/ember-rdfa-editor/pull/222) Provide a single stylesheet for the dummy app ([@Dietr](https://github.com/Dietr))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))

If you bump to this release, also upgrade ember-appuniversum to 1.0.0 along with it

## 0.50.0-beta.9 (2022-02-16)

#### :boom: Breaking Change
* [#216](https://github.com/lblod/ember-rdfa-editor/pull/216) Don't export the debug component ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement
* [#219](https://github.com/lblod/ember-rdfa-editor/pull/219) Implement text-matching command ([@abeforgit](https://github.com/abeforgit))
* [#214](https://github.com/lblod/ember-rdfa-editor/pull/214) Expose query utility on markset ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix
* [#220](https://github.com/lblod/ember-rdfa-editor/pull/220) Fix dummy component import ([@abeforgit](https://github.com/abeforgit))
* [#216](https://github.com/lblod/ember-rdfa-editor/pull/216) Don't export the debug component ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal
* [#218](https://github.com/lblod/ember-rdfa-editor/pull/218) Ember-appuniversum upgrade > 0.11.0 ([@Dietr](https://github.com/Dietr))

#### Committers: 3
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Niels V ([@nvdk](https://github.com/nvdk))

## 0.50.0-beta.8 (2022-02-11)

#### :bug: Bug Fix
* [#215](https://github.com/lblod/ember-rdfa-editor/pull/215) Dont update selection on setting marks ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.50.0-beta.7 (2022-02-10)

#### :rocket: Enhancement
* [#212](https://github.com/lblod/ember-rdfa-editor/pull/212) Feature/set attribute in mutator ([@lagartoverde](https://github.com/lagartoverde))
* [#209](https://github.com/lblod/ember-rdfa-editor/pull/209) Feature: Marks and MarksRegistry ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix
* [#213](https://github.com/lblod/ember-rdfa-editor/pull/213) Also recalculate datastore on model-read ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 0.50.0-beta.6 (2022-01-27)

#### :bug: Bug Fix
* [#208](https://github.com/lblod/ember-rdfa-editor/pull/208) Needed support for @plugins on debug component ([@benjay10](https://github.com/benjay10))

#### Committers: 1
- Ben ([@benjay10](https://github.com/benjay10))

## 0.50.0-beta.5 (2022-01-26)

#### :rocket: Enhancement
* [#206](https://github.com/lblod/ember-rdfa-editor/pull/206) Feature/gn 3152 create a debug component for the rdfa editor ([@benjay10](https://github.com/benjay10))

#### :bug: Bug Fix
* [#207](https://github.com/lblod/ember-rdfa-editor/pull/207) moved hints logic to the editor component so it gets tracked ([@lagartoverde](https://github.com/lagartoverde))

#### :house: Internal
* [#200](https://github.com/lblod/ember-rdfa-editor/pull/200) bump docker ember image ([@nvdk](https://github.com/nvdk))

#### Committers: 3
- Ben ([@benjay10](https://github.com/benjay10))
- Niels V ([@nvdk](https://github.com/nvdk))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 0.50.0-beta.4 (2022-01-19)

#### :rocket: Enhancement
* [#204](https://github.com/lblod/ember-rdfa-editor/pull/204) allow browser delete if the feature flag is enabled ([@nvdk](https://github.com/nvdk))

#### :bug: Bug Fix
* [#205](https://github.com/lblod/ember-rdfa-editor/pull/205) Fix broken datastore in prod ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Niels V ([@nvdk](https://github.com/nvdk))

## 0.50.0-beta.3 (2022-01-18)

#### :bug: Bug Fix
* [#202](https://github.com/lblod/ember-rdfa-editor/pull/202) set field directly instead of using this.set ([@nvdk](https://github.com/nvdk))

#### :house: Internal
* [#195](https://github.com/lblod/ember-rdfa-editor/pull/195) Update eslint and various non-ember plugins to latest ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Niels V ([@nvdk](https://github.com/nvdk))

## 0.50.0-beta.2 (2021-12-07)

#### :house: Internal
* [#198](https://github.com/lblod/ember-rdfa-editor/pull/198) Switch to using debug for logging ([@abeforgit](https://github.com/abeforgit))
* [#197](https://github.com/lblod/ember-rdfa-editor/pull/197) Bump codemirror packages to v0.19.x ([@abeforgit](https://github.com/abeforgit))
* [#194](https://github.com/lblod/ember-rdfa-editor/pull/194) Update types for ember-test-helper ([@abeforgit](https://github.com/abeforgit))
* [#193](https://github.com/lblod/ember-rdfa-editor/pull/193) Update typescript-eslint packages to v5.5.0 ([@abeforgit](https://github.com/abeforgit))
* [#192](https://github.com/lblod/ember-rdfa-editor/pull/192) Update ember to 3.24 ([@abeforgit](https://github.com/abeforgit))
* [#191](https://github.com/lblod/ember-rdfa-editor/pull/191) Update ember-try to 1.4.0 and drop support for old ember versions ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.50.0-beta.1 (2021-12-03)

#### :rocket: Enhancement
* [#189](https://github.com/lblod/ember-rdfa-editor/pull/189) Expose termconverter on the datastore directly ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix
* [#190](https://github.com/lblod/ember-rdfa-editor/pull/190) Fire selectionChanged event when needed ([@abeforgit](https://github.com/abeforgit))

#### :memo: Documentation
* [#188](https://github.com/lblod/ember-rdfa-editor/pull/188) Add a todo test for the limitToRange method ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.50.0-beta.0 (2021-12-02)

#### :rocket: Enhancement
* [#185](https://github.com/lblod/ember-rdfa-editor/pull/185) Add the datastore api ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal
* [#187](https://github.com/lblod/ember-rdfa-editor/pull/187) Add package lock ([@abeforgit](https://github.com/abeforgit))
* [#186](https://github.com/lblod/ember-rdfa-editor/pull/186) Update ember-appuniversum ([@Dietr](https://github.com/Dietr))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))

## 0.49.0 (2021-11-26)

#### :rocket: Enhancement
* [#184](https://github.com/lblod/ember-rdfa-editor/pull/184) Use css variables ([@Dietr](https://github.com/Dietr))
* [#182](https://github.com/lblod/ember-rdfa-editor/pull/182) Add a more consistent and flexible treewalker ([@abeforgit](https://github.com/abeforgit))
* [#179](https://github.com/lblod/ember-rdfa-editor/pull/179) Extend and improve eventbus ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix
* [#183](https://github.com/lblod/ember-rdfa-editor/pull/183) Bugfix: we should not have contenteditable tables exported outside the editor ([@Asergey91](https://github.com/Asergey91))

#### Committers: 3
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Sergey Andreev ([@Asergey91](https://github.com/Asergey91))

## 0.48.0 (2021-11-08)

#### :boom: Breaking Change
* [#159](https://github.com/lblod/ember-rdfa-editor/pull/159) faster and cleaner builds ([@nvdk](https://github.com/nvdk))

#### :rocket: Enhancement
* [#171](https://github.com/lblod/ember-rdfa-editor/pull/171) Add ember-appuniversum ([@Dietr](https://github.com/Dietr))
* [#159](https://github.com/lblod/ember-rdfa-editor/pull/159) faster and cleaner builds ([@nvdk](https://github.com/nvdk))
* [#140](https://github.com/lblod/ember-rdfa-editor/pull/140) Copy command ([@RobbeDP](https://github.com/RobbeDP))
* [#151](https://github.com/lblod/ember-rdfa-editor/pull/151) Disable dragstart ([@lagartoverde](https://github.com/lagartoverde))

#### :bug: Bug Fix
* [#178](https://github.com/lblod/ember-rdfa-editor/pull/178) Move get-config to real deps ([@abeforgit](https://github.com/abeforgit))
* [#157](https://github.com/lblod/ember-rdfa-editor/pull/157) Fix sass syntax error ([@abeforgit](https://github.com/abeforgit))
* [#150](https://github.com/lblod/ember-rdfa-editor/pull/150) Fix insert XML ([@RobbeDP](https://github.com/RobbeDP))

#### :house: Internal
* [#161](https://github.com/lblod/ember-rdfa-editor/pull/161) Feature/convert commands to mutators ([@lagartoverde](https://github.com/lagartoverde))
* [#162](https://github.com/lblod/ember-rdfa-editor/pull/162) it's recommended to use may-import-regenerator over babel polyfills ([@nvdk](https://github.com/nvdk))
* [#156](https://github.com/lblod/ember-rdfa-editor/pull/156) bump focus trap ([@nvdk](https://github.com/nvdk))
* [#152](https://github.com/lblod/ember-rdfa-editor/pull/152) moved set property command logic to the operation ([@lagartoverde](https://github.com/lagartoverde))
* [#147](https://github.com/lblod/ember-rdfa-editor/pull/147) Convert list helpers ([@RobbeDP](https://github.com/RobbeDP))

#### Committers: 5
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Niels V ([@nvdk](https://github.com/nvdk))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))
- Robbe De Proft ([@RobbeDP](https://github.com/RobbeDP))

## 0.47.0 (2021-08-31)

#### :rocket: Enhancement
* [#154](https://github.com/lblod/ember-rdfa-editor/pull/154) Collapse the selection upon initializing the editor ([@abeforgit](https://github.com/abeforgit))
* [#132](https://github.com/lblod/ember-rdfa-editor/pull/132) Cut command ([@RobbeDP](https://github.com/RobbeDP))

#### :bug: Bug Fix
* [#153](https://github.com/lblod/ember-rdfa-editor/pull/153) Add word break utility class ([@Dietr](https://github.com/Dietr))
* [#139](https://github.com/lblod/ember-rdfa-editor/pull/139) Refactor commands ([@RobbeDP](https://github.com/RobbeDP))
* [#134](https://github.com/lblod/ember-rdfa-editor/pull/134) Fix cursor behavior when using table dropdown menu ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal
* [#141](https://github.com/lblod/ember-rdfa-editor/pull/141) Convert lump node methods to typescript ([@RobbeDP](https://github.com/RobbeDP))
* [#139](https://github.com/lblod/ember-rdfa-editor/pull/139) Refactor commands ([@RobbeDP](https://github.com/RobbeDP))
* [#138](https://github.com/lblod/ember-rdfa-editor/pull/138) Convert event handlers to typescript ([@RobbeDP](https://github.com/RobbeDP))
* [#136](https://github.com/lblod/ember-rdfa-editor/pull/136) various cleanup chores in the editor ([@nvdk](https://github.com/nvdk))
* [#137](https://github.com/lblod/ember-rdfa-editor/pull/137) Move paste handler to its own input handler ([@RobbeDP](https://github.com/RobbeDP))
* [#131](https://github.com/lblod/ember-rdfa-editor/pull/131) Refactor of table commands ([@RobbeDP](https://github.com/RobbeDP))

#### Committers: 4
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Niels V ([@nvdk](https://github.com/nvdk))
- Robbe De Proft ([@RobbeDP](https://github.com/RobbeDP))

## 0.46.2 (2021-07-16)

#### :bug: Bug Fix
* [#133](https://github.com/lblod/ember-rdfa-editor/pull/133) Make cursor move to correct position after deleting table ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.46.1 (2021-07-13)

#### :bug: Bug Fix
* [#129](https://github.com/lblod/ember-rdfa-editor/pull/129) Remove table when last row or column gets removed ([@RobbeDP](https://github.com/RobbeDP))

#### :house: Internal
* [#128](https://github.com/lblod/ember-rdfa-editor/pull/128) Table column and row commands testing ([@RobbeDP](https://github.com/RobbeDP))
* [#124](https://github.com/lblod/ember-rdfa-editor/pull/124) move the dispatcher service inside the editor addon ([@nvdk](https://github.com/nvdk))

#### Committers: 2
- Niels V ([@nvdk](https://github.com/nvdk))
- Robbe De Proft ([@RobbeDP](https://github.com/RobbeDP))

## 0.46.0 (2021-07-12)

#### :rocket: Enhancement
* [#130](https://github.com/lblod/ember-rdfa-editor/pull/130) Feature/event bus ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix
* [#130](https://github.com/lblod/ember-rdfa-editor/pull/130) Feature/event bus ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal
* [#127](https://github.com/lblod/ember-rdfa-editor/pull/127) Changes to getFromSelection methods in ModelTable ([@RobbeDP](https://github.com/RobbeDP))
* [#126](https://github.com/lblod/ember-rdfa-editor/pull/126) Commands testing + implementation xml table reader ([@RobbeDP](https://github.com/RobbeDP))

#### Committers: 2
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Robbe De Proft ([@RobbeDP](https://github.com/RobbeDP))

## 0.45.0 (2021-07-01)

## 0.45.0-0 (2021-07-01)

#### :rocket: Enhancement
* [#119](https://github.com/lblod/ember-rdfa-editor/pull/119) Feature/logging ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix
* [#123](https://github.com/lblod/ember-rdfa-editor/pull/123) Bugfix/space eats chars ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal
* [#125](https://github.com/lblod/ember-rdfa-editor/pull/125) Add lerna changelog config ([@abeforgit](https://github.com/abeforgit))
* [#120](https://github.com/lblod/ember-rdfa-editor/pull/120) Feature/vendor environment ([@abeforgit](https://github.com/abeforgit))
* [#122](https://github.com/lblod/ember-rdfa-editor/pull/122) Feature/custom dummy data ([@abeforgit](https://github.com/abeforgit))
* [#121](https://github.com/lblod/ember-rdfa-editor/pull/121) Feature/better command logging ([@abeforgit](https://github.com/abeforgit))
* [#118](https://github.com/lblod/ember-rdfa-editor/pull/118) Bump ember-cli-typescript to latest ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))



[unreleased]: https://github.com/lblod/ember-rdfa-editor/compare/v3.9.0...HEAD
[3.9.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.8.1...v3.9.0
[3.8.1]: https://github.com/lblod/ember-rdfa-editor/compare/v3.8.0...v3.8.1
[3.8.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.7.2...v3.8.0
[3.7.2]: https://github.com/lblod/ember-rdfa-editor/compare/v3.7.1...v3.7.2
[3.7.1]: https://github.com/lblod/ember-rdfa-editor/compare/v3.7.0...v3.7.1
[3.7.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.6.0...v3.7.0
[3.6.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.5.0...v3.6.0
[3.5.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.4.1...v3.5.0
[3.4.1]: https://github.com/lblod/ember-rdfa-editor/compare/v3.4.0...v3.4.1
[3.4.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.3.0...v3.4.0
[3.3.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.2.1...v3.3.0
[3.2.1]: https://github.com/lblod/ember-rdfa-editor/compare/v3.2.0...v3.2.1
[3.2.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/lblod/ember-rdfa-editor/compare/v2.1.4...v3.0.0
[2.1.4]: https://github.com/lblod/ember-rdfa-editor/compare/v2.1.3...v2.1.4
[2.1.3]: https://github.com/lblod/ember-rdfa-editor/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/lblod/ember-rdfa-editor/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/lblod/ember-rdfa-editor/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/lblod/ember-rdfa-editor/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/lblod/ember-rdfa-editor/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/lblod/ember-rdfa-editor/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/lblod/ember-rdfa-editor/compare/v1.0.0...v1.1.0
