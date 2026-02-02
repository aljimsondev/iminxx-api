export const UPDATE_CUSTOMER_QUERY = `mutation updateCustomerMetafields($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer {
          updatedAt
        }
        userErrors {
          message
          field
        }
      }
    }`;

export const GET_CUSTOMER_BIRTHDAY = `query getCustomerBirthdate($customerId: ID!){
    customer(id: $customerId) {
      id
      birthday: metafield(namespace: "facts", key: "birth_date") {
        value
      }
    }
  }`;
