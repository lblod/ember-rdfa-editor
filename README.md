# @lblod/ember-rdfa-editor
[![Build Status](https://rpio-drone.redpencil.io/api/badges/lblod/ember-rdfa-editor/status.svg)](https://rpio-drone.redpencil.io/lblod/ember-rdfa-editor)

Emberjs addon that provides an RDFa aware rich text editor. This component forms the core of say editor.
The editor can be enriched with plugins to give hints for specific content entered in the editor (e.g. dates, templates, citations, etc.). The hints will typically insert RDFa annotations in the content.

Main features:

 * basic styling, lists and tables
 * support for plugins
 * RDFa aware


## Installation

```sh
ember install @lblod/ember-rdfa-editor
```

To include the editor in a template (ember octane syntax) you can use the following block:

```handlebars
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
  @pasteBehaviour='standard-html' {{! default is standard-html }}
/>
```

The `pasteBehaviour` property can be one of three different values:
- `textonly`: the `text/plain` buffer of the clipboard is read and pasted.
- `standard-html`: structural html which is supported by the editor is kept intact
- `full-html`: all structural html is kept intact

The default default value for `pasteBehaviour` is `standard-html`.

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

## Styling

Ember-rdfa-editor requires users of the addon to import its SASS stylesheets. To support sass you must install `ember-cli-sass`. The stylesheets provided by ember-rdfa-editor can be imported with the following import statement:

```
@import "ember-rdfa-editor";
```

When installing this through `ember install` the addon will add the snippet above automatically for you in your `app.scss`.

### Customisation

This addon uses CSS variables to customise the styling. You can override these variables by including and overriding the following variables:

```css
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

* Ember.js v3.24 or above
* Ember CLI v3.24 or above
* Node.js v12 or above


## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.


## Plugins

### Adding a plugin to the editor
You can easily find plugins developed for lblod by using the following [github search](https://github.com/search?q=org%3Alblod+ember-rdfa-editor+plugin+archived%3Afalse&type=Repositories&ref=advsearch&l=&l=).

To enrich the editor functionality with rdfa-editor-plugins, execute the following steps:

1.  Install the plugin as an Ember addon in your host app using `ember install [plugin-name]`
2.  pass the required plugins by name to the editor

```handlebars
<Rdfa::RdfaEditor
  @plugins={{array "besluit" "standard-template"}}
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

### Developing a plugin

A plugin is an Ember addon that provides at minimum a plugin class. An instance of this class is constructed by the editor and provided with a [controller](https://github.com/lblod/ember-rdfa-editor/blob/master/addon/model/controller.ts) in an (optionally async) initialize method.  An example can be found in the [standard-template plugin](https://github.com/lblod/ember-rdfa-editor-standard-template-plugin/blob/master/addon/standard-template-plugin.js). Make sure to register this class in the ember container using an initializer, for example:

```js
import StandardTemplatePlugin from '../standard-template-plugin';

function pluginFactory(plugin) {
  return {
    create: (initializers) => {
      const pluginInstance = new plugin();
      Object.assign(pluginInstance, initializers);
      return pluginInstance;
    },
  };
}

export function initialize(application) {
  application.register(
    'plugin:standard-template',
    pluginFactory(StandardTemplatePlugin),
    {
      singleton: false,
    }
  );
}

export default {
  initialize,
};
```

If you want to test the addon with a dummy app, you could use the debug component to enable debugging features (this was previously done by copying dummy code from the editor). 

To use the debug component create an rdfa-editor-with-debug.js file in `/tests/dummy/app/components` with the contents:

```js
export {default} from "@lblod/ember-rdfa-editor/components/rdfa/rdfa-editor-with-debug";
```

include the following dependencies as devDependencies in `package.json`:

```
@codemirror/basic-setup
@codemirror/lang-html
@codemirror/lang-xml
xml-formatter
```

The debug component can then be added with `<RdfaEditorWithDebug>` to your dummy app templates. It should support the same variables as the `<Rdfa::RdfaEditor>`. Note that the debug component does not require a namespace prefix because you just imported it directly in the dummy app with the previous steps. The block content of the debug component is yielded at the top of the component, right before the debug features. E.g.:

```handlebars
<RdfaEditorWithDebug
  @rdfaEditorInit={{this.rdfaEditorInit}}
  @plugins={{this.plugins}}
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
  }}>
  <h1>Plugin title - dummy app</h1>
</RdfaEditorWithDebug>
```

# Credits

This project makes use of a modified version of [rdfa-streaming-parser](https://github.com/rubensworks/rdfa-streaming-parser.js),
created by [Ruben Taelman](https://github.com/rubensworks) and distributed under the [MIT license](https://github.com/rubensworks/rdfa-streaming-parser.js/blob/master/LICENSE.txt).

Due to unique requirements which would not benefit the original project we opted to make our modifications 
in-house rather than contributing to the upstream.
