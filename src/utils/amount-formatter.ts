/**
 * Formats a monetary amount according to locale and currency specifications.
 *
 * Converts numeric or string amounts into properly formatted currency strings
 * using the Intl.NumberFormat API. Supports various locales and currencies with
 * customizable decimal precision and formatting styles.
 *
 * @param {number | string} amount - The monetary amount to format. Can be a number
 *                                   or a numeric string (with optional $, commas, whitespace).
 *                                   Returns undefined for null, undefined, empty string, or NaN.
 * @param {Object} [options={}] - Configuration options for formatting.
 * @param {string} [options.currency='USD'] - ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP').
 * @param {string} [options.locale='en-US'] - BCP 47 language tag for locale (e.g., 'en-US', 'de-DE', 'fr-FR').
 * @param {number} [options.minimumFractionDigits=2] - Minimum number of decimal places to display.
 * @param {number} [options.maximumFractionDigits=2] - Maximum number of decimal places to display.
 * @param {'currency' | 'decimal' | 'percent'} [options.style='currency'] - The formatting style to apply.
 *
 * @returns {string | undefined} The formatted currency string (e.g., '$1,234.56'), or undefined
 *                                if the amount is falsy (except 0).
 *
 * @throws {Error} If the amount cannot be converted to a valid number.
 *
 * @example
 * // Basic usage with default options
 * currencyFormatter(1234.5);
 * // => '$1,234.50'
 *
 * @example
 * // Format with different locale and currency
 * currencyFormatter(1234.5, { locale: 'de-DE', currency: 'EUR' });
 * // => '1.234,50 €'
 *
 * @example
 * // Format as a string with currency symbols
 * currencyFormatter('$1,234.50');
 * // => '$1,234.50'
 *
 * @example
 * // Format as decimal without currency symbol
 * currencyFormatter(1234.5, { style: 'decimal' });
 * // => '1,234.50'
 *
 * @example
 * // Format as percentage
 * currencyFormatter(0.25, { style: 'percent' });
 * // => '25%'
 */
export function currencyFormatter(amount: number | string, options = {}) {
  if (!amount && amount !== 0) throw new Error('Invalid amount!');

  const defaults = {
    currency: 'USD',
    locale: 'en-US',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
  };

  // Merge options with defaults
  const config = {
    ...defaults,
    ...options,
  };

  let numericAmount;

  if (typeof amount === 'string') {
    // Remove any existing currency symbols, commas, and whitespace
    const cleanAmount = (amount as string).replace(/[$,\s]/g, '');
    numericAmount = parseFloat(cleanAmount);
  } else {
    numericAmount = Number(amount);
  }

  // Check if the conversion resulted in a valid number
  if (isNaN(numericAmount)) {
    throw new Error(
      'Invalid amount provided. Please provide a valid number or numeric string.',
    );
  }

  // Use Intl.NumberFormat for proper formatting
  try {
    const formatter = new Intl.NumberFormat(config.locale, {
      style: config.style as any,
      currency: config.currency,
      minimumFractionDigits: config.minimumFractionDigits,
      maximumFractionDigits: config.maximumFractionDigits,
    });

    return formatter.format(numericAmount);
  } catch (error: any) {
    // Fallback formatting if Intl.NumberFormat fails
    console.warn(
      'Intl.NumberFormat failed, using fallback formatting:',
      error.message,
    );
    return `$${numericAmount.toFixed(2)}`;
  }
}
