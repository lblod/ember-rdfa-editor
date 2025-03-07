---
'@lblod/ember-rdfa-editor': minor
---

Literal nodes: introduce concept of `defaultLanguage` and `defaultDatatype`:

(loose) literal nodes may define their `defaultLanguage` and `defaultDatatype`.
These attributes are (at the moment) editable through the attribute-editor.

`defaultLanguage` and `defaultDatatype` define what the prefilled values are for `datatype` and `language` in the relationship creation form.

The `defaultLanguage` attribute is serialized as `data-default-language`.
The `defaultDatatype` attribute is serialized as `data-default-datatype`.
