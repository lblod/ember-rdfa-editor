import EmberObject from '@ember/object';
import {walk as walkDomNode} from "@lblod/marawa/node-walker";
import RichNode from "@lblod/marawa/rich-node";
import classic from 'ember-classic-decorator';
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import {ModelError} from "@lblod/ember-rdfa-editor/archive/utils/errors";
import {CORE_OWNER} from "@lblod/ember-rdfa-editor/util/constants";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import Command from "@lblod/ember-rdfa-editor/core/command";
import ModelSelectionTracker from "@lblod/ember-rdfa-editor/archive/utils/ce/model-selection-tracker";
import InsertTextCommand from "typing-plugin/commands/insert-text-command";
import RemoveTableColumnCommand from "tables-plugin/commands/remove-table-column-command";
import InsertXmlCommand from "content-control-plugin/commands/insert-xml-command";
import InsertTableColumnBeforeCommand from "tables-plugin/commands/insert-table-column-before-command";
import FindNodesCommand from "searching-plugin/commands/find-nodes-command";
import EventBus, {EditorEventListener, EditorEventName} from "@lblod/ember-rdfa-editor/core/event-bus";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import RemoveBoldCommand from "text-styles-plugin/commands/remove-bold-command";
import RemoveHighlightCommand from "text-styles-plugin/commands/remove-highlight-command";
import MakeHighlightCommand from "text-styles-plugin/commands/make-highlight-command";
import DeleteSelectionCommand from "deletion-plugin/commands/delete-selection-command";
import MakeListCommand from "lists-plugin/commands/make-list-command";
import MakeUnderlineCommand from "text-styles-plugin/commands/make-underline-command";
import MakeItalicCommand from "text-styles-plugin/commands/make-italic-command";
import InsertNewLiCommand from "lists-plugin/commands/insert-newLi-command";
import UndoCommand from "history-plugin/commands/undo-command";
import InsertTableRowAboveCommand from "tables-plugin/commands/insert-table-row-above-command";
import RemoveStrikethroughCommand from "text-styles-plugin/commands/remove-strikethrough-command";
import MatchTextCommand from "searching-plugin/commands/match-text-command";
import InsertTableCommand from "tables-plugin/commands/insert-table-command";
import InsertTableColumnAfterCommand from "tables-plugin/commands/insert-table-column-after-command";
import InsertHtmlCommand from "content-control-plugin/commands/insert-html-command";
import IndentListCommand from "lists-plugin/commands/indent-list-command";
import RemoveItalicCommand from "text-styles-plugin/commands/remove-italic-command";
import MakeStrikethroughCommand from "text-styles-plugin/commands/make-strikethrough-command";
import RemoveTableRowCommand from "tables-plugin/commands/remove-table-row-command";
import RemoveTableCommand from "tables-plugin/commands/remove-table-command";
import UnindentListCommand from "lists-plugin/commands/unindent-list-command";
import InsertNewLineCommand from "typing-plugin/commands/insert-newLine-command";
import RemoveListCommand from "lists-plugin/commands/remove-list-command";
import InsertTableRowBelowCommand from "tables-plugin/commands/insert-table-row-below-command";
import MakeBoldCommand from "text-styles-plugin/commands/make-bold-command";
import RemoveUnderlineCommand from "text-styles-plugin/commands/remove-underline-command";
import ReadSelectionCommand from "content-control-plugin/commands/read-selection-command";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import HtmlModel from "@lblod/ember-rdfa-editor/core/model/html-model";

export type WidgetLocation = "toolbar" | "sidebar";

export interface WidgetSpec {
  identifier: string;
  componentName: string;
  desiredLocation: WidgetLocation;
}
export type InternalWidgetSpec = WidgetSpec & {controller: EditorController};

/**
 * Raw contenteditable editor. This acts as both the internal and external API to the DOM.
 * Any editing operations should be implemented as {@link Command commands}. External plugins can register their own commands.
 * Commands have access to the {@link Model} which represents our interface to the real DOM.
 * TODO: Do we really need to extend EmberObject?
 *
 * @module contenteditable-editor
 * @class RawEditor
 * @constructor
 * @extends EmberObject
 */
@classic
class RawEditor extends EmberObject {
  registeredCommands: Map<string, Command> = new Map<string, Command>();
  modelSelectionTracker!: ModelSelectionTracker;

  private _model?: HtmlModel;
  protected tryOutVdom = true;
  private _toolbarWidgets: Map<string, string> = new Map();

  /**
   * a rich representation of the dom tree created with {{#crossLink "NodeWalker"}}NodeWalker{{/crossLink}}
   * @property richNode
   * @type RichNode
   * @protected
   */
  richNode!: RichNode;

  constructor(properties?: Record<string, unknown>) {
    super(properties);
  }

  get toolbarWidgets(): IterableIterator<string> {
    return this._toolbarWidgets.values();
  }

  /**
   * @method updateRichNode
   * @private
   */
  updateRichNode() {
    this.richNode = walkDomNode(this.rootNode);
  }

