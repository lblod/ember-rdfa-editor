---
'@lblod/ember-rdfa-editor': patch
---

Addition of `vm-browserify` dependency. This dependency is required as one of the other dependencies (`parse-asn1`) now depends on `vm` (which is built in into node and requires a polyfill on the browser).
For more information on this subject, check out https://github.com/browserify/parse-asn1/issues/46

