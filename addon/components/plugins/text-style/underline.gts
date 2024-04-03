import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const UnderlinedIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/underlined')
      .UnderlinedIcon
  : 'underlined';
import Mark from '@lblod/ember-rdfa-editor/components/toolbar/mark';
import t from 'ember-intl/helpers/t';

<template>
  <Mark
    @icon={{UnderlinedIcon}}
    @title={{t 'ember-rdfa-editor.underline'}}
    @mark='underline'
    {{! @glint-expect-error: not typesafe yet }}
    @controller={{@controller}}
  />
</template>
