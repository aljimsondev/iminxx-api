import axios from 'axios';
import { GET_PRODUCT_BUNDLE_DETAILS_QUERY } from '../query/product.query';
import ProductRepository from '../repository/product.repository';
import { constructShopUrl } from '../utils/construct-shop-url';
const productRepo = new ProductRepository();
export const getDetails = async (payload: { product_id: string }) => {
  if (!payload.product_id) throw new Error('Product handle is missing!');

  const response = await axios.post(
    constructShopUrl(),
    {
      query: GET_PRODUCT_BUNDLE_DETAILS_QUERY,
      variables: {
        identifier: {
          id: `gid://shopify/Product/${payload.product_id}`,
        },
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

  const parsedData = productRepo.constructProductBundleDetails(data.data);

  return {
    data: parsedData,
    success: true,
  };
};
