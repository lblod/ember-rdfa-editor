import { EditorState, PNode } from '@lblod/ember-rdfa-editor';
import SayEditor from '@lblod/ember-rdfa-editor/core/say-editor';
import SayMarkSpec from '@lblod/ember-rdfa-editor/core/say-mark-spec';
import SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';
import {
  DOMOutputSpec,
  DOMSerializer,
  Mark,
  MarkType,
  NodeType,
  Schema,
} from 'prosemirror-model';

type NodeSerializer = (node: PNode, state?: EditorState) => DOMOutputSpec;
type MarkSerializer = (
  mark: Mark,
  inline: boolean,
  state?: EditorState
) => DOMOutputSpec;

/**
 * ProseMirror DOMSerializer which serializes nodes and marks based on their `serialize` or `toDOM` method.
 * If the node/mark has a `serialize` method, the current editor state is passed to that method.
 * Note, for the `SaySerializer` to work, an instance of `SayEditor` is required.
 * If such an instance is not passed to the `fromSchema` static function, a default ProseMirror `DOMSerializer` is created.
 */
export default class SaySerializer extends DOMSerializer {
  declare nodes: {
    [node: string]: NodeSerializer;
  };
  declare marks: { [mark: string]: MarkSerializer };

  constructor(
    /// The node serialization functions.
    nodes: {
      [node: string]: NodeSerializer;
    },
    /// The mark serialization functions.
    marks: { [mark: string]: MarkSerializer },
    readonly editor: SayEditor
  ) {
    super(nodes, marks);
  }

  get state() {
    return this.editor.mainView.state;
  }

  /// @internal
  serializeNodeInner(node: PNode, options: { document?: Document }) {
    const { dom, contentDOM } = DOMSerializer.renderSpec(
      doc(options),
      this.nodes[node.type.name](node, this.state)
    );
    if (contentDOM) {
      if (node.isLeaf)
        throw new RangeError('Content hole not allowed in a leaf node spec');
      this.serializeFragment(node.content, options, contentDOM);
    }
    return dom;
  }

  /// @internal
  serializeMark(
    mark: Mark,
    inline: boolean,
    options: { document?: Document } = {}
  ) {
    const serializer = this.marks[mark.type.name];
    return (
      serializer &&
      DOMSerializer.renderSpec(
        doc(options),
        serializer(mark, inline, this.state)
      )
    );
  }

  /**
   * If an instance of `SayEditor` is provided to this method, an instance of `SaySerializer` is returned.
   * Otherwise an instance of the default `DOMSerializer` is returned.
   * `SaySerializer` needs an instance of `SayEditor` to properly work.
   */
  static fromSchema(schema: Schema): DOMSerializer;
  static fromSchema(schema: Schema, editor: SayEditor): SaySerializer;
  static fromSchema(schema: Schema, editor?: SayEditor): DOMSerializer {
    if (editor) {
      return (
        (schema.cached.saySerializer as SaySerializer) ||
        (schema.cached.saySerializer = new SaySerializer(
          SaySerializer.nodesFromSchema(schema),
          SaySerializer.marksFromSchema(schema),
          editor
        ))
      );
    } else {
      return (
        (schema.cached.domSerializer as DOMSerializer) ||
        (schema.cached.domSerializer = new DOMSerializer(
          DOMSerializer.nodesFromSchema(schema),
          DOMSerializer.marksFromSchema(schema)
        ))
      );
    }
  }

  static nodesFromSchema(schema: Schema) {
    const result = gatherToDOM(schema.nodes);
    if (!result.text) result.text = (node) => node.text as string;
    return result;
  }

  /// Gather the serializers in a schema's mark specs into an object.
  static marksFromSchema(schema: Schema) {
    return gatherToDOM(schema.marks) as {
      [mark: string]: (mark: Mark, inline: boolean) => DOMOutputSpec;
    };
  }
}

function gatherToDOM(obj: { [node: string]: NodeType }): {
  [node: string]: NodeSerializer;
};
function gatherToDOM(obj: { [node: string]: MarkType }): {
  [node: string]: MarkSerializer;
};
function gatherToDOM(obj: { [node: string]: NodeType | MarkType }) {
  const result: {
    [node: string]: NodeSerializer | MarkSerializer;
  } = {};
  for (const name in obj) {
    const spec = obj[name].spec as SayNodeSpec | SayMarkSpec;
    // The `serialize` method gets priority over the `toDOM` method.
    if (spec.serialize) {
      result[name] = spec.serialize;
    } else if (spec.toDOM) {
      result[name] = spec.toDOM;
    }
  }
  return result;
}

function doc(options: { document?: Document }) {
  return options.document || window.document;
}
