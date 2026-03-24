import z from 'zod';

// Strong password requirements
export const passwordSchema = z
  .string()
  .min(1, 'Password is required!')
  .min(8, 'Password must be at least 8 characters')
  .max(32, 'Password must be less than 32 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character',
  );

// Security validation helpers
const sanitizeString = (value: string) => {
  // Remove leading/trailing whitespace
  const trimmed = value.trim();

  // Check for common XSS patterns
  const xssPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    /<embed[^>]*>/gi,
    /<object[^>]*>[\s\S]*?<\/object>/gi,
    /eval\(/gi,
    /expression\s*\(/gi,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(trimmed)) {
      return null;
    }
  }

  return trimmed;
};

const checkSQLInjection = (value: string) => {
  // Check for common SQL injection patterns
  const sqlPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT)\b)/gi,
    /(-{2}|\/\*|\*\/|;|xp_|sp_)/gi,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi,
    /(--|#|\/\*|\*\/)/,
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(value)) {
      return false;
    }
  }

  return true;
};

// Base string validation with security checks
const secureString = z
  .string()
  .min(1, 'Field cannot be empty')
  .max(500, 'Field exceeds maximum length')
  .trim()
  .refine(
    (val) => sanitizeString(val) !== null,
    'Contains potentially malicious content (XSS detected)',
  )
  .refine(
    (val) => checkSQLInjection(val),
    'Contains potentially malicious content (SQL injection detected)',
  );

// Name validation - letters, spaces, hyphens, apostrophes only
const nameString = secureString
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')
  .regex(
    /^[a-zA-Z\s\-']*$/,
    'Name can only contain letters, spaces, hyphens, and apostrophes',
  );

// Email validation
const secureEmail = z
  .string()
  .min(1, 'Email is required')
  .max(255, 'Email must not exceed 255 characters')
  .email('Invalid email format')
  .toLowerCase()
  .refine(
    (val) => checkSQLInjection(val),
    'Email contains potentially malicious content',
  );

export const emailSchema = secureEmail;

// Date validation - ISO 8601 format (YYYY-MM-DD)
const birthdayString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Birthday must be in YYYY-MM-DD format')
  .refine((val) => {
    const date = new Date(val + 'T00:00:00Z');
    return !isNaN(date.getTime());
  }, 'Invalid date')
  .refine((val) => {
    const birthDate = new Date(val + 'T00:00:00Z');
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1 >= 13; // Minimum age 13 (COPPA compliance)
    }

    return age >= 13;
  }, 'User must be at least 13 years old')
  .refine((val) => {
    const birthDate = new Date(val + 'T00:00:00Z');
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    return age <= 120; // Reasonable maximum age
  }, 'Invalid date of birth');

export const newCustomerSchema = z.object({
  firstName: nameString.describe('Customer first name'),
  lastName: nameString.describe('Customer last name'),
  email: secureEmail.describe('Customer email address'),
  password: z.any(), // Already handled by passwordSchema
  birthday: birthdayString.describe('Date of birth in YYYY-MM-DD format'),
  acceptsMarketing: z.boolean().default(false).describe('Marketing opt-in'),
});

export type NewCustomer = z.infer<typeof newCustomerSchema>;

const metafieldInputSchema = z.object({
  id: z.string(),
  key: z.string(),
  namespace: z.string(),
  type: z.string(),
  value: z.string(),
});

export type MetafieldInput = z.infer<typeof metafieldInputSchema>;

export const addressSchema = z.object({
  address1: z.string(),
  address2: z.string(),
  city: z.string(),
  company: z.string(),
  countryCode: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  provinceCode: z.string(),
  zip: z.string(),
  country: z.string(),
  province: z.string(),
  asDefault: z.boolean().default(false),
});

export type Address = z.infer<typeof addressSchema>;

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

export const wishlistItemSchema = z.string().min(5).max(20);

export const wishlistItemsSchema = z.array(wishlistItemSchema);

export type WishlistItem = z.infer<typeof wishlistItemSchema>;
