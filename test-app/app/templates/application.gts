import { LinkTo } from '@ember/routing';
import { pageTitle } from 'ember-page-title';
import AuModalContainer from '@appuniversum/ember-appuniversum/components/au-modal-container';
import BasicDropdownWormhole from 'ember-basic-dropdown/components/basic-dropdown-wormhole';

<template>
  {{pageTitle "Dummy"}}
  <AuModalContainer />
  <nav class="navbar">
    <LinkTo class="navigation-link" @route="index">Home</LinkTo>
    <LinkTo class="navigation-link" @route="plugins">With Dummy Plugins</LinkTo>
    <LinkTo class="navigation-link" @route="vendors">Vendor Environment</LinkTo>
    <LinkTo class="navigation-link" @route="editable-node">Editable Nodes POC</LinkTo>
    <LinkTo class="navigation-link" @route="space-invisible">Space Invisible</LinkTo>
  </nav>
  {{outlet}}
  <BasicDropdownWormhole />
</template>
