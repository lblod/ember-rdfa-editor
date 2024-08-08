---
'@lblod/ember-rdfa-editor': minor
---

Ensure `SaySerializer` can be used in a headless way.
- Deprecation of passing instance of `SayEditor` to `SaySerializer` constructor and its static functions.
- Add option to pass instance of `StateGenerator` instead of `SayEditor` to `SaySerializer` constructor and its static functions. This is the preffered way of using the serializer going forward and removes its dependency on a view.
