import { ItalicIcon } from '@appuniversum/ember-appuniversum/components/icons/italic';
import Mark from '#root/components/toolbar/mark.ts';
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
