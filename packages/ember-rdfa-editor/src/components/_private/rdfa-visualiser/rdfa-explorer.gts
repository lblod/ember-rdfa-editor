import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { trackedReset } from 'tracked-toolbox';
import { keepLatestTask, timeout } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import type SayController from '#root/core/say-controller.ts';
import { rdfaInfoPluginKey } from '#root/plugins/rdfa-info/index.ts';
import { type ResolvedPNode } from '#root/utils/_private/types.ts';
import { type RdfaInfo } from '#root/plugins/rdfa-info/plugin.ts';

interface Sig {
  Args: {
    controller: SayController;
    node?: ResolvedPNode;
  };
}

export default class RdfaExplorer extends Component<Sig> {
  get rdfaInfo() {
    return rdfaInfoPluginKey.getState(
      this.args.controller.mainEditorState,
      // We need to set this type as otherwise glint complains about private members of anonymous
      // classes, even though it shouldn't be anonymous...
    ) as RdfaInfo;
  }
  computeMappingsTask = keepLatestTask(async () => {
    await timeout(1);
    const maps = await this.rdfaInfo?.computeMappingsAsync();
    this.subjects = Array.from(maps.topLevelSubjects);
    this.isRunning = false;
    await timeout(200);
  });

  @tracked subjects?: string[];
  @trackedReset<RdfaExplorer, boolean>({
    memo: 'rdfaInfo',
    update: (component) => {
      component.computeMappingsTask.perform().catch((err) => {
        console.error('Error computing mappings', err);
      });
      return true;
    },
  })
  isRunning = false;

  <template>
    {{#if this.isRunning}}
      <AuLoader @hideMessage={{true}}>
        {{t "ember-rdfa-editor.utils.loading"}}
      </AuLoader>
    {{/if}}
    <ul>
      {{#each this.subjects as |subject|}}
        <li>{{subject}}</li>
      {{/each}}
    </ul>
  </template>
}
