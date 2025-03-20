import { SuperscriptIcon } from '@appuniversum/ember-appuniversum/components/icons/superscript';
import Mark from '@lblod/ember-rdfa-editor/components/toolbar/mark.ts';
import t from 'ember-intl/helpers/t';

<template>
  <Mark
    @icon={{SuperscriptIcon}}
    @title={{t "ember-rdfa-editor.superscript"}}
    @mark="superscript"
    {{! @glint-expect-error: not typesafe yet }}
    @controller={{@controller}}
  />
</template>
