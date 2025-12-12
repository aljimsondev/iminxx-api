const discountService = require('../service/discount.service');

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

    res.json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error('getDiscountDetails Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || err,
    });
  }
};
