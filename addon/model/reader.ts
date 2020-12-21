import RichElement from "./rich-element";

export default interface Reader {
  read: (node: Node) => RichElement | null;
};
