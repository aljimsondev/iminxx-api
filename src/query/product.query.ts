export const GET_PRODUCT_BUNDLE_DETAILS_QUERY = `query GetProductBundleDetails($identifier: ProductIdentifierInput!) {
    productByIdentifier(identifier: $identifier) {
      id
      title
      productType
      category {
        name
      }
      bundleComponents(first:10) {
        nodes {
          componentProduct {
            category {
              name
            }
            productType
            title
          }
          optionSelections {
            values {
              value
            }
          }
        }
      }
    }
  }`;

export const GET_PRODUCTS_BY_SKU_QUERY = `query GetProductsBySKU($query: String!) {
  products(first: 10, query: $query) {
    nodes {
      id
      title
      category
      productType
    }
  }
}`;
