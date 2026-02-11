import axios from 'axios';
import 'dotenv/config';
import { SHOPIFY_GRAPHQL } from '../constants/constant';
import { CREATE_METAFIELD_DEFINITION_QUERY } from '../query/metafield.query';
import { MetaobjectDefinitionReturnType } from './setup-metaobject';

enum OWNER_TYPE {
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

class MetafieldDefinition {
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

  // add additional metafield defination methods here
}

export class CustomerMetafieldDefinition extends MetafieldDefinition {
  constructor() {
    super();
  }

  async generate() {
    console.info(
      '[START] Starting generating customer metafield defination...',
    );
    Promise.all([
      this.generateCustomerWishlistedItemsMetafield(),
      this.generateCustomerBirthdateMetafield(),
    ]).finally(() => {
      console.info('[END] Finished generating customer metafield definations!');
    });
  }

  async generateCustomerWishlistedItemsMetafield() {
    try {
      console.info(
        '[BEGIN] Generating customer wishlisted items metafield defination...',
      );

      const { success, data, errors } = await this.create({
        name: 'Wishlisted Items',
        namespace: 'custom',
        key: 'wishlisted_items',
        description:
          'A list of products idenfier saved as wishlisted items for user!',
        type: 'single_line_text_field',
        ownerType: OWNER_TYPE.CUSTOMER,
        pin: true,
      });
      if (!success) throw errors;

      console.info(
        '[SUCCESS] Wishlisted items metafield defination created successfully! Data: ',
      );
      console.info(data);
    } catch (e) {
      this.logError(e, this.generateCustomerWishlistedItemsMetafield.name);
    }
  }

  async generateCustomerBirthdateMetafield() {
    try {
      console.info(
        '[BEGIN] Generating customer birthdate metafield defination...',
      );

      const { success, data, errors } = await this.create({
        name: 'Birth date',
        namespace: 'facts',
        key: 'birth_date',
        description: 'Customer date of birth',
        type: 'date',
        ownerType: OWNER_TYPE.CUSTOMER,
        pin: true,
      });

      if (!success) throw errors;

      console.info(
        '[SUCCESS] Customer birthdate metafield defination created successfully! Data: ',
      );
      console.info(data);
    } catch (e) {
      this.logError(e, this.generateCustomerBirthdateMetafield.name);
    }
  }
}

export class CollectionMetafieldDefinition extends MetafieldDefinition {
  constructor() {
    super();
  }

  async generate() {
    console.info(
      '[START] Starting generating collection metafield defination...',
    );

    Promise.all([
      this.generateCreateFitProductFilterConfiguration(),
      this.generateCreateFitNavigationScreenSelectorMapping(),
    ]).finally(() => {
      console.info(
        '[END] Finished generating collection metafield definations!',
      );
    });
  }

  async generateCreateFitProductFilterConfiguration() {
    try {
      console.info(
        '[BEGIN] Generating Navigation Product Filter Configuration metafield defination...',
      );

      const { success, data, errors } = await this.create({
        name: 'Feature: Create/Find Fit Navigation Product Selector Filter Configuration',
        namespace: 'custom',
        key: 'navigation_product_filter_configuration',
        description:
          'Defines which product attributes are available for filtering with their labels, images, and collection handle.',
        type: 'json',
        ownerType: OWNER_TYPE.COLLECTION,
        pin: true,
      });

      if (!success) throw errors;

      console.info(
        '[SUCCESS] Feature: Create/Find Fit Navigation Product Filter Configuration metafield defination created successfully! Data: ',
      );
      console.info(data);
    } catch (e) {
      this.logError(e, this.generateCreateFitProductFilterConfiguration.name);
    }
  }

