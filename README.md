# @lblod/ember-rdfa-editor
[![Build Status](https://rpio-drone.redpencil.io/api/badges/lblod/ember-rdfa-editor/status.svg)](https://rpio-drone.redpencil.io/lblod/ember-rdfa-editor)

Emberjs addon that provides an RDFa aware rich text editor based on the [Prosemirror toolkit](https://prosemirror.net/). 

Main features:

 * basic styling, lists and tables
 * support for plugins
 * RDFa aware

## Installation

```sh
npm install @lblod/ember-rdfa-editor
# or
ember install @lblod/ember-rdfa-editor
```

## Basic example

This section includes a basic example on how to include an instance of the editor in you application.
This addon provides the `Rdfa::RdfaEditor` component as a main entryway to add an instance of the editor.

The following component is an example on how you can include the editor:

```handlebars
<!-- your-application/components/editor.hbs -->
<Rdfa::RdfaEditor
  @rdfaEditorInit={{this.editorInit}}
  @schema={{this.schema}}
  @plugins={{this.plugins}}
  @widgets={{this.widgets}}
  @editorOptions={{hash 
    showToggleRdfaAnnotations="true" 
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

```js
// your-application/components/editor.js
import { action } from '@ember/object';
import {
  em,
  strikethrough,
  strong,
  underline,
} from '@lblod/ember-rdfa-editor/marks';
import {
  block_rdfa,
  blockquote,
  doc,
  hard_break,
  heading,
  horizontal_rule,
  inline_rdfa,
  paragraph,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  tableKeymap,
  tableMenu,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { Schema } from 'prosemirror-model';

export default class EditorComponent extends Component {
  get schema(){
    // A prosemirror schema which determines how documents are parsed and written to the DOM.
    return new Schema({
      nodes: {
        doc,
        paragraph,
        ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
        heading,
        blockquote,
        horizontal_rule,
        code_block,
        text,
        hard_break,
        block_rdfa,
      },
      marks: {
        inline_rdfa,
        em,
        strikethrough,
        strong,
        underline
      }
    })
  }

  get plugins(){
    // A list of prosemirror plugins you want to enable. More information about prosemirror plugins can be found on https://prosemirror.net/docs/guide/#state.plugins.
    return [tablePlugin, tableKeymap];
  }

  get widgets(){
    // A list of widgets which should be shown in the toolbar and sidebar of the editor.
    return [tableMenu]
  }

  @action
  editorInit(controller){
    // This method may contain code that runs when the editor has just loaded. It can be useful to e.g. load a document into the editor.
  }
}
```

The callback provided to `rdfaEditorInit` is called when the editor element is inserted and provides an instance of a `ProseController` which can be used to insert documents inside the editor and execute commands.

The dummy application of this addon includes an extended example on how to include an editor.

## The `Rdfa:RdfaEditor` component

The main editor component may expect the following properties:
- `rdfaEditorInit`: a function which is called on initialization of the editor. It receives an instance of a `ProseController`
- `schema`: an prosemirror `Schema` instance which contain a series of nodes and marks that are supported in the editor
- `plugins`: a list of prosemirror plugins which should be enabled in the editor
- `widgets`: a list of editor widget configurations which determine which widgets should be displayed in the toolbar and sidebar
- `nodeViews`: a function which expects an argument of type `ProseController` and returns a series of prosemirror `
- `editorOptions`: an object containing different options for the editor
- `toolbarOptions`: an object containing different options for the editor toolbar

### The `rdfaEditorInit` property
A function which is called on initialization of the editor. It receives an instance of a `ProseController`. This function is typically used to load documents into the editor.

### The `schema` property
A Prosemirror schema which should be used to parse and serialize the document. It contains both a series of nodes and marks. More information about Prosemirror schemas can be found on https://prosemirror.net/docs/guide/#schema. This packages already provides some nodes and marks which you can use to compose your own schema.

### The `plugins` property
A list of Prosemirror plugins which can modify the behaviour of the editor. Examples include keymaps to add shortcuts. More information can be found on https://prosemirror.net/docs/guide/#state.plugins.

### The `nodeViews` property
A function with the type `(controller: ProseController) => Record<string, NodeViewConstructor>`.

It allows you to provide an object contain a series of `NodeViewConstructor` functions which replace the default nodeviews of specific node types. Nodeviews typically allow you to override the behaviour of the nodes inside the editor, e.g. to add custom elements. More information about nodeviews can be found on https://prosemirror.net/docs/ref/#view.NodeView. 

### The `widgets` property
A list of widget configurations (see the `WidgetSpec` type) which allow you to add widgets to the toolbar or sidebar of the editor.

### The `editorOptions` property

This object contains a series of `string:boolean` pairs. It may contain the following entries:
- showToggleRdfaAnnotations: Show annotations toggle switch and add rdfa annotations view
- showRdfa: Show RDFA in the editor
- showRdfaHighlight: Show Rdfa highlights
- showRdfaHover: Show Rdfa information on hover
- showPaper: Show the editor inside a paper like container
- showSidebar: Show a right sidebar for plugins
- showToolbarBottom: Display the toolbar at the bottom of the screen

### The `toolbarOptions` property
This oject contains a series of `string:boolean` pairs.
It may contain the following entries:
- showTextStyleButtons: Show text styling buttons (bold, italic, underline, strikethrough)
- showListButtons: Show list styling buttons (ordered list, unordered list)
- showIndentButtons: Show indent buttons (indent, reverse indent)

## The `ProseController` class
Instances of the `ProseController` class can be used to control different aspects of the editor.

It provides the following methods:
- `toggleMark(name: string, includeEmbeddedView = false)`: method which allows to enable/disable a specific mark on the current selection. Expects the name of the mark to toggle and whether the command should be applied on an embedded editor view if such a view is active.
- `focus(includeEmbeddedView = false)`: method which allows one to focus the main editor view (or an embedded view, if such a view is active).
- `setHtmlContent(content: string)`: sets the content of the main editor.
- `doCommand(command: Command, includeEmbeddedView = false)`: executes a Prosemirror command (https://prosemirror.net/docs/guide/#commands) on the main editor, or when active an embedded editor instance.
- `checkCommand(command: Command, includeEmbeddedView = false)`: checks whether a Prosemirror command may be executed.
- `isMarkActive(mark: MarkType, includeEmbeddedView = false)`: checks whether a mark is currently active.
- `withTransaction(callback: (tr: Transaction) => Transaction | null, includeEmbeddedView = false)`: method which allows you to apply a transaction on the main view (or currently active embedded view). When you want to apply the transaction, the callback should return a transaction object.
- `getState(includeEmbeddedView = false)`: used to request the current state of the main editor view (or an embedded view if active).
- `getView`: used to request the main editor view (or an embedded view if active).
- `setEmbeddedView(view: RdfaEditorView)`: activate a specific embedded view.
- `clearEmbeddedView`: deactive the current embedded view.

Additionally, a controller provides the following attributes:
- `externalContextStore`: provides an instance of `ProseStore` describing the RDFa around the editor element.
- `datastore`: provides an instance of `ProseStore` describing the RDFa inside the editor element.
- `widgets`: provides a map of widgets which are currently enabled.
- `schema`: provides the schema of the main editor.
- `state`: provides the current state (see https://prosemirror.net/docs/guide/#state) of the main editor.
- `view`: provides the main editor view (see https://prosemirror.net/docs/guide/#view).


## Widgets
Additional editor widgets can be defined using widget-specs.

An object of the type `WidgetSpec` expects the following attributes:
- `componentName`: the path of the widget Ember component.
- `desiredLocation`: the location the widget should be displayed at.
- (optional) `widgetArgs`: the arguments the widget should receive. These can be accessed in the component using `this.args.widgetArgs`.

A list of these `WidgetSpecs` can be passed to the `widgets` argument of the editor component.

## More examples
More examples on how to integrate this editor in your application can be found in the dummy app of this addon or in the plugins repository of the LBLOD project (https://github.com/lblod/ember-rdfa-editor-lblod-plugins).

You can discover additional examples on how to write Prosemirror schemas, plugins, node-specs etc. on https://prosemirror.net/examples/.

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

* Ember.js v3.28 or above
* Ember CLI v3.28 or above
* Node.js v18 or above


## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

# Credits

This project makes use of the [ProseMirror toolkit](https://prosemirror.net/), created by [Marijn Haverbeke](https://github.com/marijnh).

This project makes use of a modified version of [rdfa-streaming-parser](https://github.com/rubensworks/rdfa-streaming-parser.js),
created by [Ruben Taelman](https://github.com/rubensworks) and distributed under the [MIT license](https://github.com/rubensworks/rdfa-streaming-parser.js/blob/master/LICENSE.txt).

Due to unique requirements which would not benefit the original project we opted to make our modifications 
in-house rather than contributing to the upstream.

Test README change 2