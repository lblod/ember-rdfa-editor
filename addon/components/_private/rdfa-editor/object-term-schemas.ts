import { object, string } from 'yup';
export const datatypeSchema = object({
  termType: string<'NamedNode'>().required(),
  value: string().curie({ allowEmpty: true }).default(''),
});
export const literalTermSchema = object({
  termType: string<'Literal'>().required(),
  value: string().required(),
  datatype: datatypeSchema,
  language: string().default(''),
});
export const literalNodeTermSchema = object({
  termType: string().oneOf(['LiteralNode']).required(),
  value: string().required(),
  datatype: datatypeSchema,
  language: string().default(''),
});
export const resourceNodeTermSchema = object({
  termType: string<'ResourceNode'>().required(),
  value: string().curie().required(),
});
export const contentLiteralTermSchema = object({
  termType: string<'ContentLiteral'>().required(),
  datatype: datatypeSchema,
  language: string().default(''),
});
export const namedNodeTermSchema = object({
  termType: string<'NamedNode'>().required(),
  value: string().curie().required(),
});
