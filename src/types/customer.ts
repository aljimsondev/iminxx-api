import z from 'zod';

const metafieldInputSchema = z.object({
  id: z.string(),
  key: z.string(),
  namespace: z.string(),
  type: z.string(),
  value: z.string(),
});

export type MetafieldInput = z.infer<typeof metafieldInputSchema>;

/**
 * THis is for extra validation before updating the customer data
 */
export const updateCustomerSchema = z.object({
  firstName: z.string(),
  id: z.string(),
  lastName: z.string(),
  note: z.string(),
  phone: z.string(),
  email: z.email(),
  locale: z.string(),
  metafields: metafieldInputSchema.partial(),
  // add other field here if needed
});

export type UpdateCustomerData = z.infer<typeof updateCustomerSchema>;
