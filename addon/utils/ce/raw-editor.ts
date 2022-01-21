import Command from '@lblod/ember-rdfa-editor/commands/command';
import IndentListCommand from '@lblod/ember-rdfa-editor/commands/indent-list-command';
import InsertHtmlCommand from '@lblod/ember-rdfa-editor/commands/insert-html-command';
import InsertNewLiCommand from '@lblod/ember-rdfa-editor/commands/insert-newLi-command';
import InsertNewLineCommand from '@lblod/ember-rdfa-editor/commands/insert-newLine-command';
import InsertTableCommand from '@lblod/ember-rdfa-editor/commands/insert-table-command';
import MakeListCommand from '@lblod/ember-rdfa-editor/commands/make-list-command';
import RemoveListCommand from '@lblod/ember-rdfa-editor/commands/remove-list-command';
import RemoveTableColumnCommand from '@lblod/ember-rdfa-editor/commands/remove-table-column-command';
import RemoveTableCommand from '@lblod/ember-rdfa-editor/commands/remove-table-command';
import RemoveTableRowCommand from '@lblod/ember-rdfa-editor/commands/remove-table-row-command';
import MakeBoldCommand from '@lblod/ember-rdfa-editor/commands/text-properties/make-bold-command';
import MakeHighlightCommand from '@lblod/ember-rdfa-editor/commands/text-properties/make-highlight-command';
import MakeItalicCommand from '@lblod/ember-rdfa-editor/commands/text-properties/make-italic-command';
import MakeStrikethroughCommand from '@lblod/ember-rdfa-editor/commands/text-properties/make-strikethrough-command';
import MakeUnderlineCommand from '@lblod/ember-rdfa-editor/commands/text-properties/make-underline-command';
import RemoveBoldCommand from '@lblod/ember-rdfa-editor/commands/text-properties/remove-bold-command';
import RemoveHighlightCommand from '@lblod/ember-rdfa-editor/commands/text-properties/remove-highlight-command';
import RemoveItalicCommand from '@lblod/ember-rdfa-editor/commands/text-properties/remove-italic-command';
import RemoveStrikethroughCommand from '@lblod/ember-rdfa-editor/commands/text-properties/remove-strikethrough-command';
import RemoveUnderlineCommand from '@lblod/ember-rdfa-editor/commands/text-properties/remove-underline-command';
import UnindentListCommand from '@lblod/ember-rdfa-editor/commands/unindent-list-command';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ModelSelectionTracker from '@lblod/ember-rdfa-editor/utils/ce/model-selection-tracker';
import { walk as walkDomNode } from '@lblod/marawa/node-walker';
import RichNode from '@lblod/marawa/rich-node';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import InsertXmlCommand from '@lblod/ember-rdfa-editor/commands/insert-xml-command';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import InsertTextCommand from '@lblod/ember-rdfa-editor/commands/insert-text-command';
import EventBus, {
  AnyEventName,
  EditorEventListener,
  ListenerConfig,
} from '@lblod/ember-rdfa-editor/utils/event-bus';
import DeleteSelectionCommand from '@lblod/ember-rdfa-editor/commands/delete-selection-command';
import InsertTableRowAboveCommand from '@lblod/ember-rdfa-editor/commands/insert-table-row-above-command';
import InsertTableRowBelowCommand from '@lblod/ember-rdfa-editor/commands/insert-table-row-below-command';
import InsertTableColumnBeforeCommand from '@lblod/ember-rdfa-editor/commands/insert-table-column-before-command';
import InsertTableColumnAfterCommand from '@lblod/ember-rdfa-editor/commands/insert-table-column-after-command';
import ReadSelectionCommand from '@lblod/ember-rdfa-editor/commands/read-selection-command';
import UndoCommand from '@lblod/ember-rdfa-editor/commands/undo-command';
import {
  InternalWidgetSpec,
  WidgetLocation,
} from '@lblod/ember-rdfa-editor/model/controller';
import Datastore, {
  EditorStore,
} from '@lblod/ember-rdfa-editor/model/util/datastore';
import { getPathFromRoot } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { tracked } from '@glimmer/tracking';
import {
  boldMarkSpec,
  highlightMarkSpec,
  italicMarkSpec,
  MarkSpec,
  strikethroughMarkSpec,
  testMarkSpec,
  underlineMarkSpec,
} from '@lblod/ember-rdfa-editor/model/markSpec';
import AddMarkCommand from '@lblod/ember-rdfa-editor/commands/add-mark-command';
import RemoveMarkCommand from '@lblod/ember-rdfa-editor/commands/remove-mark-command';

