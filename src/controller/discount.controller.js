const discountService = require('../service/discount.service');

function formatDateDetails(date) {
  if (!(date instanceof Date)) throw new Error('Invalid date!');

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function constructCombination(discount) {
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

function constructPromoDetails(discount) {
  const summary = discount.summary.split('•')[0];
  const targetCustomers = discount?.context?.customers || [];
  const startDate = new Date(discount.startsAt);
  const endDate = discount.endsAt;

  let promoPeriod = `Active from ${formatDateDetails(startDate)}`;

  if (endDate) {
    promoPeriod += ` until ${formatDateDetails(new Date(endDate))}`;
  }

  return {
    summary: summary,
    target_customers:
      targetCustomers.length > 0
        ? 'Applies to specific customers!'
        : 'Applies to all customers',
    promo_period: promoPeriod,
    discount_combination: constructCombination(discount),
  };
}

exports.getDiscountDetails = async (req, res) => {
  try {
    const { data, success, errors } = await discountService.fetchDiscount(
      req.body,
    );

    if (!success)
      return res.status(500).json({
        success: false,
        errors: errors,
      });

    const discount = data[0]?.discount;

    res.json({
      success: true,
      data: constructPromoDetails(discount),
    });
  } catch (err) {
    console.error('getDiscountDetails Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || err,
    });
  }
};
