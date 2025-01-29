import { wrappingInputRule } from 'prosemirror-inputrules';
import { NodeType } from 'prosemirror-model';

export const bullet_list_input_rule = (type: NodeType) =>
  wrappingInputRule(/^\s*([-*])\s$/, type);

export const ordered_list_input_rule = (type: NodeType) =>
  wrappingInputRule(/^\s*(1.)\s$/, type);
