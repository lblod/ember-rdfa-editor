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

To include the editor in a template (ember octane syntax) you can use the following block:
```
        <Rdfa::RdfaEditor
          @rdfaEditorInit={{this.rdfaEditorInit}}
          @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
          @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
        />

```

The callback provided to rdfaEditorInit is called when the editor element is inserted and provides an object with the following interface:
 - property `htmlContent`: a cleaned up (with as much as possible internal state remove) version of the htmlContent
 - property `richNode`: a copy of the internal representation of the document.
 - property `rootNode`: a copy of the dom of the editor (includes the editor element)
 - function `setHtmlContent(html)`: function to set the html content of the editor
 
You can pass basic options when you load the editor. Add a value of "true" to enable. Remove option or pass null to disable.

#### Editor Options

- showToggleRdfaAnnotations: Show annotations toggle switch and add rdfa annotations view
- showInsertButton: Show template insert button
- showRdfa: Show RDFA in the editor
- showRdfaHighlight: Show Rdfa highlights
- showRdfaHover: Show Rdfa information on hover

#### Toolbar Options

- showTextStyleButtons: Show text styling buttons (bold, italic, underline, strikethrough)
- showListButtons: Show list styling buttons (ordered list, unordered list)
- showIndentButtons: Show indent buttons (indent, reverse indent)


## Feature flags
Some experimental features of the editor are hidden behind feature flags. They can be enabled for testing, but probably should not be enabled on a production system. 
The flags can be set in the config/environment.js of your application.

```
// config/environment.js
module.exports = function(environment) {
  var ENV = {
    featureFlags: {
      'editor-html-paste': true,
    }
  };

  if (environment === 'production') {
    ENV.featureFlags['editor-html-paste'] = false;
  }

  return ENV;
};
```
* editor-html-paste: if enabled, support html paste input
* editor-extended-html-paste: if enabled, support extended html paste input (old behavior)
* editor-force-paragraph: if enabled, wrap text input in a paragraph if it's not already wrapped.

## Styling

If you use vanilla css the `ember-rdfa-editor` will add the default styles to your vendor css file. 

However, if you are using `ember-cli-sass` the addon you need to import the addon styles yourself. 

```
@import "ember-rdfa-editor";
```

When installing this through `ember install` the addon will add the snippet above automatically for you in your `app.scss`.

### Customisation

If you are using `ember-cli-sass` you can override the variables to provide a custom theme for the editor.
- [_s-colors.scss](https://github.com/lblod/ember-rdfa-editor/blob/master/app/styles/ember-rdfa-editor/_s-colors.scss): Collection of colors used.
- [_s-settings.scss](https://github.com/lblod/ember-rdfa-editor/blob/master/app/styles/ember-rdfa-editor/_s-settings.scss): General settings (spacing, font family, sizes and weights, media-queries)
- [_s-theme.scss](https://github.com/lblod/ember-rdfa-editor/blob/master/app/styles/ember-rdfa-editor/_s-theme.scss): Specific theme variables


## Compatibility
* Ember.js v3.12 or above
* Ember CLI v2.13 or above
* Node.js v10 or above



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
