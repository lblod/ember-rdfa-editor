---
'@lblod/ember-rdfa-editor': minor
---

Updates to the `OptionGenerator` interfaces
- The `subjectOptionGenerator`, `predicateOptionGenerator` and `objectOptionGenerator` have been collected into a single `optionGeneratorConfig` argument. This makes it easier to provide sample/default configs as a single variable/export.
- `PredicateOption`: if the `direction` is 'property', an optional `allowFreeTextTarget` may be passed. This allows end-users to type in a free-text literal as object when that specific predicate option is selected.
- the `PredicateOptionGenerator` now also optionally receives a `Direction` ('property'/'backlink') as filter input.
