/**
 *
 * Baed on https://github.com/ProseMirror/prosemirror-model/blob/master/src/to_dom.ts
 * This modified version of the `DOMSerialize` takes an optional `serialize` method into account.
 *
 * Copyright (C) 2015-2017 by Marijn Haverbeke <marijnh@gmail.com> and others

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { EditorState, PNode } from '#root';
import SayEditor from '#root/core/say-editor';
import type SayMarkSpec from '#root/core/say-mark-spec';
import type SayNodeSpec from '#root/core/say-node-spec';
import {
  type DOMOutputSpec,
  DOMSerializer,
  Mark,
  MarkType,
  NodeType,
  Schema,
} from 'prosemirror-model';

export type NodeSerializer = (node: PNode, state: EditorState) => DOMOutputSpec;
export type MarkSerializer = (
  mark: Mark,
  inline: boolean,
  state: EditorState,
) => DOMOutputSpec;

type NodeToDOM = NonNullable<SayNodeSpec['toDOM']>;
type MarkToDOM = NonNullable<SayMarkSpec['toDOM']>;

type StateGenerator = () => EditorState;
/**
 * ProseMirror DOMSerializer which serializes nodes and marks based on their `serialize` or `toDOM` method.
 * If the node/mark has a `serialize` method, the current editor state is passed to that method.
 * When a node has both `serialize` and `toDOM` methods defined, the `serialize` method always takes precendence over the `toDOM` method when using the `SaySerializer`.
 * Note, for the `SaySerializer` to work, an instance of `SayEditor` is required.
 * If such an instance is not passed to the `fromSchema` static function, a default ProseMirror `DOMSerializer` is created.
 */

export default class SaySerializer extends DOMSerializer {
  declare nodes: {
    [node: string]: NodeToDOM;
  };
  declare marks: {
    [mark: string]: MarkToDOM;
  };
  stateGenerator: StateGenerator;

  constructor(
    nodes: {
      [node: string]: NodeToDOM;
    },
    marks: { [mark: string]: MarkToDOM },
    stateGenerator: StateGenerator,
  );
  /**
   * @deprecated passing an instance of {SayEditor} to this constructor is deprecated, use a {StateGenerator} instead
   */
  constructor(
    /// The node serialization functions.
    nodes: {
      [node: string]: NodeToDOM;
    },
    /// The mark serialization functions.
    marks: { [mark: string]: MarkToDOM },
    editor: SayEditor,
  );
  constructor(
    nodes: {
      [node: string]: NodeToDOM;
    },
    /// The mark serialization functions.
    marks: { [mark: string]: MarkToDOM },
    stateGeneratorOrEditor: SayEditor | StateGenerator,
  ) {
    super(nodes, marks);
    this.stateGenerator = toStateGenerator(stateGeneratorOrEditor);
  }

  get state() {
    return this.stateGenerator();
  }

