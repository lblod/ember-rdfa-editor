import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { type RoadsignRegulationPluginOptions } from '#root/plugin/types.ts';
import { type MobilityMeasureConcept } from '#root/plugin/schemas/mobility-measure-concept.ts';
import { addAll } from '@lblod/ember-rdfa-editor/utils/set-utils';
import ExpandedMeasure, {
  type InsertMobilityMeasureTask,
} from './expanded-measure.gts';
import MeasurePreview from './measure-preview.gts';

import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import { NavUpIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-up';
import { NavDownIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-down';
import { eq } from 'ember-truth-helpers';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '#root/plugin/constants.ts';
import removeZFromLabel from '#root/helpers/removeZFromLabel.ts';
import { PNode } from '@lblod/ember-rdfa-editor';

type Signature = {
  Args: {
    options: RoadsignRegulationPluginOptions;
    content?: MobilityMeasureConcept[];
    isLoading?: boolean;
    insert: InsertMobilityMeasureTask;
    articleNodes: PNode[];
  };
};

export default class RoadSignsTable extends Component<Signature> {
  @tracked selected?: string;

  @action
  selectRow(id: string) {
    if (this.selected === id) {
      this.selected = undefined;
    } else {
      this.selected = id;
    }
  }

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
    <AuDataTable @isLoading={{@isLoading}} @noDataMessage="No data" as |table|>
      <table.content as |c|>
        <c.header>
          <th class="data-table__header-title">{{t
              "editor-plugins.roadsign-regulation.table.header.code"
            }}</th>
          <th class="data-table__header-title">{{t
              "editor-plugins.roadsign-regulation.table.header.image"
            }}</th>
          <th class="data-table__header-title">{{t
              "editor-plugins.roadsign-regulation.table.header.preview"
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
                {{! template-lint-disable require-presentational-children }}
                <tr
                  role="button"
                  class="au-c-data-table__clickable-row roadsign"
                  {{on "click" (fn this.selectRow measureConcept.uri)}}
                >
                  <td>
                    <p>{{removeZFromLabel measureConcept.label}}</p>
                  </td>
                  <td>
                    <div class="au-o-grid au-o-grid--tiny">
                      {{#each
                        measureConcept.trafficSignalConcepts
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
                    <AuHelpText
                      @size="large"
                      @skin="secondary"
                      class="au-u-margin-none"
                    >
                      <MeasurePreview
                        @concept={{measureConcept}}
                        @limitText={{true}}
                      />
                    </AuHelpText>
                  </td>
                  <td>
                    {{#each (this.categories measureConcept) as |category|}}
                      <AuPill @skin="border">{{category}}</AuPill>
                    {{/each}}
                  </td>
                  <td>
                    {{#if (eq this.selected measureConcept.uri)}}
                      <AuIcon
                        @icon={{NavUpIcon}}
                        @ariaHidden={{true}}
                        class="au-c-data-table__clickable-row-icon"
                      />
                    {{else}}
                      <AuIcon
                        @icon={{NavDownIcon}}
                        @ariaHidden={{true}}
                        class="au-c-data-table__clickable-row-icon"
                      />
                    {{/if}}
                  </td>
                </tr>
                {{#if (eq this.selected measureConcept.uri)}}
                  <ExpandedMeasure
                    @concept={{measureConcept}}
                    @insert={{@insert}}
                    @selectRow={{this.selectRow}}
                    @endpoint={{@options.endpoint}}
                    @articleNodes={{@articleNodes}}
                  />
                {{/if}}
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
