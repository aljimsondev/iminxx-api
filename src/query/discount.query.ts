// GraphQL Query for getting discount details
export const GET_DISCOUNT_DETAILS_QUERY = `
  query GetDiscount($query: String!) {
    discountNodes(first: 100, query: $query) {
      nodes {
        id
        discount {
          __typename
          ... on DiscountCodeBasic {
            title
            summary
            status
            startsAt
            endsAt
            appliesOncePerCustomer
            usageLimit
            minimumRequirement {
              ... on DiscountMinimumQuantity {
                greaterThanOrEqualToQuantity
              }
              ... on DiscountMinimumSubtotal {
                greaterThanOrEqualToSubtotal {
                  amount
                  currencyCode
                }
              }
            }
            customerGets {
              value {
                ... on DiscountPercentage {
                  percentage
                }
                ... on DiscountAmount {
                  amount {
                    amount
                    currencyCode
                  }
                }
              }
            }
            context {
              ... on DiscountCustomers {
                customers {
                  id
                }
              }
              ... on DiscountCustomerSegments {
                segments {
                  id
                  name
                }
              }
            }
            combinesWith {
              orderDiscounts
              productDiscounts
              shippingDiscounts
            }
          }
          ... on DiscountAutomaticBasic {
            title
            summary
            status
            startsAt
            endsAt
            minimumRequirement {
              ... on DiscountMinimumQuantity {
                greaterThanOrEqualToQuantity
              }
              ... on DiscountMinimumSubtotal {
                greaterThanOrEqualToSubtotal {
                  amount
                  currencyCode
                }
              }
            }
            customerGets {
              value {
                ... on DiscountPercentage {
                  percentage
                }
                ... on DiscountAmount {
                  amount {
                    amount
                    currencyCode
                  }
                }
              }
            }
            context {
              ... on DiscountCustomers {
                customers {
                  id
                }
              }
              ... on DiscountCustomerSegments {
                segments {
                  id
                  name
                }
              }
            }
            combinesWith {
              orderDiscounts
              productDiscounts
              shippingDiscounts
            }
          }
          ... on DiscountCodeBxgy {
            title
            summary
            status
            startsAt
            endsAt
            codes(first: 10) {
              nodes {
                code
              }
            }
          }
          ... on DiscountAutomaticBxgy {
            title
            summary
            status
            startsAt
            endsAt
            usesPerOrderLimit
            combinesWith{
              orderDiscounts
              productDiscounts
              shippingDiscounts
            }
            context {
              ... on DiscountCustomers {
                customers {
                  id
                }
              }
              ... on DiscountCustomerSegments {
                segments {
                  id
                  name
                }
              }
            }
          customerBuys {
            isOneTimePurchase
            isSubscription
            value {
             ... on DiscountPurchaseAmount {
                amount
                }
              ... on DiscountQuantity {
                quantity
              }   
            }
            items {
              ... on AllDiscountItems {
                allItems
              }
              ... on DiscountCollections {
                collections(first:20){
                  nodes {
                    productsCount {
                      count
                    }
                  }
                }
              }
              ... on DiscountProducts {
                products(first:20){
                  edges {
                    node {
                      title
                      hasOnlyDefaultVariant
                      description
                      featuredMedia {
                        preview {
                          image {
                            url
                            width
                            height
                            altText
                          }
                        }
                      }
                      isGiftCard
                      productType
                      variantsCount {
                        count
                      }
                    }
                  }
                }
              }
            }
          }
          customerGets {
              items {
                ... on AllDiscountItems {
                  allItems
                }
                ... on DiscountCollections {
                  collections(first:20) {
                    nodes {
                      productsCount {
                        count
                      }
                    }
                  }
                }
                ... on DiscountProducts {
                  products(first:10) {
                    edges {
                      node {
                        title
                        hasOnlyDefaultVariant
                        description
                        featuredMedia {
                          preview {
                            image {
                              url
                              width
                              height
                              altText
                            }
                          }
                        }
                        isGiftCard
                        productType
                        variantsCount {
                          count
                        }
                      }
                    }
                  }
                }
              }
              value {
                ... on DiscountPercentage {
                  percentage
                }
                ... on DiscountAmount {
                  amount {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
          ... on DiscountCodeFreeShipping {
            title
            summary
            status
            startsAt
            endsAt
            appliesOncePerCustomer
            usageLimit
            codes(first: 10) {
              nodes {
                code
              }
            }
            destinationSelection {
              ... on DiscountCountries {
                countries
              }

              ... on DiscountCountryAll {
                allCountries
              }
            }
            minimumRequirement {
              ... on DiscountMinimumQuantity {
                greaterThanOrEqualToQuantity
              }
              ... on DiscountMinimumSubtotal {
                greaterThanOrEqualToSubtotal {
                  amount
                  currencyCode
                }
              }
            }
            context {
              ... on DiscountCustomers {
                customers {
                  id
                }
              }
              ... on DiscountCustomerSegments {
                segments {
                  id
                  name
                }
              }
            }
            combinesWith {
              orderDiscounts
              productDiscounts
            }
          }
          ... on DiscountAutomaticFreeShipping {
            title
            summary
            status
            startsAt
            endsAt
            destinationSelection {
              ... on DiscountCountries {
                countries
              }

              ... on DiscountCountryAll {
                allCountries
              }
            }
            minimumRequirement {
              ... on DiscountMinimumQuantity {
                greaterThanOrEqualToQuantity
              }
              ... on DiscountMinimumSubtotal {
                greaterThanOrEqualToSubtotal {
                  amount
                  currencyCode
                }
              }
            }
            context {
              ... on DiscountCustomers {
                customers {
                  id
                }
              }
              ... on DiscountCustomerSegments {
                segments {
                  id
                  name
                }
              }
            }
            combinesWith {
              orderDiscounts
              productDiscounts
            }
          }
        }
      }
    }
  }
`;
