import { warn } from '@ember/debug';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';

import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { ListBackspaceDeleteInputPlugin } from '@lblod/ember-rdfa-editor/utils/plugins/lists/backspace-delete-plugin';
import { LumpNodeBackspaceDeleteInputPlugin } from '@lblod/ember-rdfa-editor/utils/plugins/lump-node/backspace-delete-plugin';
import { RdfaBackspaceDeleteInputPlugin } from '@lblod/ember-rdfa-editor/utils/plugins/rdfa/backspace-delete-plugin';
import {
  TableBackspaceDeleteInputPlugin,
  TaBLEBackspaceDeleteInputPlugin,
} from '@lblod/ember-rdfa-editor/utils/plugins/table/backspace-delete-plugin';
import { InputHandler, InputPlugin } from './input-handler';
import { Manipulation, ManipulationGuidance } from './manipulation';

export interface BackspaceDeleteHandlerManipulation extends Manipulation {
  type: 'backspace-delete-handler';
  range: ModelRange;
  direction: number;
}
export default abstract class BackspaceDeleteHandler extends InputHandler {
  abstract direction: number;
  plugins: Array<BackspaceDeletePlugin>;
  constructor({ rawEditor }: { rawEditor: RawEditor }) {
    super(rawEditor);
    this.plugins = [
      new RdfaBackspaceDeleteInputPlugin(),
      new ListBackspaceDeleteInputPlugin(),
      new LumpNodeBackspaceDeleteInputPlugin(),
      new TableBackspaceDeleteInputPlugin(),
    ];
  }

  handleEvent(_: KeyboardEvent) {
    let range = this.rawEditor.selection.lastRange;
    if (range && range.collapsed) {
      const shifted = range.start.shiftedVisually(this.direction);
      range =
        this.direction === -1
          ? new ModelRange(shifted, range.start)
          : new ModelRange(range.start, shifted);
      const manipulation: BackspaceDeleteHandlerManipulation = {
        type: 'backspace-delete-handler',
        range,
        direction: this.direction,
      };
      const { mayExecute, dispatchedExecutor } =
        this.checkManipulationByPlugins(manipulation);

      // Error if we're not allowed to execute.
      if (!mayExecute) {
        warn(
          `Not allowed to execute manipulation for ${this.constructor.toString()}`,
          { id: 'backspace-delete-handler-manipulation-not-allowed' }
        );
        return { allowPropagation: false, allowBrowserDefault: false };
      }

      // Run the manipulation.
      if (dispatchedExecutor) {
        // NOTE: We should pass some sort of editor interface here in the future.
        dispatchedExecutor(manipulation, this.rawEditor);
        return { allowPropagation: true, allowBrowserDefault: false };
      }
    }
    this.rawEditor.executeCommand('remove', range);
    return { allowPropagation: true, allowBrowserDefault: false };
  }
}

export interface BackspaceDeletePlugin extends InputPlugin {
  /**
   * One-liner explaining what the plugin solves.
   */
  label: string;

  /**
   * Callback executed to see if the plugin allows a certain
   * manipulation and/or if it intends to handle the manipulation
   * itself.
   */
  guidanceForManipulation: (
    manipulation: BackspaceDeleteHandlerManipulation,
    editor: RawEditor
  ) => ManipulationGuidance | null;
}