  async generateCreateFitNavigationScreenSelectorMapping() {
    try {
      console.info(
        '[BEGIN] Generating navigation screen selector mapping metafield defination...',
      );

      const { success, data, errors } = await this.create({
        name: 'Feature: Create/Find Fit Navigation Screen Selector Mapping',
        namespace: 'custom',
        key: 'navigation_screen_selector_mapping',
        description:
          'Navigation screen mapping used for metafield filter configuration',
        type: 'json',
        ownerType: OWNER_TYPE.COLLECTION,
        pin: true,
      });

      if (!success) throw errors;

      console.info(
        '[SUCCESS] Feature: Create/Find Fit navigation screen selector mapping metafield defination created successfully! Data: ',
      );
      +JSON.stringify(data);
    } catch (e) {
      this.logError(
        e,
        this.generateCreateFitNavigationScreenSelectorMapping.name,
      );
    }
  }
}

export class ShopMetafieldDefinition extends MetafieldDefinition {
  constructor() {
    super();
  }

  generate({
    promoDetailsMetaobject,
  }: {
    promoDetailsMetaobject: MetaobjectDefinitionReturnType['data'] | undefined;
  }) {
    console.info('[START] Starting generating shop metafield defination...');

    Promise.all([
      this.generateCustomPromoDetailsMetafieldDefinition(
        promoDetailsMetaobject,
      ),
    ]).finally(() => {
      console.info('[END] Finished generating shop metafield definations!');
    });
  }

  async generateCustomPromoDetailsMetafieldDefinition(
    metaobject: MetaobjectDefinitionReturnType['data'] | undefined,
  ) {
    try {
      if (!metaobject || !metaobject?.id)
        throw new Error(
          'Unable to get metaobject ID, aborting custom promo details metafield generation!',
        );

      console.info(
        '[BEGIN] Generating custom discount details metafield defination...',
      );
      const { success, data, errors } = await this.create({
        name: 'Feature: Custom Discount Details',
        namespace: 'custom',
        key: 'discount_details',
        description:
          'Enable custom promotion details for additional marketing purposes',
        type: 'list.metaobject_reference',
        validations: [
          { name: 'metaobject_definition_id', value: metaobject.id },
        ],
        ownerType: OWNER_TYPE.SHOP,
        access: {
          storefront: 'PUBLIC_READ',
        },
        pin: true,
      });

      if (!success) throw errors;
      console.info(
        '[SUCCESS] Feature: Custom discount details metafield defination created successfully! Data: ',
      );
      console.info(data);

      return data;
    } catch (e) {
      this.logError(e, this.generateCustomPromoDetailsMetafieldDefinition.name);
    }
  }
}

export class ProductMetafieldDefinition extends MetafieldDefinition {
  constructor() {
    super();
  }

  generate({
    modelMetaobject,
  }: {
    modelMetaobject?: MetaobjectDefinitionReturnType['data'];
  }) {
    console.info('[START] Starting generating product metafield defination...');

    Promise.all([
      this.generateModelsMetafieldDefinition(modelMetaobject),
    ]).finally(() => {
      console.info('[END] Finished generating product metafield definations!');
    });
  }

  async generateModelsMetafieldDefinition(
    modelMetaobject?: MetaobjectDefinitionReturnType['data'],
  ) {
    try {
      if (!modelMetaobject || !modelMetaobject?.id)
        throw new Error(
          'Unable to get metaobject ID, aborting models metafield generation!',
        );

      console.info('[BEGIN] Generating product models metafield defination...');

      const { success, data, errors } = await this.create({
        name: 'Product Models',
        namespace: 'custom',
        key: 'product_models',
        description:
          'For list of product models in product page models tab associated with the product',
        type: 'list.metaobject_reference',
        validations: [
          { name: 'metaobject_definition_id', value: modelMetaobject.id },
        ],
        ownerType: OWNER_TYPE.PRODUCT,
        access: {
          storefront: 'PUBLIC_READ',
        },
      });

      if (!success) throw errors;
      console.info(
        '[SUCCESS] Feature: Product models metafield defination created successfully! Data: ',
      );
      console.info(data);

      return data;
    } catch (e) {
      this.logError(e, this.generateModelsMetafieldDefinition.name);
    }
  }
}
