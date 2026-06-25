import { z } from 'zod';
import {
  CodelistVariableSchema,
  DateVariableSchema,
  LocationVariableSchema,
  NumberVariableSchema,
  TextVariableSchema,
  type Variable,
} from './variable.ts';

const BaseVariableInstanceSchema = z.object({
  uri: z.string(),
  __rdfaId: z.string().optional(),
});

const TextVariableInstanceSchema = BaseVariableInstanceSchema.extend({
  value: z.string().optional(),
  variable: TextVariableSchema,
});

const NumberVariableInstanceSchema = BaseVariableInstanceSchema.extend({
  value: z.number({ coerce: true }).optional(),
  variable: NumberVariableSchema,
});

const DateVariableInstanceSchema = BaseVariableInstanceSchema.extend({
  value: z.date({ coerce: true }).optional(),
  variable: DateVariableSchema,
});

const LocationVariableInstanceSchema = BaseVariableInstanceSchema.extend({
  value: z.string().optional(),
  variable: LocationVariableSchema,
});

const CodelistVariableInstanceSchema = BaseVariableInstanceSchema.extend({
  value: z.string().optional(),
  valueLabel: z.string().optional(),
  variable: CodelistVariableSchema,
});

export const VariableInstanceSchema = z.union([
  TextVariableInstanceSchema,
  NumberVariableInstanceSchema,
  DateVariableInstanceSchema,
  LocationVariableInstanceSchema,
  CodelistVariableInstanceSchema,
]);

export type VariableInstance = z.infer<typeof VariableInstanceSchema>;

export function isVariableInstance(
  variableOrVariableInstance: Variable | VariableInstance,
): variableOrVariableInstance is VariableInstance {
  return 'variable' in variableOrVariableInstance;
}
