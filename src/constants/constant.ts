import axios from 'axios';

export const SHOPIFY_GRAPHQL = `https://${process.env.SHOP_NAME_FULL}/admin/api/${process.env.API_VERSION}/graphql.json`;
export const SHOPIFY_GRAPHQL_AXIOS = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': process.env.ADMIN_ACCESS_TOKEN,
  },
});
