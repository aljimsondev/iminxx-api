import { MetafieldDefinition, OWNER_TYPE } from '../core';

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
