import AttributeEditor from '#root/components/_private/attribute-editor/index.gts';
import DebugInfo from '#root/components/_private/debug-info/index.gts';
import DocImportedResourceEditorCard from '#root/components/_private/doc-imported-resource-editor/card.gts';
import ExternalTripleEditorCard from '#root/components/_private/external-triple-editor/card.gts';
import ImportedResourceLinkerCard from '#root/components/_private/imported-resource-linker/card.gts';
import NodeControlsCard from '#root/components/_private/node-controls/card.gts';
import RelationshipEditorCard from '#root/components/_private/relationship-editor/card.gts';
import type { OptionGeneratorConfig } from '#root/components/_private/relationship-editor/types.js';
import type { EditorTab } from '#root/components/editor-tabs.gts';
import type SayController from '#root/core/say-controller.ts';
import { getActiveEditableNode } from '#root/plugins/editable-node/index.ts';
import { HtmlIcon } from '@appuniversum/ember-appuniversum/components/icons/html';
import type { TOC } from '@ember/component/template-only';
import Component from '@glimmer/component';

type DevToolsPaneSignature = {
  Args: {
    optionGeneratorConfig?: OptionGeneratorConfig;
    controller: SayController;
  };
};
class DevToolsPane extends Component<DevToolsPaneSignature> {
  get activeNode() {
    return getActiveEditableNode(this.args.controller.activeEditorState);
  }

  <template>
    <div class="au-u-flex au-u-flex--column au-u-flex--spaced-tiny">
      <NodeControlsCard
        @expanded={{false}}
        @node={{this.activeNode}}
        @controller={{@controller}}
      />
      {{#if this.activeNode}}
        <RelationshipEditorCard
          @node={{this.activeNode}}
          @controller={{@controller}}
          @optionGeneratorConfig={{@optionGeneratorConfig}}
          @expanded={{false}}
        />
        <DocImportedResourceEditorCard
          @controller={{@controller}}
          @optionGeneratorConfig={{@optionGeneratorConfig}}
        />
        <ImportedResourceLinkerCard
          @node={{this.activeNode}}
          @controller={{@controller}}
        />
        <ExternalTripleEditorCard
          @node={{this.activeNode}}
          @controller={{@controller}}
        />
        <DebugInfo @node={{this.activeNode}} @expanded={{false}} />
        <AttributeEditor
          @node={{this.activeNode}}
          @controller={{@controller}}
          @expanded={{false}}
        />
      {{/if}}
    </div>
  </template>
}

export const devToolsTab = ({
  optionGeneratorConfig,
}: {
  optionGeneratorConfig?: OptionGeneratorConfig;
} = {}): EditorTab => ({
  title: 'Dev tools',
  icon: HtmlIcon,
  panelContent: <template>
    <DevToolsPane
      @controller={{@controller}}
      @optionGeneratorConfig={{optionGeneratorConfig}}
    />
  </template> satisfies TOC<{ Args: { controller: SayController } }>,
});
