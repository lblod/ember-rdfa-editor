import { PNode } from '#root';
import { Fragment, MarkType, NodeType, Schema } from 'prosemirror-model';
import { find as linkifyFind } from 'linkifyjs';

/**
 *
 * Modified from https://github.com/ProseMirror/prosemirror/issues/90
 * This modified version is made to work with the linkifyjs (https://github.com/Hypercontext/linkifyjs) library
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

export default function linkifyFragment(
  fragment: Fragment,
  linkType: NodeType | MarkType,
  schema: Schema,
) {
  const transformedContent: PNode[] = [];
  fragment.forEach((child) => {
    if (child.isText && child.text) {
      const links = linkifyFind(child.text);
      let pos = 0;
      for (const link of links) {
        if (pos < link.start) {
          transformedContent.push(child.cut(pos, link.start));
        }
        let linkNode: PNode;
        if (linkType instanceof NodeType) {
          linkNode = linkType.create(
            { href: link.href },
            child.cut(link.start, link.end),
          );
        } else {
          linkNode = child
            .cut(link.start, link.end)
            .mark(linkType.create({ href: link.href }).addToSet(child.marks));
        }
        transformedContent.push(linkNode);
        pos = link.end;
      }
      if (pos < child.text.length) {
        transformedContent.push(child.cut(pos, child.text.length));
      }
    } else if (child.type === linkType) {
      transformedContent.push(child);
    } else {
      transformedContent.push(
        child.copy(linkifyFragment(child.content, linkType, schema)),
      );
    }
  });
  return Fragment.fromArray(transformedContent);
}
