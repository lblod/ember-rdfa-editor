import Component from '@glimmer/component';
import type { SayController } from '@lblod/ember-rdfa-editor';
import FormatTextIcon from '@lblod/ember-rdfa-editor/components/icons/format-text';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';

import ResponsiveToolbar from '@lblod/ember-rdfa-editor/components/responsive-toolbar';
import Undo from '@lblod/ember-rdfa-editor/components/plugins/history/undo';
import Redo from '@lblod/ember-rdfa-editor/components/plugins/history/redo';
import Dropdown from '@lblod/ember-rdfa-editor/components/toolbar/dropdown';
import Bold from '@lblod/ember-rdfa-editor/components/plugins/text-style/bold';
import Italic from '@lblod/ember-rdfa-editor/components/plugins/text-style/italic';
import Strikethrough from '@lblod/ember-rdfa-editor/components/plugins/text-style/strikethrough';
import Underline from '@lblod/ember-rdfa-editor/components/plugins/text-style/underline';
import Superscript from '@lblod/ember-rdfa-editor/components/plugins/text-style/superscript';
import Subscript from '@lblod/ember-rdfa-editor/components/plugins/text-style/subscript';
import HeadingMenu from '@lblod/ember-rdfa-editor/components/plugins/heading/heading-menu';
import Color from '@lblod/ember-rdfa-editor/components/plugins/text-style/color';
import Highlight from '@lblod/ember-rdfa-editor/components/plugins/text-style/highlight';
import TableMenu from '@lblod/ember-rdfa-editor/components/plugins/table/table-menu';
import ListOrdered from '@lblod/ember-rdfa-editor/components/plugins/list/ordered';
import ListUnordered from '@lblod/ember-rdfa-editor/components/plugins/list/unordered';
import AlignmentMenu from '@lblod/ember-rdfa-editor/components/plugins/alignment/alignment-menu';
import IndentationMenu from '@lblod/ember-rdfa-editor/components/plugins/indentation/indentation-menu';
import LinkMenu from '@lblod/ember-rdfa-editor/components/plugins/link/link-menu';
import ImageInsertMenu from '@lblod/ember-rdfa-editor/components/plugins/image/insert-menu';
import HtmlEditorMenu from '@lblod/ember-rdfa-editor/components/plugins/html-editor/menu';
import FormattingToggle from '@lblod/ember-rdfa-editor/components/plugins/formatting/formatting-toggle';

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
          <Dropdown @icon={{FormatTextIcon}} @direction="horizontal" as |Menu|>
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
          <Dropdown @icon={{PlusIcon}} @direction="horizontal" as |Menu|>
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
          <Dropdown @icon={{ThreeDotsIcon}} @direction="horizontal" as |Menu|>
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
