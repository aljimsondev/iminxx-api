import axios from 'axios';
import { GET_DISCOUNT_DETAILS_QUERY } from '../query/discount.query';
import { constructShopUrl } from '../utils/construct-shop-url';

export const fetchDiscount = async (payload: any) => {
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
