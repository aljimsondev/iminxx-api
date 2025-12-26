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
        }
      }
    }
  }`;
