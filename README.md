# @lblod/ember-rdfa-editor
Addon wrapping an RDFa editor with a public API.

The addon currently consists of the following components:
* RDFa editor
* Highlight registry
* RDFa context scanner

## Installation
```
ember install @lblod/ember-rdfa-editor
```

Next, generate the configuration file for the editor-plugins.
```
ember generate @lblod/ember-rdfa-editor-plugin-system-dispatcher
```

## Plugins
To enrich the editor functionality with rdfa-editor-plugins, execute the following steps:
1. Install the rdfa-editor-plugin as an Ember addons in your host app
2. Add the name of the plugin to one or more editor profiles in `config/editor-profiles.js` in your host app

The plugin will automatically be picked up by the editor.
