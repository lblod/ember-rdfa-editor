import Component from '@glimmer/component';
import { and, not } from 'ember-truth-helpers';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import t from 'ember-intl/helpers/t';

type EditorOptions = {
  showPaper?: boolean;
  hideSidebarLeft?: boolean;
  hideSidebarRight?: boolean;
  showToolbarBottom?: boolean;
};

type Signature = {
  Element: HTMLDivElement;
  Args: {
    editorOptions?: EditorOptions;
    loading?: boolean;
  };
  Blocks: {
    default: [];
    top: [];
    aside: [];
  };
};
export default class EditorContainer extends Component<Signature> {
  get showPaper() {
    return this.args.editorOptions?.showPaper ?? false;
  }

  get hideSidebarLeft() {
    return this.args.editorOptions?.hideSidebarLeft ?? false;
  }

  get hideSidebarRight() {
    return this.args.editorOptions?.hideSidebarRight ?? false;
  }

  get showToolbarBottom() {
    return this.args.editorOptions?.showToolbarBottom ?? false;
  }
  <template>
    <div
      class='say-container
        {{if this.showPaper "say-container--paper"}}
        {{unless this.hideSidebarLeft "say-container--sidebar-left"}}
        {{if
          (and (has-block "aside") (not this.hideSidebarRight))
          "say-container--sidebar-right"
        }}
        {{if this.showToolbarBottom "say-container--toolbar-bottom"}}'
    >
      {{yield to='top'}}
      <div class='say-container__main'>
        {{#if @loading}}
          <AuLoader @hideMessage={{true}}>
            {{t 'ember-rdfa-editor.utils.loading'}}
          </AuLoader>
        {{/if}}

        <div class='say-editor {{if @loading "au-u-hidden-visually"}}'>
          {{yield}}

        </div>
        {{#if (and (has-block 'aside') (not this.hideSidebarRight))}}
          <div class='say-container__aside'>
            {{yield to='aside'}}
          </div>
        {{/if}}
      </div>
    </div>
  </template>
}
