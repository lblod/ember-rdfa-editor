import ModelNode, {
  ModelNodeType,
  NodeConfig,
} from '@lblod/ember-rdfa-editor/model/model-node';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import { stringToVisibleText } from '@lblod/ember-rdfa-editor/editor/utils';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';
import {Mark} from "@lblod/ember-rdfa-editor/model/mark";

const NON_BREAKING_SPACE = '\u00A0';
export type TextAttribute =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'highlighted';
export const TEXT_ATTRIBUTES: TextAttribute[] = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'highlighted',
];

export default class ModelText extends ModelNode {
  modelNodeType: ModelNodeType = 'TEXT';
  private _content: string;
  private marks: Mark[];

  constructor(content = '', config?: NodeConfig) {
    super(config);
    this._content = content;
  }

  get content(): string {
    return this._content;
  }

  set content(value: string) {
    this._content = value;
  }

  get length() {
    return this._content.length;
  }

  get isBlock() {
    return false;
  }

  get offsetSize() {
    return this.length;
  }

  getTextAttribute(key: TextAttribute): boolean {
    return this.attributeMap.get(key) === 'true';
  }

  getTextAttributes(): Array<[TextAttribute, boolean]> {
    const rslt: Array<[TextAttribute, boolean]> = [];
    for (const textAttribute of TEXT_ATTRIBUTES) {
      rslt.push([textAttribute, this.getTextAttribute(textAttribute)]);
    }
    return rslt;
  }

  setTextAttribute(key: TextAttribute, value: boolean) {
    this.attributeMap.set(key, String(value));
  }

  toggleTextAttribute(key: TextAttribute) {
    this.setTextAttribute(key, !this.getTextAttribute(key));
  }

  insertTextNodeAt(index: number): ModelText {
    const { right } = this.split(index);
    return right.split(0).left;
  }

  clone(): ModelText {
    const result = new ModelText();
    result.attributeMap = new Map<string, string>(this.attributeMap);
    result.modelNodeType = this.modelNodeType;
    result.content = this.content;

    return result;
  }

  /**
   * Split this textNode at the index, returning both sides of the split.
   * Mostly for internal use, prefer using {@link ModelPosition.split} where
   * possible.
   * @param index
   */
  split(index: number): { left: ModelText; right: ModelText } {
    let leftContent = this.content.substring(0, index);
    if (leftContent.endsWith(' ')) {
      leftContent =
        leftContent.substring(0, leftContent.length - 1) + NON_BREAKING_SPACE;
    }
    let rightContent = this.content.substring(index);
    if (rightContent.startsWith(' ')) {
      rightContent = NON_BREAKING_SPACE + rightContent.substring(1);
    }
    this.content = leftContent;
    const right = this.clone();
    right.content = rightContent;

    if (!this.parent) {
      throw new ModelError('splitting a node without a parent');
    }

    const childIndex = this.parent.children.indexOf(this);

    this.parent?.addChild(right, childIndex + 1);

    return { left: this, right };
  }

  hasVisibleText(): boolean {
    return stringToVisibleText(this.content).length > 0;
  }

  sameAs(other: ModelNode, strict = false): boolean {
    if (!ModelNode.isModelText(other)) {
      return false;
    }
    if (this.content !== other.content) {
      return false;
    }
    if (strict) {
      return ModelNodeUtils.areAttributeMapsSame(
        this.attributeMap,
        other.attributeMap,
        new Set()
      );
    } else {
      return ModelNodeUtils.areAttributeMapsSame(
        this.attributeMap,
        other.attributeMap
      );
    }
  }

  isMergeable(other: ModelNode): boolean {
    if (!ModelNode.isModelText(other)) {
      return false;
    }
    return ModelNodeUtils.areAttributeMapsSame(
      this.attributeMap,
      other.attributeMap
    );
  }

  get firstChild(): ModelNode | null {
    return null;
  }

  get lastChild(): ModelNode | null {
    return null;
  }
}
