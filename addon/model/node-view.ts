export default interface NodeView {
  viewRoot: Node;
  contentRoot: Node;
}

export interface ElementView extends NodeView {
  viewRoot: HTMLElement;
  contentRoot: HTMLElement;
}

export interface TextView extends NodeView {
  viewRoot: Node;
  contentRoot: Text;
}
