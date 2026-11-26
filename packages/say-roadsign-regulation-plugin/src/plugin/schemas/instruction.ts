import { z } from 'zod';

export const InstructionSchema = z.object({
  uri: z.string(),
  value: z.string(),
  preview: z.string(),
});

export type Instruction = z.infer<typeof InstructionSchema>;
