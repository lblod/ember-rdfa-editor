








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


