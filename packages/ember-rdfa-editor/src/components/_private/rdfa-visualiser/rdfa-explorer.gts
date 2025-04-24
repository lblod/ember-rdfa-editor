import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { trackedReset } from 'tracked-toolbox';
import { keepLatestTask, timeout } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import { not, or } from 'ember-truth-helpers';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import type SayController from '#root/core/say-controller.ts';
import {
  rdfaInfoPluginKey,
  type RdfaVisualizerConfig,
} from '#root/plugins/rdfa-info/index.ts';
import { type ResolvedPNode } from '#root/utils/_private/types.ts';
import { type RdfaInfo } from '#root/plugins/rdfa-info/plugin.ts';
import { selectNodeBySubject } from '#root/commands/_private/rdfa-commands/index.ts';
import ResourceInfo from '#root/components/_private/rdfa-visualiser/resource-info.gts';

interface Sig {
  Args: {
    controller: SayController;
    node?: ResolvedPNode;
    config: RdfaVisualizerConfig;
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
    const abortController = new AbortController();
    try {
      const maps = await this.rdfaInfo?.computeMappingsAsync(
        abortController.signal,
      );
      this.subjects = Array.from(maps.topLevelSubjects);
      this.isRunning = false;
      await timeout(this.args.config.debounceTime || 1000);
    } finally {
      abortController.abort();
    }
  });

  @tracked subjects?: string[];
  @trackedReset<RdfaExplorer, boolean>({
    memo: 'rdfaInfo',
    update: (component) => {
      component.computeMappingsTask.perform().catch((err: unknown) => {
        if (
          !err ||
          typeof err !== 'object' ||
          !('name' in err) ||
          err.name !== 'TaskCancelation'
        ) {
          console.error('Error computing mappings', err);
        }
      });
      return true;
    },
  })
  isRunning = false;

  goToSubject = (subject: string) => {
    this.args.controller.doCommand(selectNodeBySubject({ subject }), {
      view: this.args.controller.mainEditorView,
    });
    this.args.controller.focus();
  };

  <template>
    {{#if this.isRunning}}
      <AuLoader @hideMessage={{true}}>
        {{t "ember-rdfa-editor.utils.loading"}}
      </AuLoader>
    {{/if}}
    {{! TODO Keeping it open is nicer user experience, but maybe we can have a similar exp by storing a list of 'expanded' states for resources}}
    {{#if (or @config.keepOpen (not this.isRunning))}}
      <AuList @divider={{true}} as |Item|>
        {{#each this.subjects as |subject|}}
          <Item>
            <ResourceInfo
              @controller={{@controller}}
              @subject={{subject}}
              @displayConfig={{@config.displayConfig}}
            />
          </Item>
        {{/each}}
      </AuList>
    {{/if}}
  </template>
}
