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
This addon provides the `Editor` component as a main entryway to add an instance of the editor.

The following component is an example on how you can include the editor:

```handlebars
<!-- your-application/components/editor.hbs -->
<Editor
  @rdfaEditorInit={{this.editorInit}}
  @schema={{this.schema}}
  @plugins={{this.plugins}}
  @editorOptions={{hash 
    showPaper="true" 
    showSidebar="true" 
    showToolbarBottom=null
  }}
  @toolbarOptions={{hash 
    showTextStyleButtons="true" 
    showListButtons="true" 
    showIndentButtons="true"
  }}
>
  <:top>
    <SampleToolbar @controller={{this.rdfaEditor}}/>
  </:top>
  <:aside>
    <!-- Content which is placed on the right side of the editor -->
  </:aside>
</Editor>
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
  horizontal_rule,
  inline_rdfa,
  paragraph,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  tableKeymap,
  tableMenu,
  tableNodes,
  tablePlugins,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { heading } from '@lblod/ember-rdfa-editor/plugins/heading';
import { Schema } from 'prosemirror-model';

export default class EditorComponent extends Component {
  get schema(){
    // A prosemirror schema which determines how documents are parsed and written to the DOM.
    return new Schema({
      nodes: {
        doc: docWithConfig({
          defaultLanguage: 'nl-BE',
        }),
        paragraph,
        ...tableNodes({
          tableGroup: 'block',
          cellContent: 'block+',
          inlineBorderStyle: { width: '0.5px', color: '#CCD1D9' },
        }),
        heading: headingWithConfig(),
        blockquote,
        horizontal_rule,
        code_block,
        text,
        hard_break,
        block_rdfa: blockRdfaWithConfig(),
      },
      marks: {
        em,
        strikethrough,
        strong,
        underline
      }
    })
  }

  get plugins(){
    // A list of prosemirror plugins you want to enable. More information about prosemirror plugins can be found on https://prosemirror.net/docs/guide/#state.plugins.
    return [...tablePlugins, tableKeymap];
  }

  @action
  editorInit(controller){
    // This method may contain code that runs when the editor has just loaded. It can be useful to e.g. load a document into the editor.
  }
}
```

The above template includes a `SampleToolbar` component. An editor toolbar can be constructed in the following way:

```handlebars
<Toolbar>
  <:left>
    <Toolbar::Group>
      <Toolbar::History::Undo @controller={{@controller}}/>
      <Toolbar::History::Redo @controller={{@controller}}/>
    </Toolbar::Group>
    <Toolbar::Group>
      <Toolbar::Marks::Bold @controller={{@controller}}/>
      <Toolbar::Marks::Italic @controller={{@controller}}/>
      <Toolbar::Marks::Strikethrough @controller={{@controller}}/>
      <Toolbar::Marks::Underline @controller={{@controller}}/>
    </Toolbar::Group>
    <Toolbar::Group>
      <Toolbar::TableMenu @controller={{@controller}}/>
    </Toolbar::Group>
  </:left>
  <:right>
    <!-- Buttons which are placed on the right side in the toolbar -->
  </:right>
</Toolbar>
```

The above sample toolbar component includes options for:
- undoing/redoing editor actions
- applying bold, italic, strikethrough or underline styling to text
- table insertion

The callback provided to `rdfaEditorInit` is called when the editor element is inserted and provides an instance of a `ProseController` which can be used to insert documents inside the editor and execute commands.

The dummy application of this addon includes an extended example on how to include an editor.

## The `Rdfa:RdfaEditor` component

The main editor component may expect the following properties:
- `rdfaEditorInit`: a function which is called on initialization of the editor. It receives an instance of a `ProseController`
- `schema`: an prosemirror `Schema` instance which contain a series of nodes and marks that are supported in the editor
- `plugins`: a list of prosemirror plugins which should be enabled in the editor
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

### The `editorOptions` property

This object contains a series of `string:boolean` pairs. It may contain the following entries:
- showPaper: Show the editor inside a paper like container
- showSidebar: Show a right sidebar for plugins
- showToolbarBottom: Display the toolbar at the bottom of the screen

### The `toolbarOptions` property
This object contains a series of `string:boolean` pairs.
It may contain the following entries:
- showTextStyleButtons: Show text styling buttons (bold, italic, underline, strikethrough)
- showListButtons: Show list styling buttons (ordered list, unordered list)
- showIndentButtons: Show indent buttons (indent, reverse indent)

## The `ProseController` class
Instances of the `ProseController` class can be used to control different aspects of the editor.
🚧 interface docs under construction, refer to the source files for now 🚧

## Experimental: a new approach to handle RDFa in documents
This package also contains an opt-in, experimental way in how RDFa is handled.

### Changes
Instead of using and dealing with plain RDFa attributes, this approach introduces an new `rdfaAware` API:
Two types of RDFa-aware node types are introduced: `resource` nodes and `literal` nodes.

#### Resource nodes
Resource nodes as the name suggests, define a `resource` in a document. This resource is always represented by a URI.
A document may contain multiple resource nodes, which may define the same or different resources.
In equivalent RDFa, a resource node will typically be serialized to an html element with the RDFa `about` attribute.
Resource nodes may contain the following prosemirror attributes:
- `subject`: the URI of the resource
- `properties`: a list of properties defined on the subject/resource. These properties correspond with RDF triples for which the resource URI is the subject.
- `backlinks`: contains the 'inverses' of properties. Corresponds with RDF triples for which the resource URI is the object. The `subject` of these backlinks will typically also be defined in the document using a resource node.
- `__rdfaId`: a unique id representing the resource node. You can use this id to search specific nodes in a document.