  initialize(rootNode: HTMLElement) {
    if (this.modelSelectionTracker) {
      this.modelSelectionTracker.stopTracking();
    }

    this.registeredCommands = new Map<string, Command>();
    this._model = new HtmlModel(rootNode);
    this.modelSelectionTracker = new ModelSelectionTracker(this._model);
    this.modelSelectionTracker.startTracking();

    window.__VDOM = this.model;
    window.__executeCommand = (commandName: string, ...args: unknown[]) => {
      this.executeCommand("browser-console", commandName, ...args);
    };

    this.registerCommand(new MakeBoldCommand(this.model));
    this.registerCommand(new RemoveBoldCommand(this.model));
    this.registerCommand(new MakeItalicCommand(this.model));
    this.registerCommand(new RemoveItalicCommand(this.model));
    this.registerCommand(new MakeStrikethroughCommand(this.model));
    this.registerCommand(new RemoveStrikethroughCommand(this.model));
    this.registerCommand(new MakeUnderlineCommand(this.model));
    this.registerCommand(new RemoveUnderlineCommand(this.model));
    this.registerCommand(new MakeListCommand(this.model));
    this.registerCommand(new RemoveListCommand(this.model));
    this.registerCommand(new UnindentListCommand(this.model));
    this.registerCommand(new IndentListCommand(this.model));
    this.registerCommand(new InsertNewLineCommand(this.model));
    this.registerCommand(new InsertNewLiCommand(this.model));
    this.registerCommand(new MakeHighlightCommand(this.model));
    this.registerCommand(new RemoveHighlightCommand(this.model));
    this.registerCommand(new InsertTableCommand(this.model));
    this.registerCommand(new InsertTableRowAboveCommand(this.model));
    this.registerCommand(new InsertTableRowBelowCommand(this.model));
    this.registerCommand(new InsertTableColumnBeforeCommand(this.model));
    this.registerCommand(new InsertTableColumnAfterCommand(this.model));
    this.registerCommand(new RemoveTableRowCommand(this.model));
    this.registerCommand(new RemoveTableColumnCommand(this.model));
    this.registerCommand(new RemoveTableCommand(this.model));
    this.registerCommand(new InsertHtmlCommand(this.model));
    this.registerCommand(new InsertXmlCommand(this.model));
    this.registerCommand(new InsertTextCommand(this.model));
    this.registerCommand(new DeleteSelectionCommand(this.model));
    this.registerCommand(new ReadSelectionCommand(this.model));
    this.registerCommand(new UndoCommand(this.model));
    this.registerCommand(new FindNodesCommand(this.model));
    this.registerCommand(new MatchTextCommand(this.model));
  }

  /**
   * The root node of the editor. This is the node with the contentEditable attribute.
   * No operations should ever affect any node outside of its tree.
   */
  get rootNode(): HTMLElement {
    return this.model.rootNode;
  }

  set rootNode(rootNode: HTMLElement) {
    if (rootNode) {
      this.initialize(rootNode);
      this.model.read(false);
      this.model.selection.collapseIn(this.model.rootModelNode);
      this.model.write(CORE_OWNER);
      this.updateRichNode();
    }
  }

  get selection(): ModelSelection {
    return this.model.selection;
  }

  get rootModelNode(): ModelElement {
    return this.model.rootModelNode;
  }

  get model(): Model {
    if (!this._model) {
      throw new ModelError("HtmlModel accessed before initialization is complete");
    }
    return this._model;
  }

  set model(value: Model) {
    this._model = value;
  }

  /**
   * Register a command for use with {@link executeCommand}.
   * @param command
   */
  registerCommand(command: Command) {
    this.registeredCommands.set(command.name, command);
  }

  /**
   * Execute a command with name commandName. Any extra arguments are passed through to the command.
   * @param commandName
   * @param args
   */
  executeCommand(commandName: string, ...args: unknown[]) {
    return this.executeCommand_(CORE_OWNER, commandName, ...args);
  }

  executeCommand_(executedBy: string, commandName: string, ...args: unknown[]) {
    try {
      const command = this.getCommand(commandName);
      if (command.canExecute(...args)) {
        const result = command.execute(executedBy, ...args);
        this.updateRichNode();

        return result;
      }
    } catch (e) {
      console.error(e);
    }

  }

  /**
   * Check if a command can be executed in the given context.
   * It is not required to check this before executing, as a command will
   * not run when this condition is not met. But it can be useful know if a command
   * is valid without running it.
   * @param commandName
   * @param args
   */
  canExecuteCommand(commandName: string, ...args: unknown[]) {
    return this.getCommand(commandName).canExecute(...args);
  }

  private getCommand(commandName: string): Command {
    const command = this.registeredCommands.get(commandName);
    if (!command) {
      throw new Error(`Unrecognized command ${commandName}`);
    }
    return command;
  }

  /**
   * Create a range within the virtual dom.
   * @param path1
   * @param path2
   */
  createRangeFromPaths(path1: number[], path2: number[]): ModelRange {
    return ModelRange.fromPaths(this.model.rootModelNode, path1, path2);
  }

  createFullDocumentRange(): ModelRange {
    return ModelRange.fromInElement(this.model.rootModelNode, 0, this.model.rootModelNode.getMaxOffset());
  }

  /**
   * Create a selection on the virtual dom.
   * Starts out without any selected ranges.
   */
  createSelection(): ModelSelection {
    return new ModelSelection();
  }

  on<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>) {
    EventBus.on(eventName, callback);
  }

  off<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>) {
    EventBus.off(eventName, callback);
  }

  registerWidget(widgetSpec: WidgetSpec) {
    const {componentName, desiredLocation, identifier} = widgetSpec;
    if (desiredLocation === "toolbar") {
      if (this._toolbarWidgets.has(identifier)) {
        console.warn(`Overwriting existing widget with identifier ${identifier} and componentName ${componentName}`);
      }
      this._toolbarWidgets.set(identifier, componentName);
    }
  }
}

export default RawEditor;
