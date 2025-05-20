import { StrikethroughIcon } from '@appuniversum/ember-appuniversum/components/icons/strikethrough';
import Mark from '#root/components/toolbar/mark.ts';
import t from 'ember-intl/helpers/t';

<template>
  <Mark
    @icon={{StrikethroughIcon}}
    @title={{t "ember-rdfa-editor.strikethrough"}}
    @mark="strikethrough"
    {{! @glint-expect-error: not typesafe yet }}
    @controller={{@controller}}
    {{! @glint-expect-error: not typesafe yet }}
    @onActivate={{@onActivate}}
  />
</template>