  /// @internal
  serializeNodeInner(node: PNode, options: { document?: Document }) {
    const { dom, contentDOM } = DOMSerializer.renderSpec(
      doc(options),
      this.nodes[node.type.name](node),
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
    options: { document?: Document } = {},
  ) {
    const serializer = this.marks[mark.type.name];
    return (
      serializer &&
      DOMSerializer.renderSpec(doc(options), serializer(mark, inline))
    );
  }

  /**
   * If an instance of `SayEditor` is provided to this method, an instance of `SaySerializer` is returned.
   * Otherwise an instance of the default `DOMSerializer` is returned.
   * `SaySerializer` needs an instance of `SayEditor` to properly work.
   * NOTE: the behaviour of this differs from `DOMSerializer` as the ProseMirror version caches the
   * serializer, whereas we do not.
   */
  static fromSchema(schema: Schema): DOMSerializer;
  static fromSchema(
    schema: Schema,
    stateGenerator: StateGenerator,
  ): SaySerializer;
  /**
   * @deprecated passing an instance of {SayEditor} to this function is deprecated, use a {StateGenerator} instead
   */
  static fromSchema(schema: Schema, editor: SayEditor): SaySerializer;
  static fromSchema(
    schema: Schema,
    editorOrStateGenerator?: SayEditor | StateGenerator,
  ): DOMSerializer {
    if (editorOrStateGenerator) {
      const stateGenerator = toStateGenerator(editorOrStateGenerator);
      return new SaySerializer(
        SaySerializer.nodesFromSchema(schema, stateGenerator),
        SaySerializer.marksFromSchema(schema, stateGenerator),
        stateGenerator,
      );
    } else {
      // Use the cached stock `DOMSerializer` to mimic ProseMirror code
      return (
        (schema.cached['domSerializer'] as DOMSerializer) ||
        (schema.cached['domSerializer'] = new DOMSerializer(
          DOMSerializer.nodesFromSchema(schema),
          DOMSerializer.marksFromSchema(schema),
        ))
      );
    }
  }

  static nodesFromSchema(schema: Schema): {
    [node: string]: NodeToDOM;
  };
  /**
   * @deprecated passing an instance of {SayEditor} to this function is deprecated, use a {StateGenerator} instead
   */
  static nodesFromSchema(
    schema: Schema,
    editor: SayEditor,
  ): {
    [node: string]: NodeToDOM;
  };
  static nodesFromSchema(
    schema: Schema,
    stateGenerator: StateGenerator,
  ): {
    [node: string]: NodeToDOM;
  };
  static nodesFromSchema(
    schema: Schema,
    editorOrStateGenerator?: SayEditor | StateGenerator,
  ) {
    if (editorOrStateGenerator) {
      const result = gatherToDOM(
        schema.nodes,
        toStateGenerator(editorOrStateGenerator),
      );
      if (!result['text'])
        result['text'] = (node: PNode) => node.text as string;
      return result;
    } else {
      return super.nodesFromSchema(schema);
    }
  }

  /// Gather the serializers in a schema's mark specs into an object.
  static marksFromSchema(schema: Schema): {
    [mark: string]: MarkToDOM;
  };
  /**
   * @deprecated passing an instance of {SayEditor} to this function is deprecated, use a {StateGenerator} instead
   */
  static marksFromSchema(
    schema: Schema,
    editor: SayEditor,
  ): {
    [mark: string]: MarkToDOM;
  };
  static marksFromSchema(
    schema: Schema,
    stateGenerator: StateGenerator,
  ): {
    [mark: string]: MarkToDOM;
  };

  static marksFromSchema(
    schema: Schema,
    editorOrStateGenerator?: SayEditor | StateGenerator,
  ) {
    if (editorOrStateGenerator) {
      return gatherToDOM(
        schema.marks,
        toStateGenerator(editorOrStateGenerator),
      );
    } else {
      return super.marksFromSchema(schema);
    }
  }
}

function gatherToDOM(
  obj: { [node: string]: NodeType },
  stateGenerator: StateGenerator,
): {
  [node: string]: NodeToDOM;
};
function gatherToDOM(
  obj: { [node: string]: MarkType },
  stateGenerator: StateGenerator,
): {
  [node: string]: MarkToDOM;
};
function gatherToDOM(
  obj: { [node: string]: NodeType | MarkType },
  stateGenerator: StateGenerator,
) {
  const result: {
    [node: string]: NodeToDOM | MarkToDOM;
  } = {};
  for (const name in obj) {
    const type = obj[name];
    if (type instanceof NodeType) {
      const spec = obj[name].spec as SayNodeSpec;
      const { serialize, toDOM } = spec;
      if (serialize) {
        result[name] = (node: PNode) => serialize(node, stateGenerator());
      } else if (toDOM) {
        result[name] = toDOM;
      }
    } else {
      const spec = obj[name].spec as SayMarkSpec;
      const { serialize, toDOM } = spec;
      if (serialize) {
        result[name] = (mark: Mark, inline: boolean) =>
          serialize(mark, inline, stateGenerator());
      } else if (toDOM) {
        result[name] = toDOM;
      }
    }
  }
  return result;
}

function doc(options: { document?: Document }) {
  return options.document || window.document;
}

function toStateGenerator(editorOrStateGenerator: SayEditor | StateGenerator) {
  if (editorOrStateGenerator instanceof SayEditor) {
    return () => editorOrStateGenerator.mainView.state;
  } else {
    return editorOrStateGenerator;
  }
}
