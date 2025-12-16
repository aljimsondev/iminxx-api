const discountService = require('../service/discount.service');
const DiscountRepository = require('../repository/discount.repository');

const discountRepo = new DiscountRepository();

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
    console.log(discount);

    const details = discountRepo.getFullDetailsByType(discount);

    res.json({
      success: true,
      data: details,
    });
  } catch (err) {
    console.error('getDiscountDetails Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || err,
    });
  }
};
