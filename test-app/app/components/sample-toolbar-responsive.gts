import Component from '@glimmer/component';
import type { SayController } from '@lblod/ember-rdfa-editor';
import FormatTextIcon from '@lblod/ember-rdfa-editor/components/icons/format-text.gts';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';

import ResponsiveToolbar from '@lblod/ember-rdfa-editor/components/responsive-toolbar.gts';
import Undo from '@lblod/ember-rdfa-editor/components/plugins/history/undo.ts';
import Redo from '@lblod/ember-rdfa-editor/components/plugins/history/redo.ts';
import Dropdown from '@lblod/ember-rdfa-editor/components/toolbar/dropdown.gts';
import Bold from '@lblod/ember-rdfa-editor/components/plugins/text-style/bold.gts';
import Italic from '@lblod/ember-rdfa-editor/components/plugins/text-style/italic.gts';
import Strikethrough from '@lblod/ember-rdfa-editor/components/plugins/text-style/strikethrough.gts';
import Underline from '@lblod/ember-rdfa-editor/components/plugins/text-style/underline.gts';
import Superscript from '@lblod/ember-rdfa-editor/components/plugins/text-style/superscript.gts';
import Subscript from '@lblod/ember-rdfa-editor/components/plugins/text-style/subscript.gts';
import HeadingMenu from '@lblod/ember-rdfa-editor/components/plugins/heading/heading-menu.ts';
import Color from '@lblod/ember-rdfa-editor/components/plugins/text-style/color.ts';
import Highlight from '@lblod/ember-rdfa-editor/components/plugins/text-style/highlight.ts';
import TableMenu from '@lblod/ember-rdfa-editor/components/plugins/table/table-menu.ts';
import ListOrdered from '@lblod/ember-rdfa-editor/components/plugins/list/ordered.ts';
import ListUnordered from '@lblod/ember-rdfa-editor/components/plugins/list/unordered.ts';
import AlignmentMenu from '@lblod/ember-rdfa-editor/components/plugins/alignment/alignment-menu.ts';
import IndentationMenu from '@lblod/ember-rdfa-editor/components/plugins/indentation/indentation-menu.ts';
import LinkMenu from '@lblod/ember-rdfa-editor/components/plugins/link/link-menu.gts';
import ImageInsertMenu from '@lblod/ember-rdfa-editor/components/plugins/image/insert-menu.ts';
import HtmlEditorMenu from '@lblod/ember-rdfa-editor/components/plugins/html-editor/menu.ts';
import FormattingToggle from '@lblod/ember-rdfa-editor/components/plugins/formatting/formatting-toggle.ts';

type Signature = {
  Args: {
    controller: SayController;
    enableHierarchicalList?: boolean;
  };
  Blocks: {
    default: [];
  };
};

export default class SampleToolbarResponsive extends Component<Signature> {
  get supportsTables() {
    return this.args.controller?.activeEditorState.schema.nodes['table_cell'];
  }

  <template>
    <ResponsiveToolbar>
      <:main as |Tb|>
        <Tb.Group>
          <Undo @controller={{@controller}} />
          <Redo @controller={{@controller}} />
        </Tb.Group>
        <Tb.Group>
          <Dropdown
            @icon={{FormatTextIcon}}
            @controller={{@controller}}
            @direction="horizontal"
            as |Menu|
          >
            <Bold
              @controller={{@controller}}
              @onActivate={{Menu.closeDropdown}}
            />
            <Italic
              @controller={{@controller}}
              @onActivate={{Menu.closeDropdown}}
            />
            <Strikethrough
              @controller={{@controller}}
              @onActivate={{Menu.closeDropdown}}
            />
            <Underline
              @controller={{@controller}}
              @onActivate={{Menu.closeDropdown}}
            />
            <Superscript
              @controller={{@controller}}
              @onActivate={{Menu.closeDropdown}}
            />
            <Subscript
              @controller={{@controller}}
              @onActivate={{Menu.closeDropdown}}
            />
            <HeadingMenu
              @controller={{@controller}}
              @onActivate={{Menu.closeDropdown}}
            />
          </Dropdown>
          <Color @controller={{@controller}} @defaultColor="#000000" />
          <Highlight @controller={{@controller}} @defaultColor="#FFEA00" />
        </Tb.Group>
        {{#if this.supportsTables}}
          <Tb.Group>
            <TableMenu @controller={{@controller}} />
          </Tb.Group>
        {{/if}}
        <Tb.Group>
          <ListUnordered @controller={{@controller}} />
          <ListOrdered
            @controller={{@controller}}
            @enableHierarchicalList={{@enableHierarchicalList}}
          />
        </Tb.Group>
        <Tb.Group>
          <AlignmentMenu @controller={{@controller}} />
        </Tb.Group>
        <Tb.Group>
          <IndentationMenu @controller={{@controller}} />
        </Tb.Group>
        <Tb.Group>
          <Dropdown
            @icon={{PlusIcon}}
            @controller={{@controller}}
            @direction="horizontal"
            as |Menu|
          >
            <LinkMenu
              @controller={{@controller}}
              @onActivate={{Menu.closeDropdown}}
            />
            <ImageInsertMenu
              @controller={{@controller}}
              @onActivate={{Menu.closeDropdown}}
            />
          </Dropdown>
        </Tb.Group>
      </:main>
      <:side as |Tb|>
        <Tb.Group>
          <Dropdown
            @icon={{ThreeDotsIcon}}
            @controller={{@controller}}
            @direction="horizontal"
            as |Menu|
          >
            <HtmlEditorMenu
              @controller={{@controller}}
              @onActivate={{Menu.closeDropdown}}
            />
            <FormattingToggle
              @controller={{@controller}}
              @onActivate={{Menu.closeDropdown}}
            />
          </Dropdown>
        </Tb.Group>
        {{yield}}
      </:side>
    </ResponsiveToolbar>
  </template>
}
