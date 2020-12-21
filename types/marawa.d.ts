declare module '@lblod/marawa/node-walker'

declare module '@lblod/marawa/rdfa-context-scanner' {
  export interface RdfaBlock{
    start: Number,
    end: Number,
    isRdfaBlock: Boolean,
    semanticNode: Boolean,
    text: String,
    length: Number,
    region: Array<Number>,
    richNodes: Array<RichNode>,
    context: Array<RdfaTriple>
  }
  export interface RichNode {
    start: Number,
    end: Number,
    isLogicalBlock: Boolean,
    domNode: Node,
    parent: RichNode,
    rdfaBlocks: Array<RdfaBlock>,
    rdfaContext: Array<RdfaAttribute>,
    rdfaPrefixes: Object,
    text: String,
    type: String
  }
  export interface RdfaAttribute {
    currentPrefixes: Object,
    properties: Array<String>,
    resource: String,
    text: String,
    typeof: Array<String>,
    content: String,
    property: String,
    isEmpty: Boolean,
    vocab: String,
  }
  export interface RdfaTriple {
    subject: String,
    predicate: String,
    object: String,
    datatype: String,
  }
  export function analyse(node: Node): RdfaBlock[]
}
