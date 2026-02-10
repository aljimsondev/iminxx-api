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
  validations?: { name: string; value: string }[];
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

class MetaobjectDefinition {
  constructor() {}

  async create(definition: MetaobjectDefinitionType) {
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
}

export class MetaobjectDefinitionGenerator extends MetaobjectDefinition {
  constructor() {
    super();
  }

  async generate() {
    console.info('Starting generating metaobject definitions...');

    Promise.all([
      this.generateCustomDiscountDetails(),
      this.generateModelMetaobject(),
    ]).finally(() => {
      console.info('Finished generating metaobject definitions!');
    });
  }
  async generateCustomDiscountDetails() {
    try {
      console.info(
        'Generating custom discount details metaobject defination...',
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
        'Feature: Custom discount details metaobject defination created successfully! Data: ',
      );
      console.info(data);
    } catch (e) {
      console.warn(
        'Error generating custom discount details metaobject defination: Reason: ',
        e,
      );
    }
  }

  async generateModelMetaobject() {
    try {
      console.info('Generating models metaobject defination...');

      const { success, data, errors } = await this.create({
        type: 'models_1',
        name: 'Models',
        description: 'Models metaobject containing models bio',
        fieldDefinitions: modelDefinitions,
      });

      if (!success) throw errors;

      console.info(
        'Feature: Models metaobject defination created successfully! Data: ',
      );
      console.info(data);
    } catch (e) {
      console.warn(
        'Error generating models metaobject defination: Reason: ',
        e,
      );
    }
  }
}
