import { PNode, ProseParser } from '@lblod/ember-rdfa-editor';
import { Schema } from 'prosemirror-model';
import HTMLInputParser from './html-input-parser';
import { EditorView } from 'prosemirror-view';

export function htmlToDoc(
  html: string,
  options: { schema: Schema; editorView: EditorView },
) {
  const htmlCleaner = new HTMLInputParser({ editorView: options.editorView });
  const cleanedHTML = htmlCleaner.prepareHTML(html);
  const { schema } = options;
  const domParser = new DOMParser();
  const parsed = domParser.parseFromString(cleanedHTML, 'text/html').body;
  const documentDiv = parsed.querySelector('div[data-say-document="true"]');
  let doc: PNode;
  if (documentDiv) {
    doc = ProseParser.fromSchema(schema).parse(documentDiv, {
      preserveWhitespace: true,
      topNode: schema.nodes.doc.create({
        ...Object.entries(schema.nodes.doc.spec.attrs ?? {}).reduce(
          (acc, [key, value]) => {
            acc[key] = documentDiv.getAttribute(key) ?? value.default;

            return acc;
          },
          {} as Record<string, unknown>,
        ),
      }),
    });
  } else {
    doc = ProseParser.fromSchema(schema).parse(parsed, {
      preserveWhitespace: true,
    });
  }
  return doc;
}
