const axios = require('axios');
const { GET_DISCOUNT_DETAILS_QUERY } = require('../query/discount.query');
const constructShopUrl = require('../utils/construct-shop-url');

exports.fetchDiscount = async (payload) => {
  if (!payload.title) throw new Error('Promo title is missing!');

  const response = await axios.post(
    constructShopUrl(),
    {
      query: GET_DISCOUNT_DETAILS_QUERY,
      variables: {
        query: `title:${payload.title}`,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.ADMIN_ACCESS_TOKEN,
      },
    },
  );
  const data = response.data;

  if (data?.errors) {
    return {
      data: null,
      errors: data?.errors,
      success: false,
    };
  }

  return {
    data: data.data.discountNodes.nodes,
    success: true,
  };
};
