module.exports = function constructShopUrl() {
  const gqlVersion = process.env.API_VERSION;
  const shopName = process.env.SHOP_NAME;

  return `https://${shopName}.myshopify.com/admin/api/${gqlVersion}/graphql.json`;
};
