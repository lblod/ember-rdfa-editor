import { SubscriptIcon } from '@appuniversum/ember-appuniversum/components/icons/subscript';
import Mark from '#root/components/toolbar/mark.ts';
import t from 'ember-intl/helpers/t';

<template>
  <Mark
    @icon={{SubscriptIcon}}
    @title={{t "ember-rdfa-editor.subscript"}}
    @mark="subscript"
    {{! @glint-expect-error: not typesafe yet }}
    @controller={{@controller}}
  />
</template>
