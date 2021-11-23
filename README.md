# @lblod/ember-rdfa-editor
[![Build Status](https://rpio-drone.redpencil.io/api/badges/lblod/ember-rdfa-editor/status.svg)](https://rpio-drone.redpencil.io/lblod/ember-rdfa-editor)

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
          @editorOptions={{hash 
            showToggleRdfaAnnotations="true" 
            showInsertButton=null 
            showRdfa="true" 
            showRdfaHighlight="true" 
            showRdfaHover="true" 
            showPaper="true" 
            showSidebar="true" 
            showToolbarBottom=null
          }}
          @toolbarOptions={{hash 
            showTextStyleButtons="true" 
            showListButtons="true" 
            showIndentButtons="true"
          }}
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
- showPaper: Show the editor inside a paper like container
- showSidebar: Show a right sidebar for plugins
- showToolbarBottom: Display the toolbar at the bottom of the screen

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

Ember-rdfa-editor requires users of the addon to import its SASS stylesheets. To support sass you must install `ember-cli-sass`. The stylesheets provided by ember-rdfa-editor can be imported with the following import statement:

```
@import "ember-rdfa-editor";
```

When installing this through `ember install` the addon will add the snippet above automatically for you in your `app.scss`.

### Customisation

This addon uses CSS variables to customise the styling. You can override these variables by including and overriding the following variables:

```
:root {
  --au-white: #FFFFFF;
  --au-gray-100: #F4F5F6;
  --au-gray-200: #E6E8EB;
  --au-gray-300: #CCD1D9;
  --au-gray-400: #A1ABBA;
  --au-gray-500: #8E98A6;
  --au-gray-600: #69717C;
  --au-gray-700: #545961;
  --au-gray-800: 2A2D31;
  --au-gray-900: #212326;
  --au-gray-1000: #000000;
  --au-blue-100: #FAF4FF;
  --au-blue-200: #F2E0FF;
  --au-blue-300: #E1B8FF;
  --au-blue-500: #B34BFF;
  --au-blue-600: #A933FF;
  --au-blue-700: #9000FA;
  --au-blue-800: #7700CE;
  --au-blue-900: #550094;
  --au-yellow-100: #FFF9D5;
  --au-yellow-200: #FFF29B;
  --au-yellow-300: #FEE539;
  --au-yellow-400: #FFC515;
  --au-yellow-600: #7F6E3B;
  --au-yellow-900: #473D21;
  --au-red-100: #FCF3F3;
  --au-red-200: #F7E3E3;
  --au-red-500: #FF4141;
  --au-red-600: #D92626;
  --au-red-700: #AB1F1F;
  --au-red-900: #470000;
  --au-green-100: #F7FAE5;
  --au-green-200: #ECF2CD;
  --au-green-400: #B3E000;
  --au-green-500: #8BAE00;
  --au-green-700: #5F750B;
  --au-green-900: #323D08;
  --au-global-font-size: 1.5rem;
  --au-global-line-height: 1.5;
  --au-font: BlinkMacSystemFont, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --au-light: 300;
  --au-regular: 400;
  --au-medium: 500;
  --au-bold: 700;
  --au-page-bg: #FFFFFF;
  --au-select-text-color: #212326;
  --au-select-text-bg: #F2E0FF;
  --au-radius: .3rem;
  --au-border: .2rem;
  --au-outline-color: #B34BFF;
  --au-outline-border: .3rem;
  --au-outline-border-style: solid;
  --au-outline: .3rem solid rgba(#A933FF,.65);
  --au-outline-offset: .2rem;
  --au-outline-offset-negative: -.3rem;
  --au-duration: .125s;
  --au-easing: cubic-bezier(0.190,  1.000, 0.220, 1.000);
  --au-transition: .125s cubic-bezier(0.190,  1.000, 0.220, 1.000);
  --au-z-index-alpha: 1;
  --au-z-index-beta: 2;
  --au-z-index-gamma: 3;
  --duet-color-primary: #A933FF;
}
```


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
