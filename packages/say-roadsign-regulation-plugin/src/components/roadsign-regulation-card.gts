// TODO this should really live in a 'LBLOD utils' package instead of being duplicated here
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SayController } from '@lblod/ember-rdfa-editor';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/decision-utils';
import { type RoadsignRegulationPluginOptions } from '#root/plugin/types.ts';
import { RDF } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/constants';
import { type OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import RoadsignsModal from './roadsigns-modal.gts';
import { not } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';

const ACCEPTED_TYPES = [
  'https://data.vlaanderen.be/id/concept/BesluitType/4d8f678a-6fa4-4d5f-a2a1-80974e43bf34',
  'https://data.vlaanderen.be/id/concept/BesluitType/7d95fd2e-3cc9-4a4c-a58e-0fbc408c2f9b',
  'https://data.vlaanderen.be/id/concept/BesluitType/3bba9f10-faff-49a6-acaa-85af7f2199a3',
  'https://data.vlaanderen.be/id/concept/BesluitType/0d1278af-b69e-4152-a418-ec5cfd1c7d0b',
  'https://data.vlaanderen.be/id/concept/BesluitType/e8afe7c5-9640-4db8-8f74-3f023bec3241',
  'https://data.vlaanderen.be/id/concept/BesluitType/256bd04a-b74b-4f2a-8f5d-14dda4765af9',
  'https://data.vlaanderen.be/id/concept/BesluitType/67378dd0-5413-474b-8996-d992ef81637a',
];

type Signature = {
  Args: {
    controller: SayController;
    options: RoadsignRegulationPluginOptions;
  };
};

export default class RoadsingRegulationCard extends Component<Signature> {
  @tracked modalOpen = false;

  @action
  openModal() {
    this.controller.focus();
    this.modalOpen = true;
  }

  @action
  closeModal() {
    this.modalOpen = false;
  }

  get controller() {
    return this.args.controller;
  }

  get showCard() {
    const decisionContext = this.args.options.decisionContext;
    let decisionTypes = [];
    if (decisionContext && decisionContext.decisionType) {
      decisionTypes = [decisionContext.decisionType];
    } else {
      const decisionRange = getCurrentBesluitRange(this.controller);
      if (!decisionRange) {
        return false;
      }
      const decisionNode = decisionRange.node;
      const properties = decisionNode.attrs['properties'] as OutgoingTriple[];
      decisionTypes = properties
        .filter(
          ({ predicate, object }) =>
            RDF('type').matches(predicate) && object.termType === 'NamedNode',
        )
        .map((property) => property.object.value);
    }

    const decisionHasAcceptedType = decisionTypes.some((type) =>
      ACCEPTED_TYPES.includes(type),
    );
    return decisionHasAcceptedType;
  }

  <template>
    <li class="au-c-list__item">
      <AuButton
        @skin="link"
        @icon={{AddIcon}}
        @iconAlignment="left"
        @disabled={{not this.showCard}}
        {{on "click" this.openModal}}
      >
        {{t "editor-plugins.roadsign-regulation.card.insert-measure"}}
      </AuButton>
    </li>
    <RoadsignsModal
      @modalOpen={{this.modalOpen}}
      @closeModal={{this.closeModal}}
      @controller={{@controller}}
      @options={{@options}}
    />
  </template>
}
