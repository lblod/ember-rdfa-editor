import { Node } from 'prosemirror-model';
import { TableView as PluginTableView } from '@say-editor/prosemirror-tables';
import { constructInlineStyles } from '#root/utils/_private/html-utils.ts';
export class TableView extends PluginTableView {
  constructor(
    public node: Node,
    public cellMinWidth: number,
  ) {
    super(node, cellMinWidth);
    this.addAttrs(node);
  }

  private addAttrs(node: Node): void {
    const nodeClasses = node.attrs['class'] as string;
    const style = node.attrs['style'] as Record<string, string | undefined>;
    this.table.classList.add(...nodeClasses.split(' '));
    this.table.style.cssText = `${this.table.style.cssText} ${constructInlineStyles(style)}`;
  }

  get colgroupElement(): HTMLTableColElement {
    return this.colgroup;
  }
}
