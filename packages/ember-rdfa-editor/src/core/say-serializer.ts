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

import type SayEditor from '#root/core/say-editor.ts';
import type SayMarkSpec from '#root/core/say-mark-spec.ts';
import type SayNodeSpec from '#root/core/say-node-spec.ts';
import type { PNode } from '#root/prosemirror-aliases.ts';
import {
  type DOMOutputSpec,
  DOMSerializer,
  Mark,
  MarkType,
  NodeType,
  Schema,
} from 'prosemirror-model';
import type { EditorState } from 'prosemirror-state';

export type NodeSerializer = (node: PNode, state: EditorState) => DOMOutputSpec;
/**
 * Equivalent to {@link https://prosemirror.net/docs/ref/#model.NodeSpec.toDOM} except a
 * SaySerializer can pass an EditorState argument, which means this function can know if this is
 * being written to DOM or exported
 */
export type SayNodeToDOM = (node: PNode, state?: EditorState) => DOMOutputSpec;
export type MarkSerializer = (
  mark: Mark,
  inline: boolean,
  state: EditorState,
) => DOMOutputSpec;
/**
 * Equivalent to {@link https://prosemirror.net/docs/ref/#model.MarkSpec.toDOM} except a
 * SaySerializer can pass an EditorState argument, which means this function can know if this is
 * being written to DOM or exported
 */
export type SayMarkToDOM = (
  mark: Mark,
  inline: boolean,
  state?: EditorState,
) => DOMOutputSpec;

type StateGenerator = () => EditorState;
/**
 * ProseMirror DOMSerializer which serializes nodes and marks based on their `serialize` or `toDOM` method.
 * If the node/mark has a `serialize` method, the current editor state is passed to that method.
 * If the node/mark has no `serialize` but does have a `toDOM` method, this is called with the current editor state as its final argument.
 * This allows easy re-use of `toDOM` logic, with the presence of the `state` argument signalling whether this is called by a `SaySerializer` or `DOMSerializer`.
 * When a node has both `serialize` and `toDOM` methods defined, the `serialize` method always takes precendence over the `toDOM` method when using the `SaySerializer`.
 * Note, for the `SaySerializer` to work, an instance of `SayEditor` is required.
 * If such an instance is not passed to the `fromSchema` static function, a default ProseMirror `DOMSerializer` is created.
 */

export default class SaySerializer extends DOMSerializer {
  declare nodes: {
    [node: string]: SayNodeToDOM;
  };
  declare marks: {
    [mark: string]: SayMarkToDOM;
  };
  stateGenerator: StateGenerator;

  constructor(
    nodes: {
      [node: string]: SayNodeToDOM;
    },
    marks: { [mark: string]: SayMarkToDOM },
    stateGenerator: StateGenerator,
  );
  /**
   * @deprecated passing an instance of {SayEditor} to this constructor is deprecated, use a {StateGenerator} instead
   */
  constructor(
    /// The node serialization functions.
    nodes: {
      [node: string]: SayNodeToDOM;
    },
    /// The mark serialization functions.
    marks: { [mark: string]: SayMarkToDOM },
    editor: SayEditor,
  );
  constructor(
    nodes: {
      [node: string]: SayNodeToDOM;
    },
    /// The mark serialization functions.
    marks: { [mark: string]: SayMarkToDOM },
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
    [node: string]: SayNodeToDOM;
  };
  /**
   * @deprecated passing an instance of {SayEditor} to this function is deprecated, use a {StateGenerator} instead
   */
  static nodesFromSchema(
    schema: Schema,
    editor: SayEditor,
  ): {
    [node: string]: SayNodeToDOM;
  };
  static nodesFromSchema(
    schema: Schema,
    stateGenerator: StateGenerator,
  ): {
    [node: string]: SayNodeToDOM;
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
    [mark: string]: SayMarkToDOM;
  };
  /**
   * @deprecated passing an instance of {SayEditor} to this function is deprecated, use a {StateGenerator} instead
   */
  static marksFromSchema(
    schema: Schema,
    editor: SayEditor,
  ): {
    [mark: string]: SayMarkToDOM;
  };
  static marksFromSchema(
    schema: Schema,
    stateGenerator: StateGenerator,
  ): {
    [mark: string]: SayMarkToDOM;
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
  [node: string]: SayNodeToDOM;
};
function gatherToDOM(
  obj: { [node: string]: MarkType },
  stateGenerator: StateGenerator,
): {
  [node: string]: SayMarkToDOM;
};
function gatherToDOM(
  obj: { [node: string]: NodeType | MarkType },
  stateGenerator: StateGenerator,
) {
  const result: {
    [node: string]: SayNodeToDOM | SayMarkToDOM;
  } = {};
  for (const name in obj) {
    const type = obj[name];
    if (type instanceof NodeType) {
      const spec = obj[name].spec as SayNodeSpec;
      const { serialize, toDOM } = spec;
      if (serialize) {
        result[name] = (node: PNode) => serialize(node, stateGenerator());
      } else if (toDOM) {
        result[name] = (node: PNode) => toDOM(node, stateGenerator());
      }
    } else {
      const spec = obj[name].spec as SayMarkSpec;
      const { serialize, toDOM } = spec;
      if (serialize) {
        result[name] = (mark: Mark, inline: boolean) =>
          serialize(mark, inline, stateGenerator());
      } else if (toDOM) {
        result[name] = (mark: Mark, inline: boolean) =>
          toDOM(mark, inline, stateGenerator());
      }
    }
  }
  return result;
}

function doc(options: { document?: Document }) {
  return options.document || window.document;
}

function toStateGenerator(editorOrStateGenerator: SayEditor | StateGenerator) {
  if ('mainView' in editorOrStateGenerator) {
    return () => editorOrStateGenerator.mainView.state;
  } else {
    return editorOrStateGenerator;
  }
}
