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
import { ROADSIGN_REGULATION_DECISION_TYPES } from '../plugin/constants.ts';

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
    if (decisionContext) {
      if (!decisionContext.decisionType) {
        // No type for passed decision, so assume it's valid
        return true;
      }
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
      ROADSIGN_REGULATION_DECISION_TYPES.includes(type),
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
