import Component from '@glimmer/component';
import { type TrafficSignalConcept } from '#root/plugin/schemas/traffic-signal-concept.ts';
import { type SignPreviewItem } from '#root/plugin/generate-measure-sign-tree.ts';
import { fn } from '@ember/helper';
import AuCheckbox from '@appuniversum/ember-appuniversum/components/au-checkbox';
import isSelectedSign from '#root/helpers/is-selected-sign.ts';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '#root/plugin/constants.ts';
import type IntlService from 'ember-intl/services/intl';
import { service } from '@ember/service';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { NavDownIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-down';
import TrafficMeasureSubSignList from '#root/components/sub-sign-list.gts';
import { on } from '@ember/modifier';
import { and } from 'ember-truth-helpers';

function signalLabel(signal: TrafficSignalConcept, intl: IntlService) {
  switch (signal.type) {
    case TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN:
      return intl.t('traffic-measure-concept.main-sign');
    case TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING:
      return intl.t('traffic-measure-concept.road-marking');
    case TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT:
      return intl.t('traffic-measure-concept.traffic-light');
  }
}

type Signature = {
  Args: {
    sign: SignPreviewItem;
    selectedSigns: TrafficSignalConcept[];
    selectMainSign: (sign: TrafficSignalConcept) => void;
    selectSubSign: (
      subSign: TrafficSignalConcept,
      mainSign: TrafficSignalConcept,
    ) => void;
  };
};

export default class SignAccordion extends Component<Signature> {
  @service declare intl: IntlService;
  @tracked isOpen = false;

  @action
  toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  <template>
    <div
      class="traffic-measure-preview--main-sign-container au-u-margin-bottom au-u-padding-small
        {{if
          @sign.subSigns.length
          ''
          'traffic-measure-preview--main-sign-container-without-checkbox'
        }}"
    >
      {{#if @sign.subSigns.length}}
        <AuButton
          @icon={{NavDownIcon}}
          @hideText={{true}}
          @skin="naked"
          @size="large"
          {{on "click" this.toggleOpen}}
        />
      {{/if}}
      <AuCheckbox
        @checked={{isSelectedSign @selectedSigns @sign.mainSign}}
        @onChange={{fn @selectMainSign @sign.mainSign}}
      >
        <AuHeading
          @level="6"
          @skin="6"
          class="au-u-flex au-u-flex--vertical-center"
        >
          <img
            src={{@sign.mainSign.image}}
            alt=""
            class="traffic-measure-preview--sign-image au-u-margin-right-small"
          />
          {{signalLabel @sign.mainSign this.intl}}
          {{@sign.mainSign.code}}
        </AuHeading>
      </AuCheckbox>
      {{#if (and this.isOpen @sign.subSigns.length)}}
        <TrafficMeasureSubSignList
          @subSigns={{@sign.subSigns}}
          @mainSign={{@sign.mainSign}}
          @selectedSigns={{@selectedSigns}}
          @selectSubSign={{@selectSubSign}}
        />
      {{/if}}
    </div>
  </template>
}
