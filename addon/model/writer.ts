import RichElement from "@lblod/ember-rdfa-editor/model/rich-element";

export default interface Writer {
  write: (richElement: RichElement) => HTMLElement;
};
