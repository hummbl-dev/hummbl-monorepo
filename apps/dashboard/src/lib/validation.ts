import { z } from 'zod';

export const ReasonSchema = z
  .string()
  .min(1, 'Reason is required')
  .max(500, 'Reason too long (max 500 chars)')
  .transform((val) => val.replace(/[<>"'&\x00-\x1f]/g, '')); // Sanitize

export const IncidentIdSchema = z
  .string()
  .min(1, 'Incident ID is required')
  .regex(/^[A-Z]{2,5}-\d{1,6}$/i, 'Invalid incident ID format (e.g., INC-001)')
  .transform((val) => val.toUpperCase());

export const ActionSchema = z.enum([
  'read',
  'commit',
  'push',
  'deploy',
  'delete',
  'schema_change',
  'approve',
  'execute',
]);

export type Action = z.infer<typeof ActionSchema>;

export function validateReason(reason: string): string {
  return ReasonSchema.parse(reason);
}

export function validateIncidentId(id: string): string {
  return IncidentIdSchema.parse(id);
}

export function validateAction(action: string): Action {
  return ActionSchema.parse(action);
}
