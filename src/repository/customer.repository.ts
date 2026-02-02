import axios from 'axios';

import { SHOPIFY_GRAPHQL } from '../constants/constant';
import {
  GET_CUSTOMER_BIRTHDAY,
  UPDATE_CUSTOMER_QUERY,
} from '../query/customer.query';
import { UpdateCustomerData } from '../types/customer';

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
}
