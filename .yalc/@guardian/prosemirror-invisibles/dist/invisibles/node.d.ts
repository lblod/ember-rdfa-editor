import { Node } from "prosemirror-model";
import AddDecorationsForInvisible from "../utils/invisible";
export declare const createInvisibleDecosForNode: (type: string, toPosition: (node: Node, pos: number) => number, predicate: (node: Node) => boolean) => AddDecorationsForInvisible;
