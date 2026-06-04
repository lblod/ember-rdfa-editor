import ResponsiveToolbar from '@lblod/ember-rdfa-editor/components/responsive-toolbar';

import Component from '@glimmer/component';
import type { SayController } from '@lblod/ember-rdfa-editor';

import { get } from '@ember/helper';
import type { TOC } from '@ember/component/template-only';
import type { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import type { EditorSetup } from '../plugins/setup/setup-plugins.ts';
import type { ToolbarConfig, ToolbarGroupConfig } from '../plugins/widgets';

type ToolbarSignature = {
  Args: {
    activeNode?: ResolvedPNode | null;
    controller: SayController;
    toolbar: ToolbarConfig;
    setup: EditorSetup;
  };
};

const Toolbar: TOC<ToolbarSignature> = <template>
  <ResponsiveToolbar>
    {{! @glint-expect-error }}
    <:main as |Tb|>
      {{#each @toolbar.main as |toolbarGroup|}}
        <Tb.Group>
          <ToolbarGroup
            @activeNode={{@activeNode}}
            @controller={{@controller}}
            @toolbarGroup={{toolbarGroup}}
            @setup={{@setup}}
          />
        </Tb.Group>
      {{/each}}
    </:main>
    {{! @glint-expect-error }}
    <:side as |Tb|>
      {{#each @toolbar.side as |toolbarGroup|}}
        <Tb.Group>
          <ToolbarGroup
            @activeNode={{@activeNode}}
            @controller={{@controller}}
            @toolbarGroup={{toolbarGroup}}
            @setup={{@setup}}
          />
        </Tb.Group>
      {{/each}}
    </:side>
  </ResponsiveToolbar>
</template>;

export default Toolbar;

type ToolbarGroupSignature = {
  activeNode?: ResolvedPNode | null;
  controller: SayController;
  toolbarGroup: ToolbarGroupConfig;
  setup: EditorSetup;
};
class ToolbarGroup extends Component<ToolbarGroupSignature> {
  get widgets() {
    if (Array.isArray(this.args.toolbarGroup)) {
      return this.args.toolbarGroup;
    } else {
      return this.args.toolbarGroup.items;
    }
  }
  <template>
    {{#each this.widgets as |widget|}}
      {{#let (get @setup.widgetMaps.toolbar widget) as |WidgetComponent|}}
        <WidgetComponent
          @activeNode={{@activeNode}}
          @setup={{@setup}}
          @controller={{@controller}}
        />
      {{/let}}
    {{/each}}
  </template>
}
