import axios from 'axios';

import { SHOPIFY_GRAPHQL } from '../constants/constant';
import {
  GET_CUSTOMER_BIRTHDAY,
  STOREFRONT_CUSTOMER_QUERY,
  UPDATE_CUSTOMER_ADDRESS_QUERY,
  UPDATE_CUSTOMER_QUERY,
} from '../query/customer.query';
import { Address, UpdateCustomerData } from '../types/customer';

export default class CustomerRepository {
  async update(customerId: string, payload: Partial<UpdateCustomerData>) {
    if (!customerId) throw new Error('customerId parameter is required!');

    const response = await axios.post(
      SHOPIFY_GRAPHQL,
      {
        query: UPDATE_CUSTOMER_QUERY,
        variables: {
          input: {
            ...payload,
            id: `gid://shopify/Customer/${customerId}`,
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

    const customerData = data?.data?.customerUpdate;

    if (customerData?.userErrors?.length > 0) {
      return {
        error: customerData?.userErrors,
        success: false,
      };
    } else {
      const updatedDataResponse = customerData?.customer;

      return { data: updatedDataResponse, success: true };
    }
  }

  async updateAddress({
    addressId,
    customerId,
    payload,
  }: {
    customerId: string;
    addressId: string;
    payload: Partial<Address>;
  }) {
    if (!customerId) throw new Error('customerId parameter is required!');
    if (!addressId) throw new Error('addressId parameter is required!');

    const { asDefault, ...rest } = payload;

    const variables = {
      customerId: `gid://shopify/Customer/${customerId}`,
      addressId: `gid://shopify/MailingAddress/${addressId}?model_name=CustomerAddress`,
      setAsDefault: asDefault,
      address: { ...rest },
    };

    const response = await axios.post(
      SHOPIFY_GRAPHQL,
      {
        query: UPDATE_CUSTOMER_ADDRESS_QUERY,
        variables: variables,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.ADMIN_ACCESS_TOKEN,
        },
      },
    );

    const data = response.data;

    if (data?.errors?.length > 0) {
      return {
        error: data?.errors,
        success: false,
      };
    }

    const customerAddressData = data?.data?.customerAddressUpdate;

    if (customerAddressData?.userErrors?.length > 0) {
      return {
        error: customerAddressData?.userErrors,
        success: false,
      };
    } else {
      const updatedDataResponse = customerAddressData?.address;

      return {
        data: { ...updatedDataResponse, updated_at: Date.now() },
        success: true,
      };
    }
  }

  async getCustomerBirthdate(customerId: string) {
    try {
      if (!customerId) throw new Error('customerId parameter is required!');

      const response = await axios.post(
        SHOPIFY_GRAPHQL,
        {
          query: GET_CUSTOMER_BIRTHDAY,
          variables: {
            customerId: `gid://shopify/Customer/${customerId}`,
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

      const customerData = {
        id: data?.data?.customer?.id,
        birthday: data?.data?.customer?.birthday?.value,
      };

      return {
        success: true,
        data: customerData,
      };
    } catch (err: any) {
      console.error(
        `${CustomerRepository.name}:${this.getCustomerBirthdate.name} Error: ${err}`,
      );
      return {
        success: false,
        errors: err?.message || err,
      };
    }
  }
  /**
   * To check if customerAccessToken is valid, we need to query storefront-api with the token. If the result customer is matched then we can proceed to the next step
   * @param accesToken
   */
  async validateCustomerByAccessToken(
    accesToken: string,
  ): Promise<{ customer: null | { email: string; id: string } }> {
    if (!accesToken) throw new Error('Customer accessToken is required!');
    const variables = {
      customerAccessToken: accesToken,
    };

    const response = await fetch(process.env.STOREFRONT_API_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token':
          process.env.STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: STOREFRONT_CUSTOMER_QUERY,
        variables: variables,
      }),
    });

    const body = await response.json();

    if (body) {
      return (body as any)?.data;
    }

    return {
      customer: null,
    };
  }
}
