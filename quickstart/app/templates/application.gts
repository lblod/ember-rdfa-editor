import { pageTitle } from 'ember-page-title';
import Editor from 'quickstart/components/editor';

<template>
  {{pageTitle "Quickstart"}}
  <h2 id="title">Welcome to Ember</h2>

  <Editor />

  {{outlet}}
</template>
