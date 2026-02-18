import type { NodeSpec } from 'prosemirror-model';
import { paragraphWithConfig } from './paragraphWithConfig.ts';

export const paragraph: NodeSpec = paragraphWithConfig({ subType: '' });
