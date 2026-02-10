import axios from 'axios';
import 'dotenv/config';
import { SHOPIFY_GRAPHQL } from '../constants/constant';
import { CREATE_METAFIELD_DEFINITION_QUERY } from '../query/metafield.query';

enum OWNER_TYPE {
  COLLECTION = 'COLLECTION',
  CUSTOMER = 'CUSTOMER',
  SHOP = 'SHOP',
}

type Definition = {
  access?: any;
  capabilities?: any;
  constraints?: any;
  description?: string;
  key: string;
  name: string;
  namespace?: string;
  ownerType: OWNER_TYPE;
  pin?: boolean;
  type: string;
  validations?: any;
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
  // add metafield defination here
}

class CustomerMetafieldDefinition extends MetafieldDefinition {
  constructor() {
    super();
  }

  async generate() {
    console.info('Starting generating customer metafield defination...');
    Promise.all([
      this.generateCustomerWishlistedItemsMetafield(),
      this.generateCustomerBirthdateMetafield(),
    ]).finally(() => {
      console.info('Finished generating customer metafield definations!');
    });
  }

  async generateCustomerWishlistedItemsMetafield() {
    try {
      console.info(
        'Generating customer wishlisted items metafield defination...',
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
        'Wishlisted items metafield defination created successfully! Data: ',
      );
      console.info(data);
    } catch (e) {
      console.warn(
        'Error creating wishlited items metafield defination: Reason: ',
        e,
      );
    }
  }

  async generateCustomerBirthdateMetafield() {
    try {
      console.info('Generating customer birthdate metafield defination...');

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
        'Customer birthdate metafield defination created successfully! Data: ',
      );
      console.info(data);
    } catch (e) {
      console.warn(
        'Error creating customer birthdate metafield defination: Reason: ',
        e,
      );
    }
  }
}

class CollectionMetafieldDefinition extends MetafieldDefinition {
  constructor() {
    super();
  }

  async generate() {
    console.info('Starting generating collection metafield defination...');

    Promise.all([
      this.generateCreateFitProductFilterConfiguration(),
      this.generateCreateFitNavigationScreenSelectorMapping(),
    ]).finally(() => {
      console.info('Finished generating collection metafield definations!');
    });
  }

  async generateCreateFitProductFilterConfiguration() {
    try {
      console.info(
        'Generating Navigation Product Filter Configuration metafield defination...',
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
        'Feature: Create/Find Fit Navigation Product Filter Configuration metafield defination created successfully! Data: ',
      );
      console.info(data);
    } catch (e) {
      console.warn(
        'Error creating navigation product filter configuration metafield defination: Reason: ',
        e,
      );
    }
  }

  async generateCreateFitNavigationScreenSelectorMapping() {
    try {
      console.info(
        'Generating navigation screen selector mapping metafield defination...',
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
        'Feature: Create/Find Fit navigation screen selector mapping metafield defination created successfully! Data: ',
      );
      +JSON.stringify(data);
    } catch (e) {
      console.warn(
        'Error creating navigation screen selector mapping metafield defination: Reason: ',
        e,
      );
    }
  }
}

class ShopMetafieldDefinition extends MetafieldDefinition {
  constructor() {
    super();
  }

  generate() {
    console.info('Starting generating shop metafield defination...');

    Promise.all([this.generateCustomPromoDetailsMetafieldDefinition()]).finally(
      () => {
        console.info('Finished generating shop metafield definations!');
      },
    );
  }

  async generateCustomPromoDetailsMetafieldDefinition() {
    // try {
    //   console.info(
    //     'Generating custom discount details metafield defination...',
    //   );
    //   const { success, data, errors } = await this.create({
    //     name: 'Feature: Create/Find Fit Navigation Product Selector Filter Configuration',
    //     namespace: 'custom',
    //     key: 'navigation_product_filter_configuration',
    //     description:
    //       'Defines which product attributes are available for filtering with their labels, images, and collection handle.',
    //     type: 'json',
    //     ownerType: OWNER_TYPE.COLLECTION,
    //     pin: true,
    //   });
    //   if (!success) throw errors;
    //   console.info(
    //     'Feature: Create/Find Fit Navigation Product Filter Configuration metafield defination created successfully! Data: ',
    //   );
    //   console.info(data);
    // } catch (e) {
    //   console.warn(
    //     'Error creating navigation product filter configuration metafield defination: Reason: ',
    //     e,
    //   );
    // }
  }
}

(async () => {
  await Promise.allSettled([
    new CustomerMetafieldDefinition().generate(),
    new CollectionMetafieldDefinition().generate(),
    new ShopMetafieldDefinition().generate(),
  ]);
})();
