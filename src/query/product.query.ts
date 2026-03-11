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
  products(first: 50, query: $query) {
    nodes {
      id
      title
      category {
        name
        id
      }
      productType
    }
  }
}`;

export const GET_PRODUCTS_BY_QUERY = `query GetProductsByQuery($query: String!, $afterCursor: String) {
  products(first: 50, query: $query, after: $afterCursor) {
    nodes {
      id
      title
      category {
        name
        id
      }
      productType
    }
    pageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
    }
  }
}`;

export const GET_METAFIELD_QUERY = `
  query ProductMetafield($ownerId: ID!, $namespace: String!, $key: String!) {
    product(id: $ownerId) {
      metafield(namespace: $namespace, key: $key) {
        namespace
        key
        value
        type
      }
    }
  }
`;
