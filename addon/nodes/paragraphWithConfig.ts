import { NodeSpec } from 'prosemirror-model';
import { paragraph } from './paragraph';

interface paragraphConfig {
  content?: string;
  marks?: string;
}

export const paragraphWithConfig: (config?: paragraphConfig) => NodeSpec = ({
  content = paragraph.content,
  marks = paragraph.marks,
} = {}) => {
  return { ...paragraph, content: content, marks: marks };
};
