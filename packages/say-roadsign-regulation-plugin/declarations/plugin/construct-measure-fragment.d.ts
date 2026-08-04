import { Schema } from '@lblod/ember-rdfa-editor';
import { type IncomingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { type VariableInstance } from './schemas/variable-instance.ts';
export declare function constructMeasureFragment(templateString: string, variables: Record<string, VariableInstance>, schema: Schema, backlinks?: IncomingTriple[]): import("prosemirror-model").Node[];
