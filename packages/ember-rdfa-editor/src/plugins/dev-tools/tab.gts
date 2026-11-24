import AttributeEditor from '#root/components/_private/attribute-editor/index.gts';
import DebugInfo from '#root/components/_private/debug-info/index.gts';
// import ExternalTripleEditorCard from '#root/components/_private/external-triple-editor/card.gts';
import NodeControlsCard from '#root/components/_private/node-controls/card.gts';
import VisualiserCard from '#root/components/_private/rdfa-visualiser/visualiser-card.gts';
import RelationshipEditorCard from '#root/components/_private/relationship-editor/card.gts';
import type { EditorTab } from '#root/components/editor-tabs.gts';
import type SayController from '#root/core/say-controller.ts';
import { getActiveEditableNode } from '#root/plugins/editable-node/index.ts';
import { HtmlIcon } from '@appuniversum/ember-appuniversum/components/icons/html';
import Component from '@glimmer/component';
type Signature = {
  Args: {
    controller: SayController;
  };
};
class DevToolsPane extends Component<Signature> {
  get activeNode() {
    return getActiveEditableNode(this.args.controller.activeEditorState);
  }

  <template>
    <div class="au-u-flex au-u-flex--column au-u-flex--spaced-tiny">
      <NodeControlsCard
        @node={{this.activeNode}}
        @controller={{@controller}}
      />
      {{#if this.activeNode}}
        <RelationshipEditorCard
          @node={{this.activeNode}}
          @controller={{@controller}}
        />
        {{!-- <DocImportedResourceEditorCard
          @controller={{@controller}}
        />
        <ImportedResourceLinkerCard
          @node={{this.activeNode}}
          @controller={{@controller}}
        /> --}}
        {{!-- <ExternalTripleEditorCard
          @node={{this.activeNode}}
          @controller={{@controller}}
        /> --}}
        <DebugInfo @node={{this.activeNode}} />
        <AttributeEditor
          @node={{this.activeNode}}
          @controller={{@controller}}
        />
      {{/if}}
    </div>
  </template>
}

export const devToolsTab: EditorTab = {
  title: 'Dev tools',
  icon: HtmlIcon,
  panelContent: DevToolsPane,
};
