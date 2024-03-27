import { UnderlinedIcon } from '@appuniversum/ember-appuniversum/components/icons/underlined';
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
