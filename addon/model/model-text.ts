import ModelNode, {
  ModelNodeType,
  NodeConfig,
} from '@lblod/ember-rdfa-editor/model/model-node';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import { stringToVisibleText } from '@lblod/ember-rdfa-editor/editor/utils';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';
import { Mark, MarkSet } from '@lblod/ember-rdfa-editor/model/mark';

const NON_BREAKING_SPACE = '\u00A0';

export default class ModelText extends ModelNode {
  modelNodeType: ModelNodeType = 'TEXT';
  private _content: string;
  private _marks: MarkSet = new MarkSet();

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

  get marks(): MarkSet {
    return this._marks;
  }

  set marks(value: MarkSet) {
    this._marks = value;
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

  hasMarkName(markName: string): boolean {
    return this.marks.hasMarkName(markName);
  }

  hasMark(mark: Mark): boolean {
    return this.marks.hasItemRef(mark);
  }

  addMark(mark: Mark) {
    this.marks.add(mark);
  }

  removeMarkByName(markName: string) {
    this.marks.deleteHash(markName);
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
    result.marks = this.marks.clone();

    return result;
  }

  /**
   * Split this textNode at the index, returning both sides of the split.
   * Mostly for internal use, prefer using {@link ModelPosition.split} where
   * possible.
   * @param index
   */
  split(
    index: number,
    keepRight = false
  ): {
    left: ModelText;
    right: ModelText;
  } {
    let leftContent = this.content.substring(0, index);
    if (leftContent.endsWith(' ')) {
      leftContent =
        leftContent.substring(0, leftContent.length - 1) + NON_BREAKING_SPACE;
    }
    let rightContent = this.content.substring(index);
    if (rightContent.startsWith(' ')) {
      rightContent = NON_BREAKING_SPACE + rightContent.substring(1);
    }
    if (keepRight) {
      this.content = rightContent;
      const left = this.clone();
      left.content = leftContent;
      if (!this.parent) {
        throw new ModelError('splitting a node without a parent');
      }

      const childIndex = this.parent.children.indexOf(this);

      this.parent.addChild(left, childIndex);

      return { left, right: this };
    } else {
      this.content = leftContent;
      const right = this.clone();
      right.content = rightContent;

      if (!this.parent) {
        throw new ModelError('splitting a node without a parent');
      }

      const childIndex = this.parent.children.indexOf(this);

      this.parent.addChild(right, childIndex + 1);

      return { left: this, right };
    }
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
    if (!this.marks.hasSameHashes(other.marks)) {
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
    return (
      ModelNodeUtils.areAttributeMapsSame(
        this.attributeMap,
        other.attributeMap
      ) && this.marks.hasSameHashes(other.marks)
    );
  }

  get firstChild(): ModelNode | null {
    return null;
  }

  get lastChild(): ModelNode | null {
    return null;
  }
}
