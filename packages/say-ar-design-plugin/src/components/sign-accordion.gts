import Component from '@glimmer/component';
import type TrafficSignalConcept from '#root/plugin/models/traffic-signal-concept.ts';
import { type SignPreviewItem } from '#root/plugin/types.ts';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '#root/plugin/constants.ts';
import type IntlService from 'ember-intl/services/intl';
import { service } from '@ember/service';
import TrafficMeasureSubSignList from '#root/components/sub-sign-list.gts';

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
  };
};

export default class SignAccordion extends Component<Signature> {
  @service declare intl: IntlService;
  <template>
    <div
      class="traffic-measure-preview--main-sign-container au-u-margin-bottom au-u-padding-small"
    >
      <AuHeading
        @level="6"
        @skin="6"
        class="au-u-flex au-u-flex--vertical-center traffic-measure-preview--sign-header"
      >
        <img
          src={{@sign.mainSign.image}}
          alt=""
          class="traffic-measure-preview--sign-image au-u-margin-right-small"
        />
        {{signalLabel @sign.mainSign this.intl}}
        {{@sign.mainSign.code}}
      </AuHeading>
      {{#if @sign.subSigns.length}}
        <TrafficMeasureSubSignList
          @subSigns={{@sign.subSigns}}
          @mainSign={{@sign.mainSign}}
        />
      {{/if}}
    </div>
  </template>
}
