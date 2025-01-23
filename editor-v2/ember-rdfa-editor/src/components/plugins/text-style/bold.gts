import { BoldIcon } from '@appuniversum/ember-appuniversum/components/icons/bold';
import Mark from '@lblod/ember-rdfa-editor/components/toolbar/mark';
import t from 'ember-intl/helpers/t';

<template>
  <Mark
    @icon={{BoldIcon}}
    @title={{t 'ember-rdfa-editor.bold'}}
    @mark='strong'
    {{! @glint-expect-error: not typesafe yet }}
    @controller={{@controller}}
  />
</template>
