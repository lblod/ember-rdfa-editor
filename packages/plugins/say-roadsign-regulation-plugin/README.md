# @lblod/say-roadsign-regulation-plugin

[![Build Status](https://build.redpencil.io/api/badges/402/status.svg)](https://build.redpencil.io/repos/402)

A plugin for [say-editor](https://say-editor.com) RDFa aware text editor, which fetches data from the [MOW regulation and roadsign registry](https://register.mobiliteit.vlaanderen.be) and allows users to insert roadsign regulations inside an editor document. This data is maintained by experts at [MOW Vlaanderen](https://www.vlaanderen.be/departement-mobiliteit-en-openbare-werken).

This plugin provides a card that needs to be added to the editor sidebar:

```gts
import RoadsignRegulationCard from "@lblod/say-roadsign-regulation-plugin/components/roadsign-regulation-card";

<template>
  <RoadsignRegulationCard
    @controller={{this.controller}}
    @options={{this.config.roadsignRegulation}}
  />
</template>
```

You will need to set the following configuration in the config object

```js
{
  endpoint: 'https://dev.roadsigns.lblod.info/sparql',
  imageBaseUrl: 'https://register.mobiliteit.vlaanderen.be/',
  articleUriGenerator: `http://data.lblod.info/artikels/${uuidv4()}`,
}
```

The `endpoint` from where the plugin will fetch the roadsigns, and the `imageBaseUrl` is a fallback for the images that don't have a baseUrl specified. This won't be used if your data is correctly constructed. The `articleUriGenerator` generates the URIs used for decision articles that the plugin generates.

## Prosemirror node-specs

This plugin defines the following node-spec, which only needs to be added to the Prosemirror schema for backwards compatibility if supporting older documents created using this plugin:

```
import { roadsign_regulation } from '@lblod/say-roadsign-regulation-plugin/plugin/nodes';
```
