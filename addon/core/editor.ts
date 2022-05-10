import State from '@lblod/ember-rdfa-editor/core/state';

export default interface Editor {
  state: State;
  domRoot: HTMLElement;
}
