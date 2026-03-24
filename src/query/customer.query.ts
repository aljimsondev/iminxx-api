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

export const UPDATE_CUSTOMER_PASSWORD_QUERY = `
    mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
      customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
        customer {
          id
          updatedAt
        }
        customerUserErrors {
          field
          message
        }
      }
    }
    `;

export const GENERATE_ACCESS_TOKEN = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          field
          message
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

export const SET_WISHLISTED_ITEM_METAFIELD = `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      key
      namespace
      value
      createdAt
      updatedAt
    }
    userErrors {
      field
      message
      code
    }
  }
}`;

export const GET_WISHLISTED_ITEMS = `query GetWishlistedItems($ownerId: ID!) {
  customer(id: $ownerId) {
    metafields(keys: "custom.wishlisted_items", first: 1) {
      edges {
        node {
          key
          value
        }
      }
    }
  }
}`;

export const SIGNUP_NEW_CUSTOMER_QUERY = `mutation customerCreate($input: CustomerCreateInput!) {
  customerCreate(input: $input) {
    customer {
      id
      firstName
      lastName
      acceptsMarketing
    }
    customerUserErrors {
      field
      message
      code
    }
  }
}`;

export const SEND_PASSWORD_RESET_LINK_QUERY = `mutation customerRecover($email: String!) {
  customerRecover(email: $email) {
    customerUserErrors {
      code
      field
      message
    }
  }
}`;

export const PASSWORD_RESET_BY_URL_QUERY = `mutation customerResetByUrl($resetUrl: URL!, $password: String!) {
  customerResetByUrl(resetUrl: $resetUrl, password: $password) {
    customer {
      id
      updatedAt
    }
    customerUserErrors {
      code
      message
      field
    }
  }
}`;
