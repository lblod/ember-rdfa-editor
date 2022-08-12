























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


