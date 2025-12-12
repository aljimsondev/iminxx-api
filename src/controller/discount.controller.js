const discountService = require('../service/discount.service');

exports.getDiscountDetails = async (req, res) => {
  try {
    const data = await discountService.fetchDiscount(req.body);

    res.json({
      success: true,
      rawResponse: data,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || err,
    });
  }
};
