import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { paintCycleHappened } from '@lblod/ember-rdfa-editor/editor/utils';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';

interface Args {
  editor: RawEditor;
}

export default class ToolbarDropdown extends Component<Args> {
  // Create a dropdown ID
  dropdownId = 'dropdown-' + guidFor(this);

  // Track dropdown state
  @tracked dropdownOpen = false;

  @action
  openDropdown() {
    this.dropdownOpen = true;
  }

  @action
  async closeDropdown(event: Event) {
    if (event) {
      event.preventDefault();
    }
    this.dropdownOpen = false;
    // It seems impossible to manage the focus correctly synchronously
    // some kind of focus event always seems to happen at the wrong time
    // so this is a bit of hack, but it works well.
    await paintCycleHappened();
    const { lastRange } = this.args.editor.selection;
    if (lastRange) {
      this.args.editor.rootNode.focus();
    }
    this.args.editor.model.writeSelection();
    return true;
  }
}