#### Literal nodes
Literal nodes define a `literal` in a document. This node will typically be the target of a property defined by a resource node. The content of the `literal` is defined by the content inside a literal node.
Literal nodes may contain the following prosemirror attributes:
- `backlinks`: contains the 'inverses' of properties. Corresponds with RDF triples for which the literal is the object. The `subject` of these backlinks will typically also be defined in the document using a resource node. Literal nodes will typically only have 1 backlink.
- `__rdfaId`: a unique id representing the literal node. You can use this id to search specific nodes in a document.
Note: literal nodes do not have `subject` or `properties` attributes. Literals can not define the subject of an RDF triple.

#### Changes to existing node-specs
Most of the nodes contained in this package (`block_rdfa`, `inline_rdfa`, `heading` etc.) are now provided in two versions: an `rdfaAware` version an a non-`rdfaAware` version:
`blockRdfaWithConfig` replaces `block_rdfa`: `blockRdfaWithConfig` is a configurable node-spec which allows developers to specify whether the node-spec should work in an `rdfaAware` way or not.
Similar to `blockRdfaWithConfig`, other node-specs have also been replaced by a configurable version.
The configurable node-specs are by default non-`rdfaAware`.

#### Other changes included as part of the `rdfaAware` system
Apart from the changes included to the node-specs and the ways we handle RDFa, the `rdfaAware` system also comes with several new (experimental) tools and APIs.
Some of these tools are marked as private (such as experimental GUI tools and API) and are thus not part of the public API.
Among these, the following tools/API are included:
- A new parser/serializer system that allows to correctly parse and serialize `rdfaAware` nodes and documents
- New prosemirror commands to work with the `rdfaAware` system
- GUI tools (some of these are private API) to operate and interact with `rdfaAware` nodes and documents


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

#### Override node classes

You can also customize the look of your editor by either adding styles to the class of each node, or even changing that class to your custom one.
The classes asigned to each node are the following:
| Node | Css class |
|---|---|
| Heading | say-heading |
| Paragraph | say-paragraph |
| RepairedBlock | say-repaired-block |
| ListItem | say-list-item |
| OrderedList | say-ordered-list |
| BulletList | say-bullet-list |
| Placeholder | say-placeholder |
| Table | say-table |
| TableRow | say-table-row |
| TableCell | say-table-cell |
| TableHeader | say-table-header |
| Blockquote | say-blockquote |
| HorizontalRule | say-horizontal-rule |
| HardBreak | say-hard-break |
| InvisibleRdfa | say-invisible-rdfa |
| BlockRdfa | say-block-rdfa |
| InlineRdfa | say-inline-rdfa |
| Link | say-pill say-link |

In order to replace this classes you just have to replace the property class names when using that node in the schema, for example:
```js
schema = new Schema({
    nodes: {
      doc: docWithConfig({
        defaultLanguage: 'nl-BE',
      }),
      paragraph; {...paragraph, classNames: ['my-custom-class']},

```
except on the table, where you will need to add the classNames to the options of the tableNodes function
```js
 ...tableNodes({
        tableGroup: 'block',
        cellContent: 'block+',
        inlineBorderStyle: { width: '0.5px', color: '#CCD1D9' },
        rowBackground: {
          odd: 'whitesmoke',
        },
        classNames: {
          table: ['custom-table-class'];
          table_row: ['custom-table-row-class'];
          table_cell: ['custom-table-cell-class'];
          table_header: ['custom-table-header-class'];
        };
  }),
```

## Embroider
To use `@lblod/ember-rdfa-editor` with Embroider some extra Webpack configuration is needed, which you can import like this:

```js
// ember-cli-build.js
  // ...
  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    // other Embroider options
    packagerOptions: {
      webpackConfig: require('@lblod/ember-rdfa-editor/webpack-config'),
    },
    extraPublicTrees: [],
  });
};
```

If you already provide some Webpack configuration, you can deep merge that with the config object we provide.

## Translation

Translations are provided for UI elements using ember-intl.
Currently the only languages supported are English (en-US) and Dutch (nl-BE).
Other languages can be added by copying the contents of the file `translations/en-us.yaml` into the relevant language file in your `translations` folder and translating all of the strings.

A helper function is provided to assist with finding a reasonable fallback locale, for example providing `en-US` translations if `en` is requested.
See [the test app](tests/dummy/app/routes/application.ts) for example of it's usage.

## Testing

### Playwright

We use Playwright for testing in the browser. There are two types of tests:

* Visual regression tests (VRT) - verifying how the content is rendered in the editor, tagged with `@vrt`.
* Integration tests - verifying the behaviour of the editor, no tags.

#### Available commands

* `e2e:open` - opens Playwright UI locally 
* `e2e:open:docker` - opens Playwright UI in Docker and attempts to connect to your XServer 
* `e2e:run` - runs Playwright tests locally, skipping tests tagged with `@vrt`
* `e2e:run:docker` - runs all Playwright tests in Docker
* `e2e:run:vrt` - runs visual regression tests in Docker
* `e2e:run:vrt:update` - updates visual regression tests after running them in Docker
* `e2e:show-report` - shows the report of the last run

#### Visual regression tests (VRT)

To run visual regression tests locally you need to run `npm run e2e:run:vrt`.  
Afterwards if you need to update the snapshots you can run `npm run e2e:run:vrt:update`.

> [!IMPORTANT]
> Playwright is run in Docker to ensure consistent snapshot comparison results, as it guarantees the same environment for each run.

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
