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

export const UPDATE_CUSTOMER_ADDRESS_QUERY = `mutation customerAddressUpdate($customerId: ID!, $addressId: ID!, $address: MailingAddressInput!, $setAsDefault: Boolean) {
  customerAddressUpdate(customerId: $customerId, addressId: $addressId, address: $address, setAsDefault: $setAsDefault) {
    address {
      id
    }
    userErrors {
      field
      message
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

export const STOREFRONT_CUSTOMER_QUERY = `query getCustomerByAccessToken($customerAccessToken: String!){
  customer(customerAccessToken: $customerAccessToken) {
    id
    email
  }
}`;
