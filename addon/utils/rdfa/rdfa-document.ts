import { ViewController } from '@lblod/ember-rdfa-editor/model/controller';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import HTMLExportWriter from '@lblod/ember-rdfa-editor/model/writers/html-export-writer';
import {
  AnyEventName,
  EditorEventListener,
  ListenerConfig,
} from '@lblod/ember-rdfa-editor/utils/event-bus';
import xmlFormat from 'xml-formatter';

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
  extends ViewController
  implements RdfaDocument
{
  get htmlContent() {
    const htmlWriter = new HTMLExportWriter();
    const output = htmlWriter.write(this.currentState.document) as HTMLElement;
    return output.innerHTML;
  }

  set htmlContent(html: string) {
    const root = this.currentState.document;
    const range = ModelRange.fromPaths(root, [0], [root.getMaxOffset()]);
    this.perform((tr) => {
      console.log(JSON.stringify(tr.commands));
      tr.commands.insertHtml({ htmlString: html, range });
    });
  }

  get xmlContent() {
    return (this.currentState.document.toXml() as Element).innerHTML;
  }

  set xmlContent(xml: string) {
    const root = this.currentState.document;
    const range = ModelRange.fromPaths(root, [0], [root.getMaxOffset()]);
    this.perform((tr) => tr.commands.insertXml({ xml, range }));
  }

  get xmlContentPrettified() {
    const root = this.currentState.document.toXml() as Element;
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
    this.on(eventName, callback);
  }

  off<E extends AnyEventName>(eventName: E, callback: EditorEventListener<E>) {
    this.off(eventName, callback);
  }
}
