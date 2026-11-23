import Component from '@glimmer/component';
import { hash } from '@ember/helper';
import { deprecate } from '@ember/debug';
import { and, not } from 'ember-truth-helpers';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import t from 'ember-intl/helpers/t';
import type { Option } from '#root/utils/option.ts';
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
    // TODO in the next major release, this should become `controller: Option<SayController>`
    controller?: Option<SayController>;
    editorOptions?: EditorOptions;
    loading?: boolean;
    /**
     * Render the new docked sidebar layout. Defaults to the legacy overlay
     * layout.
     */
    useNewLayout?: boolean;
  };
  Blocks: {
    default: [];
    /** @deprecated Using top is deprecated. Pass a controller and use toolbar instead */
    top: [];
    toolbar: [{ controller: SayController }];
    sidebarLeft: [{ controller: SayController }];
    sidebarRight: [{ controller: SayController }];
  };
};

export default class EditorContainer extends Component<Signature> {
  constructor(owner: unknown, args: Signature['Args']) {
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

  get useLegacySidebar() {
    return !this.args.useNewLayout;
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
    {{! Legacy class names (`say-container--sidebar-left` and
    `say-container--sidebar-right`) are kept for backwards compatibility with
    consuming apps that target them directly. They are only rendered in the
    legacy layout. }}
    <div
      class="say-container
        {{if this.showPaper 'say-container--paper'}}
        {{if
          (and
            this.showSidebarLeft
            this.useLegacySidebar
            (not (has-block 'sidebarLeft'))
          )
          'say-container--sidebar-left'
        }}
        {{if
          (and
            (has-block 'sidebarRight')
            this.showSidebarRight
            this.useLegacySidebar
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

        {{#if this.showSidebarLeft}}
          {{#if (has-block "sidebarLeft")}}
            <div class="say-container__sidebar-left">
              {{#if @controller}}
                {{yield (hash controller=@controller) to="sidebarLeft"}}
              {{/if}}
            </div>
          {{/if}}
        {{/if}}
        <div class="say-editor {{if @loading 'au-u-hidden-visually'}}">
          {{yield}}

        </div>
        {{#if this.showSidebarRight}}
          {{#if (has-block "sidebarRight")}}
            {{#if @controller}}
              <div
                class={{if
                  this.useLegacySidebar
                  "say-container__aside"
                  "say-container__sidebar-right"
                }}
              >
                {{yield (hash controller=@controller) to="sidebarRight"}}
              </div>
            {{/if}}
          {{/if}}
        {{/if}}
      </div>
    </div>
  </template>
}
