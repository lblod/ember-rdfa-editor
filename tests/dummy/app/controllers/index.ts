import Controller from '@ember/controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import xmlFormat from 'xml-formatter';
import {inject as service} from '@ember/service';
import {basicSetup, EditorState, EditorView} from "@codemirror/basic-setup";
import {xml} from "@codemirror/lang-xml";
import {html} from "@codemirror/lang-html";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import {UninitializedError} from "@lblod/ember-rdfa-editor/util/errors";

interface FeaturesService {
  disable: (feature: string) => void;
  enable: (feature: string) => void
}

export default class IndexController extends Controller {

  @tracked private _editorController?: EditorController;
  @tracked debug: unknown;
  @tracked xmlDebuggerOpen = false;
  @tracked debuggerContent = "";
  @service features!: FeaturesService;
  @tracked htmlDebuggerOpen = false;
  private unloadListener?: () => void;
  private xmlEditor?: EditorView;
  private htmlEditor?: EditorView;

  setup() {
    this.unloadListener = () => {
      this.saveEditorContentToLocalStorage();
    };
    window.addEventListener("beforeunload", this.unloadListener);
  }

  teardown() {
    if (this.unloadListener) {
      window.removeEventListener("beforeunload", this.unloadListener);
    }
  }

  get editorController(): EditorController {
    if (!this._editorController) {
      throw new UninitializedError("Accessing controller before editor init");
    }
    return this._editorController;
  }

  @action
  initDebug(info: unknown) {
    this.debug = info;
  }

  @action
  setupXmlEditor(element: HTMLElement) {

    this.xmlEditor = new EditorView({
      state: EditorState.create({
        extensions: [basicSetup, xml()]
      }),
      parent: element
    });
    this.xmlEditor.dispatch({changes: {from: 0, insert: this.debuggerContent}});
  }

  @action
  setupHtmlEditor(element: HTMLElement) {

    this.htmlEditor = new EditorView({
      state: EditorState.create({
        extensions: [basicSetup, html()]
      }),
      parent: element
    });
    this.htmlEditor.dispatch({changes: {from: 0, insert: this.debuggerContent}});
  }

  get formattedXmlContent() {
    if (this.debuggerContent) {
      try {
        return xmlFormat(this.debuggerContent);
      } catch (e) {
        return this.debuggerContent;
      }

    }
    return this.debuggerContent;
  }

  setHtmlContent(content: string): void {
    this.editorController.executeCommand("insert-html", content, this.editorController.rangeFactory.fromAroundAll());
  }

  setXmlContent(content: string): void {
    this.editorController.executeCommand("insert-xml", content, this.editorController.rangeFactory.fromAroundAll());
  }

  @action
  rdfaEditorInit(controller: EditorController) {
    const presetContent = localStorage.getItem("EDITOR_CONTENT") ?? "";
    this._editorController = controller;
    this.setHtmlContent(presetContent);
    const editorDone = new CustomEvent("editor-done");
    window.dispatchEvent(editorDone);
  }

  @action
  setDebuggerContent(content: string) {
    this.debuggerContent = content;
  }

  @action
  setEditorContent(type: "xml" | "html", content: string) {
    if (this._editorController) {
      if (type === "html") {
        this.setHtmlContent(content);
        this.saveEditorContentToLocalStorage();
      } else {
        this.setXmlContent(content);
        this.saveEditorContentToLocalStorage();
      }
    }
  }

  getXmlContent(): string {
    const content = this.editorController?.executeQuery("get-content", "xml", this.editorController?.rangeFactory.fromAroundAll()) as Element;
    return xmlFormat(content.innerHTML);
  }

  getHtmlContent() {
    const content = this.editorController?.executeQuery("get-content", "html", this.editorController?.rangeFactory.fromAroundAll()) as Element;
    return content.innerHTML;
  }

  @action openContentDebugger(type: "xml" | "html") {
    if (this._editorController) {
      if (type === "xml") {
        this.debuggerContent = this.getXmlContent();
        this.xmlDebuggerOpen = true;
      } else {
        this.debuggerContent = this.getHtmlContent();
        this.htmlDebuggerOpen = true;
      }
    }
  }

  @action closeContentDebugger(type: "xml" | "html", save: boolean) {
    if (type === "xml") {
      this.debuggerContent = this.xmlEditor!.state.sliceDoc();
      this.xmlDebuggerOpen = false;
    } else {
      this.debuggerContent = this.htmlEditor!.state.sliceDoc();
      this.htmlDebuggerOpen = false;
    }
    if (save) {
      const content = this.debuggerContent;
      if (!content) {
        //xml parser doesn't accept an empty string
        this.setEditorContent("html", "");
      } else {
        this.setEditorContent(type, content);
      }
    }

  }

  @action
  setPasteBehaviour(event: InputEvent) {
    const val = (event.target as HTMLSelectElement).value;
    if (val === "textonly") {
      this.features.disable('editor-extended-html-paste');
      this.features.disable('editor-html-paste');
    } else if (val === "limited") {
      this.features.disable('editor-extended-html-paste');
      this.features.enable('editor-html-paste');
    } else if (val === "full") {
      this.features.enable('editor-extended-html-paste');
      this.features.enable('editor-html-paste');
    }
  }

  saveEditorContentToLocalStorage() {
    if (this._editorController) {
      const content = this.getHtmlContent();
      localStorage.setItem("EDITOR_CONTENT", content || "");
    }
  }
}
