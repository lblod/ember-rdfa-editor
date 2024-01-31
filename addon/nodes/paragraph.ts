import type { NodeSpec } from 'prosemirror-model';
import { paragraphWithConfig } from './paragraphWithConfig';

export const paragraph: NodeSpec = paragraphWithConfig({ subType: '' });
