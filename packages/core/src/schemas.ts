import { z } from 'zod';

const TRANSFORMATION_VALUES = ['P', 'IN', 'CO', 'DE', 'RE', 'SY'] as const;

export const ModelFilterSchema = z.object({
  transformation: z.enum(TRANSFORMATION_VALUES).optional(),
  base_level: z.coerce.number().int().min(1).max(5).optional(),
  search: z.string().trim().min(2, 'Search requires at least 2 characters').optional(),
});

export type ModelFilter = z.infer<typeof ModelFilterSchema>;

export const ModelCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^[A-Z]{1,2}\d{1,2}$/, 'Code must be like P1 or SY12'),
});

export const TransformationParamSchema = z.object({
  transformation: z.enum(TRANSFORMATION_VALUES),
});
