const { SUPPORTED_COUNTRIES } = require('../constants/countries');
const currencyFormatter = require('../utils/amount-formatter');

export default class DiscountRepository {
  getFullDetailsByType(discount: any) {
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

  formatDateDetails(date: Date) {
    if (!(date instanceof Date)) throw new Error('Invalid date!');

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  constructCombination(discount: any) {
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
  constructMinRequirement(discount: any) {
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

  constructUsageLimit(discount: any) {
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

  constructPromoPeriod(discount: any) {
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
  constructShippingDestination(discount: any) {
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

          const country = SUPPORTED_COUNTRIES[countryCode];
          dest = `For ${country}`;
        }
      }
    }

    return dest;
  }
  constructBasicDiscountDetails(discount: any) {
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

  constructPromoAutoBxgyDetails(discount: any) {
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

  constructFreeShippingPromoDetails(discount: any) {
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
