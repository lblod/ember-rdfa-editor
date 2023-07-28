import { NodeSpec } from 'prosemirror-model';
import { paragraph } from './paragraph';

interface paragraphConfig {
  content?: string;
  marks?: string;
  group?: string;
}

export const paragraphWithConfig: (config?: paragraphConfig) => NodeSpec = ({
  content = paragraph.content,
  marks = paragraph.marks,
  group = paragraph.group,
} = {}) => {
  return { ...paragraph, content: content, marks: marks, group: group };
};
