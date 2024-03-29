import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const ItalicIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/italic')
      .ItalicIcon
  : 'italic';
import Mark from '@lblod/ember-rdfa-editor/components/toolbar/mark';
import t from 'ember-intl/helpers/t';

<template>
  <Mark
    @icon={{ItalicIcon}}
    @title={{t 'ember-rdfa-editor.italic'}}
    @mark='em'
    {{! @glint-expect-error: not typesafe yet }}
    @controller={{@controller}}
  />
</template>
