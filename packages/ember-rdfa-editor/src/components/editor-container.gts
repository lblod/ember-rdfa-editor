import Component from '@glimmer/component';
import { hash } from '@ember/helper';
import { and } from 'ember-truth-helpers';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import t from 'ember-intl/helpers/t';
import type { Option } from '#root/utils/_private/option.ts';
import type SayController from '#root/core/say-controller.ts';

type EditorOptions = {
  showPaper?: boolean;
  showSidebarLeft?: boolean;
  showSidebarRight?: boolean;
  showToolbarBottom?: boolean;
};

type Signature = {
  Element: HTMLDivElement;
  Args: {
    controller: Option<SayController>;
    editorOptions?: EditorOptions;
    loading?: boolean;
  };
  Blocks: {
    default: [];
    top: [{ controller: SayController }];
    aside: [{ controller: SayController }];
  };
};

export default class EditorContainer extends Component<Signature> {
  get showPaper() {
    return this.args.editorOptions?.showPaper ?? false;
  }

  get showSidebarLeft() {
    return this.args.editorOptions?.showSidebarLeft ?? true;
  }

  get showSidebarRight() {
    return this.args.editorOptions?.showSidebarRight ?? true;
  }

  get showToolbarBottom() {
    return this.args.editorOptions?.showToolbarBottom ?? false;
  }
  <template>
    <div
      class="say-container
        {{if this.showPaper 'say-container--paper'}}
        {{if this.showSidebarLeft 'say-container--sidebar-left'}}
        {{if
          (and (has-block 'aside') this.showSidebarRight)
          'say-container--sidebar-right'
        }}
        {{if this.showToolbarBottom 'say-container--toolbar-bottom'}}"
    >
      {{#if @controller}}
        {{yield (hash controller=@controller) to="top"}}
      {{/if}}
      <div class="say-container__main">
        {{#if @loading}}
          <AuLoader @hideMessage={{true}}>
            {{t "ember-rdfa-editor.utils.loading"}}
          </AuLoader>
        {{/if}}

        <div class="say-editor {{if @loading 'au-u-hidden-visually'}}">
          {{yield}}

        </div>
        {{#if (and (has-block "aside") this.showSidebarRight)}}
          <div class="say-container__aside">
            {{#if @controller}}
              {{yield (hash controller=@controller) to="aside"}}
            {{/if}}
          </div>
        {{/if}}
      </div>
    </div>
  </template>
}
