import { SUPPORTED_COUNTRIES } from '../constants/countries';
import { Discount } from '../types/discount';
import { currencyFormatter } from '../utils/amount-formatter';

/**
 * DiscountRepository handles formatting and constructing discount details
 * from Shopify API responses based on discount type.
 */
export default class DiscountRepository {
  /**
   * Routes discount objects to appropriate formatter based on typename
   * @param {Discount} discount - The discount object from Shopify API
   * @returns {Object|null} Formatted discount details or null if type not supported
   * @example
   * const details = discountRepo.getFullDetailsByType(discount);
   */
  getFullDetailsByType(discount: Discount) {
    switch (discount.__typename) {
      case 'DiscountCodeBasic':
        return this.constructBasicDiscountDetails(discount);
      case 'DiscountAutomaticBasic':
        return this.constructBasicDiscountDetails(discount);
      case 'DiscountAutomaticBxgy':
        return this.constructPromoAutoBxgyDetails(discount);
      case 'DiscountCodeFreeShipping':
        return this.constructFreeShippingPromoDetails(discount);
      default:
        return null;
    }
  }

  /**
   * Formats a date to 'MMM D' format (e.g., "Jan 15")
   * @param {Date} date - The date to format
   * @returns {string} Formatted date string
   * @throws {Error} If date is not a valid Date instance
   * @example
   * const formatted = formatDateDetails(new Date('2024-01-15'));
   * // Returns: "Jan 15"
   */
  formatDateDetails(date: Date) {
    if (!(date instanceof Date)) throw new Error('Invalid date!');

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Constructs a human-readable string describing which discount types this discount can combine with
   * @param {Discount} discount - The discount object
   * @returns {string} Combination summary (e.g., "Combines with order and product discounts")
   * @example
   * const combo = constructCombination(discount);
   * // Returns: "Combines with order and product discounts"
   */
  constructCombination(discount: Discount) {
    const combination = [];

    if (discount.combinesWith?.orderDiscounts) combination.push('order');
    if (discount.combinesWith?.productDiscounts) combination.push('product');
    if (discount.combinesWith?.shippingDiscounts) combination.push('shipping');

    if (combination.length <= 0) return 'Can’t combine with other discounts';

    let combinationSummary = 'Combines with';

    const lastIndex = combination.length - 1;

    combination.forEach((_combi, index) => {
      if (index !== combination.length - 1) {
        if (lastIndex >= 1 && index !== lastIndex - 1) {
          combinationSummary += ` ${_combi},`;
        } else {
          combinationSummary += ` ${_combi}`;
        }
      } else {
        if (index >= 1) {
          combinationSummary += ` and ${_combi}`;
        } else {
          combinationSummary += ` ${_combi}`;
        }
      }
    });

    return (combinationSummary += ' discounts');
  }

  /**
   * Constructs a human-readable minimum purchase requirement string
   * @param {Discount} discount - The discount object
   * @returns {string} Minimum requirement description
   * @example
   * // Returns: "Minimum purchase of $50.00"
   * // or: "Minimum quantity of 5"
   * // or: "No minimum purchase requirement"
   */
  constructMinRequirement(discount: Discount) {
    let minimumRequirement = 'No minimum purchase requirement';

    if (discount.minimumRequirement?.greaterThanOrEqualToQuantity) {
      minimumRequirement = `Minimum quantity of ${discount.minimumRequirement.greaterThanOrEqualToQuantity}`;
    } else if (
      discount.minimumRequirement?.greaterThanOrEqualToSubtotal?.amount
    ) {
      const formattedAmount = currencyFormatter(
        parseFloat(
          discount.minimumRequirement.greaterThanOrEqualToSubtotal.amount,
        ),
      );

      minimumRequirement = `Minimum purchase of ${formattedAmount}`;
    }

    return minimumRequirement;
  }

  /**
   * Constructs a human-readable usage limit string
   * @param {Discount} discount - The discount object
   * @returns {string} Usage limit description (empty string if no limit)
   * @example
   * // Returns: "Limit of 100 uses, one per customer"
   * // or: "One use per customer"
   * // or: ""
   */
  constructUsageLimit(discount: Discount) {
    let usage = '';
    if (discount?.usageLimit) {
      const useTense = discount.usageLimit > 1 ? 'uses' : 'use';

      usage = `Limit of ${discount?.usageLimit} ${useTense}`;
    }

    if (discount?.appliesOncePerCustomer) {
      if (discount?.usageLimit) usage += ', one per customer';
      else usage += 'One use per customer';
    }

    return usage;
  }

  /**
   * Constructs a human-readable promotion period string
   * @param {Discount} discount - The discount object
   * @returns {string} Promotion period (e.g., "Promotion runs from Jan 15 to Jan 31")
   * @example
   * // Returns: "Promotion runs from Jan 15 to Jan 31"
   * // or: "Promotion runs from Jan 15"
   */
  constructPromoPeriod(discount: Discount) {
    const startDate = new Date(discount.startsAt);
    const endDate = discount.endsAt;
    let promoPeriod = `Promotion runs from ${this.formatDateDetails(
      startDate,
    )}`;

    if (endDate) {
      promoPeriod += ` to ${this.formatDateDetails(new Date(endDate))}`;
    }
    return promoPeriod;
  }

  /**
   * Constructs a human-readable shipping destination string
   * @param {Discount} discount - The discount object
   * @returns {string|undefined} Destination description
   * @example
   * // Returns: "For all countries"
   * // or: "For United States"
   * // or: "For 50 countries"
   */
  constructShippingDestination(discount: Discount) {
    let dest;
    if (discount?.destinationSelection?.allCountries) {
      dest = 'For all countries';
    } else if (discount?.destinationSelection?.countries) {
      const countryCount = discount.destinationSelection.countries.length;
      if (countryCount <= 0) {
        // for the rest of the world is selected
        dest = 'For the rest of the world';
      } else {
        const haveManyCountries = countryCount > 1;

        if (haveManyCountries) {
          dest = `For ${countryCount} countries`;
        } else {
          const countryCode = discount.destinationSelection.countries[0];
          if (!countryCode) throw new Error('Unable to get country code');

          const country =
            SUPPORTED_COUNTRIES[
              countryCode as keyof typeof SUPPORTED_COUNTRIES
            ];
          dest = `For ${country}`;
        }
      }
    }

    return dest;
  }

  /**
   * Constructs formatted details for basic discount types (code and automatic)
   * @param {Discount} discount - The discount object
   * @returns {Object} Formatted discount details with summary, customers, period, combination, title, requirements, and usage
   * @private
   */
  constructBasicDiscountDetails(discount: Discount) {
    const summary = discount.summary.split('•')[0];
    const targetCustomers = discount?.context?.customers || [];

    let data = {
      summary: summary,
      target_customers:
        targetCustomers.length > 0
          ? 'Applies to specific customers!'
          : 'Applies to all customers',
      promo_period: this.constructPromoPeriod(discount),
      discount_combination: this.constructCombination(discount),
      title: discount.title,
      minimum_requirement: this.constructMinRequirement(discount),
      usage_limit: this.constructUsageLimit(discount),
    };

    return data;
  }

  /**
   * Constructs formatted details for Buy X Get Y (BXGY) automatic discount
   * @param {Discount} discount - The discount object
   * @returns {Object} Formatted BXGY discount details
   * @private
   */
  constructPromoAutoBxgyDetails(discount: Discount) {
    const summary = discount.summary.split('•')[0];
    const targetCustomers = discount?.context?.customers || [];
    const usesPerOrderLimit = discount.usesPerOrderLimit;

    let data = {
      summary: summary,
      target_customers:
        targetCustomers.length > 0
          ? 'Applies to specific customers!'
          : 'Applies to all customers',
      promo_period: this.constructPromoPeriod(discount),
      discount_combination: this.constructCombination(discount),
      title: discount.title,
    } as any;

    if (usesPerOrderLimit) {
      data.usage_limit = `${usesPerOrderLimit} use per order`;
    }

    return data;
  }

  /**
   * Constructs formatted details for free shipping discount
   * @param {Discount} discount - The discount object
   * @returns {Object} Formatted free shipping discount details including destination
   * @private
   */
  constructFreeShippingPromoDetails(discount: Discount) {
    const summary = discount.summary.split('•')[0];
    const targetCustomers = discount?.context?.customers || [];

    let data = {
      summary: summary,
      target_customers:
        targetCustomers.length > 0
          ? 'Applies to specific customers!'
          : 'Applies to all customers',
      promo_period: this.constructPromoPeriod(discount),
      discount_combination: this.constructCombination(discount),
      title: discount.title,
      minimum_requirement: this.constructMinRequirement(discount),
      usage_limit: this.constructUsageLimit(discount),
      destination: this.constructShippingDestination(discount),
    };

    return data;
  }
}
