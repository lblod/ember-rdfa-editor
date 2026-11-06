import Component from '@glimmer/component';
import { type RoadsignRegulationPluginOptions } from '#root/plugin/types.ts';
import { type MobilityMeasureConcept } from '#root/plugin/schemas/mobility-measure-concept.ts';
import { addAll } from '@lblod/ember-rdfa-editor/utils/set-utils';

import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import { eq } from 'ember-truth-helpers';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '#root/plugin/constants.ts';
import removeZFromLabel from '#root/helpers/removeZFromLabel.ts';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { isSubSign } from '#root/plugin/generate-measure-sign-tree.ts';
import { type TrafficSignalConcept } from '#root/plugin/schemas/traffic-signal-concept.ts';

type Signature = {
  Args: {
    options: RoadsignRegulationPluginOptions;
    content?: MobilityMeasureConcept[];
    isLoading?: boolean;
    selectMeasureToInsert: (measure: MobilityMeasureConcept) => void;
  };
};

function removeSubSigns(signs: TrafficSignalConcept[]) {
  return signs.filter((sign) => !isSubSign(sign));
}

export default class RoadSignsTable extends Component<Signature> {
  categories = (measureConcept: MobilityMeasureConcept) => {
    const categorySet: Set<string> = new Set();
    for (const signalConcept of measureConcept.trafficSignalConcepts) {
      if (signalConcept.type === TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN) {
        const categoryLabels = signalConcept.categories.map((cat) => cat.label);
        addAll(categorySet, ...categoryLabels);
      }
    }
    return [...categorySet].sort();
  };

  <template>
    {{! @glint-expect-error expect this error }}
    <AuDataTable @isLoading={{@isLoading}} as |table|>
      <table.content as |c|>
        <c.header>
          <th class="data-table__header-title">{{t
              "editor-plugins.roadsign-regulation.table.header.code"
            }}</th>
          <th class="data-table__header-title">{{t
              "editor-plugins.roadsign-regulation.table.header.image"
            }}</th>
          <th class="data-table__header-title">{{t
              "editor-plugins.roadsign-regulation.table.header.category"
            }}</th>
          <th class="data-table__header-title"></th>
        </c.header>
        {{#if c.body}}
          <tbody>
            {{#if @isLoading}}
              <tr>
                <td colspan="100%" class="is-loading-data">
                  <AuLoader>
                    {{t "common.loading"}}
                  </AuLoader>
                </td>
              </tr>
            {{else}}
              {{#each @content as |measureConcept|}}
                <tr class="roadsign">
                  <td>
                    <p>{{removeZFromLabel measureConcept.label}}</p>
                  </td>
                  <td>
                    <div class="au-o-grid au-o-grid--tiny">
                      {{#each
                        (removeSubSigns measureConcept.trafficSignalConcepts)
                        as |signalConcept|
                      }}
                        <div class="au-o-grid__item au-u-1-3">
                          {{#unless (eq signalConcept.code "Z")}}
                            {{#if signalConcept.image}}
                              <img
                                src={{signalConcept.image}}
                                alt={{t
                                  "editor-plugins.roadsign-regulation.table.content.image.alt"
                                  code=signalConcept.code
                                }}
                                class="au-c-data-table__image"
                              />
                            {{else}}
                              <AuPill
                                @skin="border"
                                @size="small"
                                @draft={{true}}
                              >
                                {{signalConcept.code}}
                              </AuPill>
                            {{/if}}
                          {{/unless}}
                        </div>
                      {{/each}}
                    </div>
                  </td>
                  <td>
                    {{#each (this.categories measureConcept) as |category|}}
                      <AuPill @skin="border">{{category}}</AuPill>
                    {{/each}}
                  </td>
                  <td>
                    <AuButton
                      @skin="link"
                      {{on "click" (fn @selectMeasureToInsert measureConcept)}}
                    >
                      {{t
                        "editor-plugins.roadsign-regulation.table.content.insert-measure-button"
                      }}
                    </AuButton>
                  </td>
                </tr>
              {{else}}
                <tr>
                  <td colspan="5" class="no-data-message">
                    <p>{{t
                        "editor-plugins.roadsign-regulation.table.content.no-data-message"
                      }}
                    </p>
                  </td>
                </tr>
              {{/each}}
            {{/if}}
          </tbody>
        {{/if}}
      </table.content>
    </AuDataTable>
  </template>
}
