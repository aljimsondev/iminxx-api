import axios from 'axios';
import 'dotenv/config';
import { SHOPIFY_GRAPHQL } from '../constants/constant';
import {
  CREATE_METAOBJECT_DEFINITION_QUERY,
  FIND_METAOBJECT_DEFINITION_BY_TYPE,
} from '../query/metafield.query';
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

      const type = 'discount';

      const { success, data, errors } = await this.create({
        type,
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

      if (!success) {
        // check if it already exists
        const existed = errors?.find((error) => error.code === 'TAKEN');

        if (!existed) throw errors;

        console.info('[INFO] Product Model already exist, skipping...');
        console.info('[PULLING] Getting Custom Discount Details metaobject...');
        const {
          data: existingMetaobject,
          success: found,
          errors: metaobjectErrors,
        } = await this.findByType(type);

        if (!found) throw metaobjectErrors;

        console.info(
          '[SUCCESS] Retrieved Custom Discount Details metaobject...',
        );
        return existingMetaobject;
      }

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
      const type = 'models';
      const { success, data, errors } = await this.create({
        type: type,
        name: 'Models',
        description: 'Models metaobject containing models bio',
        fieldDefinitions: modelDefinitions,
      });

      if (!success) {
        // check if it already exists
        const existed = errors?.find((error) => error.code === 'TAKEN');

        if (!existed) throw errors;

        console.info('[INFO] Product Model already exist, skipping...');
        console.info('[PULLING] Getting Product Model metaobject...');
        const {
          data: existingMetaobject,
          success: found,
          errors: metaobjectErrors,
        } = await this.findByType(type);

        if (!found) throw metaobjectErrors;

        console.info('[SUCCESS] Retrieved Product Model metaobject...');
        return existingMetaobject;
      }

      console.info(
        '[SUCCESS] Feature: Models metaobject defination created successfully! Data: ',
      );

      return data;
    } catch (e) {
      this.logError(e, this.generateModelMetaobject.name);
      return undefined;
    }
  }
}