export interface RawEditorProperties {
  baseIRI: string;
}

/**
 * Raw contenteditable editor. This acts as both the internal and external API to the DOM.
 * Any editing operations should be implemented as {@link Command commands}. External plugins can register their own commands.
 * Commands have access to the {@link Model} which represents our interface to the real DOM.
 *
 * @module contenteditable-editor
 * @class RawEditor
 * @constructor
 */
export default class RawEditor {
  registeredCommands: Map<string, Command> = new Map<string, Command>();
  modelSelectionTracker!: ModelSelectionTracker;

  private _model?: Model;
  private _datastore!: Datastore;
  protected tryOutVdom = true;
  protected eventBus: EventBus;
  widgetMap: Map<WidgetLocation, InternalWidgetSpec[]> = new Map<
    WidgetLocation,
    InternalWidgetSpec[]
  >([
    ['toolbar', []],
    ['sidebar', []],
  ]);

  /**
   * a rich representation of the dom tree created with {{#crossLink "NodeWalker"}}NodeWalker{{/crossLink}}
   * @property richNode
   * @type RichNode
   * @protected
   */
  @tracked
  richNode!: RichNode;

  constructor(properties: RawEditorProperties) {
    this.eventBus = new EventBus();
    this.eventBus.on(
      'contentChanged',
      () => {
        this._datastore = EditorStore.fromParse({
          modelRoot: this.model.rootModelNode,
          pathFromDomRoot: getPathFromRoot(this.model.rootNode, false),
          baseIRI: (properties?.baseIRI as string | null) || document.baseURI,
        });
      },
      { priority: 'highest' }
    );
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
    this._model = new Model(rootNode, this.eventBus);
    this.modelSelectionTracker = new ModelSelectionTracker(this._model);
    this.modelSelectionTracker.startTracking();

    window.__VDOM = this.model;
    window.__EDITOR = this;
    window.__executeCommand = (commandName: string, ...args: unknown[]) => {
      this.executeCommand(commandName, ...args);
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
    this.registerCommand(new AddMarkCommand(this.model));
    this.registerCommand(new RemoveMarkCommand(this.model));
    this.registerMark(boldMarkSpec);
    this.registerMark(italicMarkSpec);
    this.registerMark(highlightMarkSpec);
    this.registerMark(underlineMarkSpec);
    this.registerMark(strikethroughMarkSpec);
    this.registerMark(testMarkSpec);
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
      this.model.read();
      this.model.selection.collapseIn(this.model.rootModelNode);
      this.model.write();
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
      throw new ModelError('Model accessed before initialization is complete');
    }
    return this._model;
  }

  set model(value: Model) {
    this._model = value;
  }

  get datastore(): Datastore {
    return this._datastore;
  }

  /**
   * Register a command for use with {@link executeCommand}.
   * @param command
   */
  registerCommand(command: Command) {
    this.registeredCommands.set(command.name, command);
  }

  registerWidget(widget: InternalWidgetSpec): void {
    this.widgetMap.get(widget.desiredLocation)!.push(widget);
  }

  /**
   * Execute a command with name commandName. Any extra arguments are passed through to the command.
   * @param commandName
   * @param args
   */
  executeCommand(commandName: string, ...args: unknown[]) {
    try {
      const command = this.getCommand(commandName);
      if (command.canExecute(...args)) {
        const result = command.execute(...args);
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

  registerMark(markSpec: MarkSpec) {
    this.model.registerMark(markSpec);
  }

  /**
   * Create a selection on the virtual dom.
   * Starts out without any selected ranges.
   */
  createSelection(): ModelSelection {
    return new ModelSelection();
  }

  on<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ) {
    this.eventBus.on(eventName, callback, config);
  }

  off<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ) {
    this.eventBus.off(eventName, callback, config);
  }
}
