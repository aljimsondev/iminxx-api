import { MetafieldDefinition, OWNER_TYPE } from '../core';

export class CustomerMetafieldDefinition extends MetafieldDefinition {
  constructor() {
    super();
  }

  async generate() {
    console.info(
      '[START] Starting generating customer metafield definition...',
    );
    Promise.all([
      this.generateCustomerWishlistedItemsMetafield(),
      this.generateCustomerWishlistsSyncDateMetafield(),
      this.generateCustomerBirthdateMetafield(),
    ]).finally(() => {
      console.info('[END] Finished generating customer metafield definitions!');
    });
  }

  async generateCustomerWishlistedItemsMetafield() {
    try {
      console.info(
        '[BEGIN] Generating customer wishlisted items metafield definition...',
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
        '[SUCCESS] Wishlisted items metafield definition created successfully! Data: ',
      );
      console.info(data);
    } catch (e) {
      this.logError(e, this.generateCustomerWishlistedItemsMetafield.name);
    }
  }

  async generateCustomerWishlistsSyncDateMetafield() {
    try {
      console.info(
        '[BEGIN] Generating customer wishlisted items sync date metafield definition...',
      );

      const { success, data, errors } = await this.create({
        name: 'Wishlists Sync Date',
        namespace: 'custom',
        key: 'wishlists_sync_date',
        description: 'Date and Time when the wishlists last sync!',
        type: 'date_time',
        ownerType: OWNER_TYPE.CUSTOMER,
        pin: true,
      });
      if (!success) throw errors;

      console.info(
        '[SUCCESS] Wishlisted items sync date metafield definition created successfully! Data: ',
      );
      console.info(data);
    } catch (e) {
      this.logError(e, this.generateCustomerWishlistsSyncDateMetafield.name);
    }
  }

  async generateCustomerBirthdateMetafield() {
    try {
      console.info(
        '[BEGIN] Generating customer birthdate metafield definition...',
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
        '[SUCCESS] Customer birthdate metafield definition created successfully! Data: ',
      );
      console.info(data);
    } catch (e) {
      this.logError(e, this.generateCustomerBirthdateMetafield.name);
    }
  }
}
