import Component from '@glimmer/component';
import { hash } from '@ember/helper';
import { deprecate } from '@ember/debug';
import { and, or } from 'ember-truth-helpers';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import t from 'ember-intl/helpers/t';
import type { Option } from '#root/utils/_private/option.ts';
import type SayController from '#root/core/say-controller.ts';
import type Owner from '@ember/owner';

type EditorOptions = {
  showPaper?: boolean;
  showSidebarLeft?: boolean;
  showSidebarRight?: boolean;
  showToolbarBottom?: boolean;
};

type Signature = {
  Element: HTMLDivElement;
  Args: {
    // TODO in the next major release, this should become `controller: Option<SayController>`
    controller?: Option<SayController>;
    editorOptions?: EditorOptions;
    loading?: boolean;
  };
  Blocks: {
    default: [];
    /** @deprecated Using top is deprecated. Pass a controller and use toolbar instead */
    top: [];
    /** @deprecated Using aside is deprecated. Pass a controller and use sidebarRight instead */
    aside: [];
    toolbar: [{ controller: SayController }];
    sidebarRight: [{ controller: SayController }];
  };
};

export default class EditorContainer extends Component<Signature> {
  constructor(owner: Owner, args: Signature['Args']) {
    super(owner, args);

    deprecate(
      'EditorContainer now requires a controller argument, so that it can pass this to child blocks when it exists',
      'controller' in args,
      {
        id: '@lblod/ember-rdfa-editor.editor-container.controller-argument',
        until: '13.0.0',
        for: '@lblod/ember-rdfa-editor',
        since: {
          available: '12.11.0',
          enabled: '12.11.0',
        },
      },
    );
  }

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
          (and
            (or (has-block 'aside') (has-block 'sidebarRight'))
            this.showSidebarRight
          )
          'say-container--sidebar-right'
        }}
        {{if this.showToolbarBottom 'say-container--toolbar-bottom'}}"
    >
      {{#if (has-block "top")}}
        {{yield to="top"}}
      {{else if (has-block "toolbar")}}
        {{#if @controller}}
          {{yield (hash controller=@controller) to="toolbar"}}
        {{/if}}
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
        {{#if
          (and
            (or (has-block "aside") (has-block "sidebarRight"))
            this.showSidebarRight
          )
        }}
          <div class="say-container__aside">
            {{#if (has-block "aside")}}
              {{yield to="aside"}}
            {{else if @controller}}
              {{yield (hash controller=@controller) to="sidebarRight"}}
            {{/if}}
          </div>
        {{/if}}
      </div>
    </div>
  </template>
}
