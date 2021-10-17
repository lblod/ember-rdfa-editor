/**
 * this is used when reading the full editor document to fetch any prefixes defined above the editor
 * NOTE: it adds the active vocab as a prefix with an empty string as key, which makes it a bit easier to pass down
 * convienently it is also  how the RdfaAttributes class of marawa uses it when calculating rdfa attributes.
 * This is highly reliant on the internals of that class and may stop working at some point.
 */
import TreeNode from "@lblod/ember-rdfa-editor/core/model/tree-node";
import dataset from "@graphy/memory.dataset.fast";
import {RdfaParser} from "rdfa-streaming-parser";
import {SimpleDataset} from "rdfjs";
import Datastore from "@lblod/ember-rdfa-editor/util/datastore";

export function calculateRdfaPrefixes(start: Node): Map<string, string> {
  const parents: HTMLElement[] = [];
  let currentNode = start.parentElement;
  while (currentNode !== null) {
    parents.push(currentNode);
    currentNode = currentNode.parentElement;
  }

  // parse parents top down
  let currentPrefixes: Map<string, string> = new Map<string, string>();
  let vocab = "";
  for (const element of parents.reverse()) {
    const prefixString: string = element.getAttribute('prefix') || "";
    currentPrefixes = new Map([...currentPrefixes, ...parsePrefixString(prefixString)]);
    if (element.hasAttribute('vocab')) {
      vocab = element.getAttribute('vocab') || ""; // TODO: verify if empty vocab really should clear out vocab
    }
  }
  currentPrefixes.set("", vocab);
  return currentPrefixes;
}

/**
 * Parses an RDFa prefix string and returns a map of prefixes to URIs.
 * According to the RDFa spec prefixes must be seperated by exactly one space.
 *
 * Note: borrowed from marawa, but this returns a map instead of an object
 */
export function parsePrefixString(prefixString: string) {
  const parts = prefixString.split(' ');
  const prefixes: Map<string, string> = new Map<string, string>();
  for (let i = 0; i < parts.length; i = i + 2) {
    const key = parts[i].substr(0, parts[i].length - 1);
    prefixes.set(key, parts[i + 1]);
  }
  return prefixes;
}

export function getParentContext(node: TreeNode): SimpleDataset {

  const rootPath = [];

  for (let cur: TreeNode | null = node; cur; cur = cur.parent) {
    rootPath.push(cur);
  }

  rootPath.reverse();

  const store = new Datastore();
  const rdfaParser = new RdfaParser();

  rdfaParser.on("data", (data) => {
    store.add(data);
  });

  for (const node of rootPath) {
    rdfaParser.onTagOpen(node.type, Object.fromEntries(node.attributeMap));
  }
  for (const _ of rootPath) {
    rdfaParser.onTagClose();
  }

  return store;
}
