import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import ModelTreeWalker, { FilterResult } from "@lblod/ember-rdfa-editor/util/model-tree-walker"
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelText from "../model/model-text";
import ModelPosition from "../model/model-position";
import { IllegalArgumentError } from "./errors";

const VOID_NODES = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];

type ModelTextWithOffsets = { node: ModelText, startOffset: number, endOffset: number};
type TextEdge = "startOffset" | "endOffset";

function selectTextAndVoidNodes(node: ModelNode) {
  if (ModelNode.isModelText(node)) {
    return FilterResult.FILTER_ACCEPT;
  }
  else if (ModelNode.isModelElement(node) && VOID_NODES.includes(node.type)) {
    return FilterResult.FILTER_ACCEPT;
  }
  else {
    return FilterResult.FILTER_SKIP;
  }
}

function buildTextNodeArrayWithOffsets(treeWalker: ModelTreeWalker): ModelTextWithOffsets[] {
  const textNodes: ModelTextWithOffsets[] = [];
  let startOffset = 0;
  for (const node of treeWalker) {
    if (ModelNode.isModelText(node)) {
      const endOffset = startOffset + node.length;
      textNodes.push({
        node,
        startOffset,
        endOffset
      });
      startOffset = endOffset;
    }
    else {
      // void nodes
      startOffset = startOffset + 1;
    }
  }
  return textNodes;
}


function findBestMatchingTextWithOffset(textNodes: ModelTextWithOffsets[], offset: number, preferredEdge: TextEdge): ModelTextWithOffsets {
  const eligibleNodes = textNodes.filter((modelTextWithOffsets) => {
    return modelTextWithOffsets.startOffset <= offset && modelTextWithOffsets.endOffset >= offset;
  });
  if (eligibleNodes.length == 1) {
    return eligibleNodes[0];
  }
  else if (eligibleNodes.length > 1) {
    // by definition this should include edges, prefer end
    const eligibleNode = eligibleNodes.find((textWithOffsets) => textWithOffsets[preferredEdge] === offset);
    if (! eligibleNode) {
      throw new IllegalArgumentError(`no eligble node found for offset ${offset}`);
    }
    return eligibleNode;
  }
  else {
    throw new IllegalArgumentError(`no eligble node found for offset ${offset}`);
  }
}

/**
 * This matches text offsets as found in the TextNodeWalker to a path in our virtual dom
 * as such it assumes void nodes have a "width" of 1, being either a newline for breaks and
 * a space for all other void nodes
 *
 * we prefer to start ranges at the start of a node if possible
 * we prefer to end ranges at the end of node if possible
 */
export default function globalTextRegionToModelRange(root: ModelElement, regionStart: number, regionEnd: number): ModelRange {
  const range = ModelRange.fromPaths(root, [0], [root.getMaxOffset()]);
  const treeWalker = new ModelTreeWalker({ filter: selectTextAndVoidNodes, range });
  const textNodes = buildTextNodeArrayWithOffsets(treeWalker);
  const textForStart: ModelTextWithOffsets = findBestMatchingTextWithOffset(textNodes, regionStart, 'startOffset');
  const textForEnd: ModelTextWithOffsets =  findBestMatchingTextWithOffset(textNodes, regionEnd, 'endOffset');
  const startPosition = ModelPosition.fromInTextNode(textForStart.node, regionStart - textForStart.startOffset);
  const endPosition = ModelPosition.fromInTextNode(textForEnd.node, regionEnd - textForEnd.startOffset);
  return new ModelRange(startPosition, endPosition);
}
