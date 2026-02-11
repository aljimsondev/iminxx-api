import axios from 'axios';
import 'dotenv/config';
import { SHOPIFY_GRAPHQL } from '../constants/constant';
import { CREATE_METAOBJECT_DEFINITION_QUERY } from '../query/metafield.query';
import { modelDefinitions } from './field-definitions';

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

class MetaobjectDefinition {
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
}

export class MetaobjectDefinitionGenerator extends MetaobjectDefinition {
  constructor() {
    super();
  }

  async generate() {
    console.info('[START] Starting generating metaobject definitions...');

    const [promoDetailsMetaobject, modelMetaobject] = await Promise.all([
      this.generateCustomDiscountDetailsMetaobject(),
      this.generateModelMetaobject(),
    ]);

    console.info('[END] Finished generating metaobject definitions!');

    return {
      promoDetailsMetaobject,
      modelMetaobject,
    };
  }
  async generateCustomDiscountDetailsMetaobject() {
    try {
      console.info(
        '[BEGIN] Generating custom discount details metaobject defination...',
      );

      const { success, data, errors } = await this.create({
        type: 'discount',
        name: 'Discount Details',
        description: 'Custom Discount Details for extra promotion capability',
        fieldDefinitions: [
          {
            name: 'Discount Title',
            key: 'discount_title',
            type: 'single_line_text_field',
          },
          {
            key: 'details',
            name: 'Details',
            type: 'rich_text_field',
          },
        ],
      });

      if (!success) throw errors;

      console.info(
        '[SUCCESS] Feature: Custom discount details metaobject defination created successfully! Data: ',
      );
      console.info(data);
      return data;
    } catch (e) {
      this.logError(e, this.generateCustomDiscountDetailsMetaobject.name);
      return undefined;
    }
  }

  async generateModelMetaobject() {
    try {
      console.info('[BEGIN] Generating models metaobject defination...');

      const { success, data, errors } = await this.create({
        type: 'models',
        name: 'Models',
        description: 'Models metaobject containing models bio',
        fieldDefinitions: modelDefinitions,
      });

      if (!success) throw errors;

      console.info(
        '[SUCCESS] Feature: Models metaobject defination created successfully! Data: ',
      );
      console.info(data);

      return data;
    } catch (e) {
      this.logError(e, this.generateModelMetaobject.name);
      return undefined;
    }
  }
}
