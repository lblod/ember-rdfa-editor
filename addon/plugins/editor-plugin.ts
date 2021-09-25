import {Controller} from "@lblod/ember-rdfa-editor/model/controller";

export interface EditorPlugin {
  initialize(controller: Controller): void;
}
