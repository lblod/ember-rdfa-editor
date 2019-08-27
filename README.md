# @lblod/ember-rdfa-editor
Emberjs addon that provides an RDFa aware rich text editor. This component forms the core of say editor.
The editor can be enriched with plugins to give hints for specific content entered in the editor (e.g. dates, templates, citations, etc.). The hints will typically insert RDFa annotations in the content.

Main features:

 * toolbar for bold/italic/lists/indentation
 * support for plugins
 * support for plugin profiles
 * hints registry
 * RDFa aware


## Installation
```
ember install @lblod/ember-rdfa-editor
```

To include the editor in a template
```
    {{rdfa-editor class="rdfa-editor" profile=profile value=editorDocument.content rdfaEditorInit=(action "handleRdfaEditorInit")}}

```
## Compatibility

* Ember.js v3.4 or above
* Ember CLI v2.13 or above
* Node.js v8 or above

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## Plugins
### Adding a plugin to the editor
To enrich the editor functionality with rdfa-editor-plugins, execute the following steps:
1. Install the rdfa-editor-plugin as an Ember addon in your host app.
2. Add the name of the plugin to one or more editor profiles in `app/config/editor-profiles.js` in your host app

The plugin will automatically be picked up by the editor.

E.g. `app/config/editor-profiles.js`
```javascript
export default {
  default: [
    "rdfa-editor-standard-template-plugin",
    "rdfa-editor-date-plugin"
  ],
  all: [
    "rdfa-editor-console-logger-plugin",
    "rdfa-editor-standard-template-plugin",
    "rdfa-editor-date-plugin"
  ],
  none: []
};
```

### Developing a plugin
A plugin is an Ember addon providing a service that implements `execute` to handle changes in the editor and provides a component to display hints.

#### Service interface
The Ember Service must provide an `execute` property that updates the hints in the hints registry based on changes in the editor. `execute` might be an async function or a [Ember Concurrency](http://ember-concurrency.com) task accepting the following parameters:
* `hrId` [string]: Unique identifier of the event in the hintsRegistry
* `contexts` [Array]: RDFa contexts of the text snippets the event applies on
* `hintsRegistry` [Object]: Registry of hints in the editor
* `editor` [Object]: editor The RDFa editor instance

__Execute as an async function__

```javascript
export default Service.extend({

  async execute(hrId, contexts, hintsRegistry, editor) {
    // update hints in the hints registry
  }

})
```

__Execute as a task__

```javascript
export default Service.extend({
  execute: task(function * (hrId, contexts, hintsRegistry, editor) {
    // update hints in the hints registry
  })

})
```

#### Updating the hints registry
`execute` must update the hints of this plugin in the [editor's hints registry](https://github.com/lblod/ember-rdfa-editor/blob/master/addon/utils/hints-registry.js). The following methods might be of use:
- __addHints(hrId, who, cards)__
  - `hrId` [string]: Unique identifier of the event in the hintsRegistry
  - `who` [string]: Identifier of the type of hint in the hints registry (e.g. `editor-plugins/date-card`)
  - `cards` [Array]: Array of hint objects to add to the hints registry
- __removeHintsInRegion(region, hrId, who)__
  - `region` [int, int]: [start, end] of the region to remove hints in
  - `hrId` [string]: Unique identifier of the event in the hintsRegistry
  - `who` [string]: Identifier of the type of hint in the hints registry (e.g. `editor-plugins/date-card`)

#### Hint cards
Hints in the editor are displayed as cards that only apply on a specific portion of the text. A hint added to the hints registry must be an `EmberObject` with the following properties:
  - `card` [string]: name of the component to display the hint
  - `location` [int, int]: [start, end] index of the text in the editor the hint must be displayed on
  - `info` [Object]: custom object that will be passed in the `info` property to the card component
  - `options.noHighlight` [boolean]: Setting this to false removes the highlight by which users know a hint is given.  Use this for passive hints.

The hints registry will render the hints with the specified component when the text the hint applies on is selected.
