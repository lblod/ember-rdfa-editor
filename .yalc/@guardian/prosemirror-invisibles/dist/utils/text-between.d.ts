import { Node } from "prosemirror-model";
interface Position {
    pos: number;
    text: string;
}
declare const _default: (from: number, to: number, doc: Node) => Position[];
export default _default;
