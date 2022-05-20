import xmlFormat from 'xml-formatter';
import HTMLExportWriter from '@lblod/ember-rdfa-editor/model/writers/html-export-writer';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import {
  AnyEventName,
  EditorEventListener,
  ListenerConfig,
} from '@lblod/ember-rdfa-editor/utils/event-bus';
import {
  EditorController,
  RawEditorController,
} from '@lblod/ember-rdfa-editor/model/controller';

/**
 * Legacy interface for external consumers. They expect to receive this interface
 * upon initialization of the editor. Very similar to a controller, which is why we provide
 * backwards compat in this way
 */
interface RdfaDocument {
  get htmlContent(): string;

  set htmlContent(html: string);

  get xmlContent(): string;

  set xmlContent(xml: string);

  get xmlContentPrettified(): string;

  setHtmlContent(html: string): void;

  on<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ): void;

  off<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ): void;
}

/**
 * RdfaDocument is a virtual representation of the document
 * it creates a DOM copy that does not include highlights
 * both richNode and rootNode are calculated on the fly.
 *
 * This is both to protect the internal dom of the editor and to remove internals
 */
export default class RdfaDocumentController
  extends EditorController
  implements RdfaDocument
{
  get htmlContent() {
    // const htmlWriter = new HTMLExportWriter(this._editor.);
    // const output = htmlWriter.write(
    //   this._rawEditor.model.rootModelNode
    // ) as HTMLElement;
    // return output.innerHTML;
    return '';
  }

  set htmlContent(html: string) {
    const root = this._editor.state.document;
    const range = ModelRange.fromPaths(root, [0], [root.getMaxOffset()]);
    this._editor.executeCommand('insert-html', { htmlString: html, range });
  }

  get xmlContent() {
    return (this._rawEditor.model.toXml() as Element).innerHTML;
  }

  set xmlContent(xml: string) {
    const root = this._rawEditor.model.rootModelNode;
    const range = ModelRange.fromPaths(root, [0], [root.getMaxOffset()]);
    this._rawEditor.executeCommand('insert-xml', xml, range);
  }

  get xmlContentPrettified() {
    const root = this._rawEditor.model.toXml() as Element;
    let result = '';
    for (const child of root.childNodes) {
      let formatted;

      try {
        formatted = xmlFormat((child as Element).outerHTML);
      } catch (e) {
        formatted = (child as Element).outerHTML;
      }

      result += formatted;
    }

    return result;
  }

  setHtmlContent(html: string) {
    this.htmlContent = html;
  }

  on<E extends AnyEventName>(eventName: E, callback: EditorEventListener<E>) {
    this._rawEditor.on(eventName, callback);
  }

  off<E extends AnyEventName>(eventName: E, callback: EditorEventListener<E>) {
    this._rawEditor.off(eventName, callback);
  }
}
