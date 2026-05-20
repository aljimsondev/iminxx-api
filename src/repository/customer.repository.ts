import axios from 'axios';

import { SHOPIFY_GRAPHQL } from '../constants/constant';
import {
  GENERATE_ACCESS_TOKEN,
  GET_CUSTOMER_BIRTHDAY,
  GET_WISHLISTED_ITEMS,
  PASSWORD_RESET_BY_URL_QUERY,
  SEND_PASSWORD_RESET_LINK_QUERY,
  SET_WISHLISTED_ITEM_METAFIELD,
  SIGNUP_NEW_CUSTOMER_QUERY,
  STOREFRONT_CUSTOMER_QUERY,
  UPDATE_CUSTOMER_ADDRESS_QUERY,
  UPDATE_CUSTOMER_PASSWORD_QUERY,
  UPDATE_CUSTOMER_QUERY,
} from '../query/customer.query';
import { Address, NewCustomer, UpdateCustomerData } from '../types/customer';
import ProductRepository from './product.repository';
import { redisRepository } from './redis.repository';

const productRepo = new ProductRepository();

export default class CustomerRepository {
  async signup(customer: NewCustomer) {
    const storefrontApiEndpoint = process.env.STOREFRONT_API_ENDPOINT;

    if (!storefrontApiEndpoint)
      throw new Error('Storefront API endpoint is not configured!');

    const {
      acceptsMarketing,
      email,
      firstName,
      lastName,
      password,
      birthday,
      phone,
    } = customer;

    const response = await axios.post(
      storefrontApiEndpoint,
      {
        query: SIGNUP_NEW_CUSTOMER_QUERY,
        variables: {
          input: {
            acceptsMarketing,
            email,
            firstName,
            lastName,
            password,
            phone,
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token':
            process.env.STOREFRONT_ACCESS_TOKEN,
        },
      },
    );

    const data = response.data;

    // check request errors
    if (data?.errors) {
      return {
        success: false,
        error: data?.errors,
      };
    }

    const customerData = data?.data?.customerCreate;

    // check shopify errors
    if (customerData?.customerUserErrors?.length > 0)
      return {
        success: false,
        error: customerData?.customerUserErrors,
      };

    if (!customerData?.customer)
      return {
        success: false,
        error: 'Unable to create new customer!',
      };

    // in this case the user account is created
    const newCustomer = customerData?.customer;

    try {
      // set the customer birthday metafield
      const result = await this.update(newCustomer.id, {
        metafields: {
          namespace: 'facts',
          key: 'birth_date',
          value: birthday,
        },
      });

      if (!result.success) throw result?.error;
    } catch (e) {
      console.warn('Failed on setting customer birthdate! Reason: ');
      console.warn(e);
    }

    return {
      success: true,
      data: customerData?.customer,
    };
  }

  async signupV2(customer: NewCustomer) {
    const storefrontApiEndpoint = process.env.STOREFRONT_API_ENDPOINT;

    if (!storefrontApiEndpoint)
      throw new Error('Storefront API endpoint is not configured!');

    const {
      acceptsMarketing,
      email,
      firstName,
      lastName,
      password,
      birthday,
      phone,
    } = customer;

    const response = await axios.post(
      storefrontApiEndpoint,
      {
        query: SIGNUP_NEW_CUSTOMER_QUERY,
        variables: {
          input: {
            acceptsMarketing,
            email,
            firstName,
            lastName,
            password,
            phone,
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token':
            process.env.STOREFRONT_ACCESS_TOKEN,
        },
      },
    );

    const data = response.data;

    // check request errors
    if (data?.errors) {
      return {
        success: false,
        error: data?.errors,
      };
    }

    const customerData = data?.data?.customerCreate;

    // check shopify errors
    if (customerData?.customerUserErrors?.length > 0) {
      // check if code is CUSTOMER_DISABLED, hence by default shopify will send activation link to the user
      const errors = customerData.customerUserErrors;

      const customerDisabledError = errors.some(
        (error: any) => error.code === 'CUSTOMER_DISABLED',
      );

      if (customerDisabledError) {
        // saves customer information to redis in order to apply updates after the account is enabled/activated
        this.saveUserInfoToRedis(customer);
      }

      return {
        success: false,
        error: customerData?.customerUserErrors,
      };
    }
    if (!customerData?.customer)
      return {
        success: false,
        error: 'Unable to create new customer!',
      };

    // in this case the user account is created
    const newCustomer = customerData?.customer;

    try {
      // set the customer birthday metafield
      const result = await this.update(newCustomer.id, {
        metafields: {
          namespace: 'facts',
          key: 'birth_date',
          value: birthday,
        },
      });

      if (!result.success) throw result?.error;
    } catch (e) {
      console.warn('Failed on setting customer birthdate! Reason: ');
      console.warn(e);
    }

    return {
      success: true,
      data: customerData?.customer,
    };
  }

  async update(customerId: string, payload: Partial<UpdateCustomerData>) {
    if (!customerId) throw new Error('customerId parameter is required!');

    const id = customerId.includes('gid://shopify/Customer/')
      ? customerId
      : `gid://shopify/Customer/${customerId}`;

    const response = await axios.post(
      SHOPIFY_GRAPHQL,
      {
        query: UPDATE_CUSTOMER_QUERY,
        variables: {
          input: {
            ...payload,
            id: id,
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

  async getWishlistedItems(customerId: string) {
    if (!customerId) throw new Error('Required customerId parameter!');

    const response = await axios.post(
      SHOPIFY_GRAPHQL,
      {
        query: GET_WISHLISTED_ITEMS,
        variables: {
          ownerId: `gid://shopify/Customer/${customerId}`,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.ADMIN_ACCESS_TOKEN,
        },
      },
    );

    if (response.data?.errors?.length > 0) {
      return {
        error: response.data?.errors,
        success: false,
      };
    }
    const metaFieldData =
      response?.data?.data?.customer?.metafields?.edges[0]?.node;

    return {
      success: true,
      data: {
        key: metaFieldData?.key,
        items: JSON.parse(metaFieldData?.value || '[]') as string[],
      },
    };
  }

  async setWishlistedItem({
    customerId,
    productId,
    action = 'add',
  }: {
    customerId: string;
    productId: string;
    action: 'remove' | 'add';
  }) {
    try {
      // added extra checks
      if (!customerId) throw new Error('Missing customerId parameter!');
      if (!productId) throw new Error('Missing productId parameter!');

      const { error, data: wishlist } =
        await this.getWishlistedItems(customerId);
      if (error) {
        return {
          error,
          success: false,
        };
      }

      const items = wishlist?.items as string[];
      let wishlistItems = [...items];

      if (action === 'add') {
        if (!wishlistItems.includes(productId)) {
          wishlistItems.push(productId);
        }
      } else if (action === 'remove') {
        // process removal
        wishlistItems = wishlistItems.filter((item) => item !== productId);
      }

      const variables = {
        metafields: [
          {
            key: 'wishlisted_items',
            namespace: 'custom',
            ownerId: `gid://shopify/Customer/${customerId}`,
            type: 'list.single_line_text_field',
            value: JSON.stringify(wishlistItems),
          },
        ],
      };

      const response = await axios.post(
        SHOPIFY_GRAPHQL,
        {
          query: SET_WISHLISTED_ITEM_METAFIELD,
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

      const metafieldData = data?.data?.metafieldsSet;

      if (metafieldData?.userErrors?.length > 0) {
        return { error: metafieldData.userErrors, success: false };
      }

      return {
        data: metafieldData?.metafields,
        success: true,
      };
    } catch (e: any) {
      return {
        success: false,
        error: e?.message,
      };
    }
  }

  async syncWishlistedItem({
    customerId,
    productIds,
  }: {
    customerId: string;
    productIds: string[];
  }) {
    try {
      // added extra checks
      if (!customerId) throw new Error('Missing customerId parameter!');
      if (!productIds) throw new Error('Missing productId parameter!');

      const validIds = await productRepo.filterActiveProductIds(productIds);

      const variables = {
        metafields: [
          {
            key: 'wishlisted_items',
            namespace: 'custom',
            ownerId: `gid://shopify/Customer/${customerId}`,
            type: 'list.single_line_text_field',
            value: JSON.stringify(validIds),
          },
          {
            key: 'wishlists_sync_date',
            namespace: 'custom',
            ownerId: `gid://shopify/Customer/${customerId}`,
            type: 'date_time',
            value: new Date().toISOString(), // YYYY-MM-DD
          },
        ],
      };

      const response = await axios.post(
        SHOPIFY_GRAPHQL,
        {
          query: SET_WISHLISTED_ITEM_METAFIELD,
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

      const metafieldData = data?.data?.metafieldsSet;

      if (metafieldData?.userErrors?.length > 0) {
        return { error: metafieldData.userErrors, success: false };
      }

      return {
        data: metafieldData?.metafields,
        success: true,
      };
    } catch (e: any) {
      return {
        success: false,
        error: e?.message,
      };
    }
  }

  async sendPasswordResetLink({
    email,
    customerIpAddress,
  }: {
    email: string;
    customerIpAddress: string;
  }) {
    try {
      if (!email) throw new Error('Customer email is required!');
      const response = await axios.post(
        process.env.STOREFRONT_API_ENDPOINT!,
        {
          query: SEND_PASSWORD_RESET_LINK_QUERY,
          variables: {
            email: email,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token':
              process.env.STOREFRONT_ACCESS_TOKEN,
            'Shopify-Storefront-Buyer-IP': customerIpAddress,
          },
        },
      );

      const errors = response.data?.data?.customerUserErrors;

      if (errors) {
        return { success: false, error: errors };
      }

      return {
        success: true,
        data: {
          message: 'ok',
        },
      };
    } catch (e: any) {
      return {
        success: false,
        error: e?.message,
      };
    }
  }

  async resetPasswordByURL({
    password,
    url,
  }: {
    url: string;
    password: string;
  }) {
    try {
      const variables = {
        password,
        resetUrl: url,
      };

      const response = await axios.post(
        process.env.STOREFRONT_API_ENDPOINT!,
        {
          query: PASSWORD_RESET_BY_URL_QUERY,
          variables: variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token':
              process.env.STOREFRONT_ACCESS_TOKEN,
          },
        },
      );

      if (response?.data?.errors) {
        return {
          success: false,
          error: response.data.errors,
        };
      }

      const custumerResetByUrl = response?.data?.data?.customerResetByUrl;

      const customerUserErrors = custumerResetByUrl?.customerUserErrors;

      if (customerUserErrors?.length > 0) {
        return { success: false, error: customerUserErrors };
      }

      const data = custumerResetByUrl?.customer;

      return {
        success: true,
        data: data,
      };
    } catch (e: any) {
      return {
        success: false,
        error: e?.message,
      };
    }
  }

  async updateUserPassword({
    password,
    accessToken,
  }: {
    password: string;
    accessToken: string;
  }) {
    const variables = {
      customerAccessToken: accessToken,
      customer: {
        password: password,
      },
    };

    const response = await axios.post(
      process.env.STOREFRONT_API_ENDPOINT!,
      {
        query: UPDATE_CUSTOMER_PASSWORD_QUERY,
        variables: variables,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token':
            process.env.STOREFRONT_ACCESS_TOKEN,
        },
      },
    );

    const data = response.data;

    if (data?.errors) {
      return {
        success: false,
        error: data.errors,
      };
    }

    const customerUpdate = data?.data?.customerUpdate;
    if (customerUpdate?.customerUserErrors?.length > 0)
      return {
        success: false,
        error: customerUpdate.customerUserErrors,
      };

    return {
      success: true,
      data: customerUpdate?.customer,
    };
  }

  async generateAccessToken({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const variables = {
      input: {
        email: email,
        password: password,
      },
    };

    const response = await axios.post(
      process.env.STOREFRONT_API_ENDPOINT!,
      {
        query: GENERATE_ACCESS_TOKEN,
        variables: variables,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token':
            process.env.STOREFRONT_ACCESS_TOKEN,
        },
      },
    );

    const data = response.data;

    if (data?.errors) {
      return {
        success: false,
        error: data.errors,
      };
    }

    const tokenCreate = data?.data?.customerAccessTokenCreate;

    if (tokenCreate?.customerUserErrors?.length > 0) {
      return { success: false, error: tokenCreate.customerUserErrors };
    }

    return {
      success: true,
      data: tokenCreate?.customerAccessToken,
    };
  }

  async saveUserInfoToRedis(customer: NewCustomer) {
    const ttlMap = {
      oneHour: 60 * 60,
      oneDay: 60 * 60 * 24,
      oneWeek: 60 * 60 * 24 * 7,
    };

    const ttl = ttlMap.oneDay * 30; // the activation url is valid up to 30 days so we set the ttl to 30 days also
    const { password, ...rest } = customer; // for security purposes exclude the password
    const cachkey = `customer:${customer.email}`;
    await redisRepository.set(cachkey, rest, ttl);
  }
}
