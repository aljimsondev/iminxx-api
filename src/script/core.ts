import axios from 'axios';
import 'dotenv/config';

import { SHOPIFY_GRAPHQL } from '../constants/constant';
import {
  CREATE_METAFIELD_DEFINITION_QUERY,
  CREATE_METAOBJECT_DEFINITION_QUERY,
  CREATE_METAOBJECT_QUERY,
  FIND_METAOBJECT_DEFINITION_BY_TYPE,
  GET_METAOBJECT_ENTRY_BY_HANDLE_QUERY,
} from '../query/metafield.query';

export enum OWNER_TYPE {
  COLLECTION = 'COLLECTION',
  CUSTOMER = 'CUSTOMER',
  SHOP = 'SHOP',
  PRODUCT = 'PRODUCT',
}

type Definition = {
  access?: any;
  capabilities?: any;
  constraints?: { key: string; values: string[] };
  description?: string;
  key: string;
  name: string;
  namespace?: string;
  ownerType: OWNER_TYPE;
  pin?: boolean;
  type: string;
  validations?: { name: string; value: string }[];
};

export type Metaobject = {
  capabilities?: any;
  fields: { key: string; value: string }[];
  handle?: string;
  type: string;
};

export type MetaobjectDefinitionInputType = {
  capabilities?: any;
  description?: string;
  key: string;
  name?: string;
  required?: boolean;
  type: string;
  validations?: { name: string; value: string | string[] }[];
};

type MetaobjectDefinitionType = {
  access?: any;
  capabilities?: any;
  description?: string;
  displayNameKey?: string;
  fieldDefinitions: MetaobjectDefinitionInputType[];
  name?: string;
  type: string;
};

type MetaobjectEntryInput = {
  fields: { key: string; value: string }[];
  type: string;
  handle?: string;
};

export type MetaobjectDefinitionReturnType = {
  success: boolean;
  data?: {
    id: string;
    name: string;
    type: string;
    fieldDefinitions: {
      name: string;
      key: string;
    }[];
  };
  errors?: {
    field: string;
    message: string;
    code: string;
  }[];
};

export class MetafieldDefinition {
  constructor() {}

  async create(definition: Definition) {
    const response = await axios.post(
      SHOPIFY_GRAPHQL,
      {
        query: CREATE_METAFIELD_DEFINITION_QUERY,
        variables: {
          definition: definition,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.ADMIN_ACCESS_TOKEN,
        },
      },
    );

    if (response?.data?.errors) throw response.data.errors;

    const data = response?.data?.data?.metafieldDefinitionCreate;

    if (data?.userErrors?.length > 0)
      return {
        success: false,
        errors: data.userErrors,
      };

    return {
      success: true,
      data: data?.createdDefinition,
    };
  }

  logError(e: any, fuctionName: string) {
    const message = `Error occured while creating metafield definition at ${fuctionName}!`;

    if (Array.isArray(e)) {
      if (e.find((error) => error?.code === 'TAKEN'))
        return console.warn(
          `[INFO] (${fuctionName}): Metafield definition already exist, skipping...`,
        );

      return console.error(`${message} Reason: ${e}`);
    }

    if (e?.message)
      return console.error(`[ERROR] (${fuctionName}): Reason: ${e.message}`);

    return console.error(`[ERROR] ${message} Reason: ${e}`);
  }
}

export class MetaobjectDefinition {
  constructor() {}

  async create(
    definition: MetaobjectDefinitionType,
  ): Promise<MetaobjectDefinitionReturnType> {
    const response = await axios.post(
      SHOPIFY_GRAPHQL,
      {
        query: CREATE_METAOBJECT_DEFINITION_QUERY,
        variables: {
          definition,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.ADMIN_ACCESS_TOKEN,
        },
      },
    );

    if (response?.data?.errors) throw response.data.errors;

    const data = response?.data?.data?.metaobjectDefinitionCreate;

    if (data?.userErrors?.length > 0)
      return {
        success: false,
        errors: data.userErrors,
      };

    return {
      success: true,
      data: data?.metaobjectDefinition,
    };
  }

  async findByType(type: string): Promise<MetaobjectDefinitionReturnType> {
    const response = await axios.post(
      SHOPIFY_GRAPHQL,
      {
        query: FIND_METAOBJECT_DEFINITION_BY_TYPE,
        variables: {
          type: type,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.ADMIN_ACCESS_TOKEN,
        },
      },
    );

    if (response.data?.errors) {
      return { errors: response.data?.errors, success: false };
    }

    const metaobject = response.data?.data?.metaobjectDefinitionByType;

    return {
      success: true,
      data: metaobject,
    };
  }

  logError(e: any, fuctionName: string) {
    const message = `Error occured while creating metafield definition at ${fuctionName}!`;

    if (Array.isArray(e)) {
      if (e.find((error) => error?.code === 'TAKEN'))
        return console.warn(
          `[INFO] (${fuctionName}): Metaobject definition already exist, skipping...`,
        );

      return console.error(`${message} Reason: ${e}`);
    }

    if (e?.message)
      return console.error(`[ERROR] (${fuctionName}) Reason: ${e.message}`);

    return console.error(`[ERROR] ${message} Reason: ${e}`);
  }

  // add additional metafield defination methods here
  async addEntry({ fields, type, handle }: MetaobjectEntryInput) {
    if (!type) throw new Error('Metaobject type is required!');

    let metaobject: MetaobjectEntryInput = {
      type,
      fields,
    };

    if (handle) {
      metaobject.handle = handle;
    }

    const response = await axios.post(
      SHOPIFY_GRAPHQL,
      {
        query: CREATE_METAOBJECT_QUERY,
        variables: {
          metaobject: metaobject,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.ADMIN_ACCESS_TOKEN,
        },
      },
    );

    if (response?.data?.errors?.length > 0)
      return {
        success: false,
        errors: response?.data?.errors,
      };

    const metaobjectCreate = response?.data?.data?.metaobjectCreate;

    if (metaobjectCreate?.userErrors?.length > 0) {
      return {
        success: false,
        errors: metaobjectCreate.userErrors,
      };
    }

    return {
      success: true,
      data: metaobjectCreate?.metaobject,
    };
  }

  async getEntryByHandle(type: string, handle: string) {
    if (!type) throw new Error('Metaobject type is required!');
    if (!handle) throw new Error('Metaobject handle is required!');

    const response = await axios.post(
      SHOPIFY_GRAPHQL,
      {
        query: GET_METAOBJECT_ENTRY_BY_HANDLE_QUERY,
        variables: {
          type: type,
          query: `handle:${handle}`,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.ADMIN_ACCESS_TOKEN,
        },
      },
    );

    if (response?.data?.errors?.length > 0)
      return {
        success: false,
        errors: response?.data?.errors,
      };

    const metaobject = response?.data?.data?.metaobjects?.nodes?.[0];

    return {
      success: true,
      data: metaobject,
    };
  }
}
