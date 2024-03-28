import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const StrikethroughIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync(
      '@appuniversum/ember-appuniversum/components/icons/strikethrough',
    ).StrikethroughIcon
  : 'strikethrough';
import Mark from '@lblod/ember-rdfa-editor/components/toolbar/mark';
import t from 'ember-intl/helpers/t';

<template>
  <Mark
    @icon={{StrikethroughIcon}}
    @title={{t 'ember-rdfa-editor.strikethrough'}}
    @mark='strikethrough'
    {{! @glint-expect-error: not typesafe yet }}
    @controller={{@controller}}
  />
</template>
