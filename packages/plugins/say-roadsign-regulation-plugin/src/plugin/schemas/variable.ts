import { z } from 'zod';

const BaseVariableSchema = z.object({
  uri: z.string(),
  label: z.string(),
  source: z.string(),
});
export const TextVariableSchema = BaseVariableSchema.extend({
  type: z.literal('text'),
  defaultValue: z.string().optional(),
});

export const NumberVariableSchema = BaseVariableSchema.extend({
  type: z.literal('number'),
  defaultValue: z.number({ coerce: true }).optional(),
});

export const DateVariableSchema = BaseVariableSchema.extend({
  type: z.literal('date'),
  defaultValue: z.date({ coerce: true }).optional(),
});

export const CodelistVariableSchema = BaseVariableSchema.extend({
  type: z.literal('codelist'),
  defaultValue: z.string().optional(),
  defaultValueLabel: z.string().optional(),
  codelistUri: z.string(),
});

export const LocationVariableSchema = BaseVariableSchema.extend({
  type: z.literal('location'),
  defaultValue: z.string().optional(),
});

export const InstructionVariableSchema = BaseVariableSchema.extend({
  type: z.literal('instruction'),
});

export const VariableSchema = z.discriminatedUnion('type', [
  TextVariableSchema,
  NumberVariableSchema,
  DateVariableSchema,
  CodelistVariableSchema,
  LocationVariableSchema,
  InstructionVariableSchema,
]);

export type Variable = z.infer<typeof VariableSchema>;
