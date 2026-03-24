import { Logger } from '@/utils/logger';
import { MetafieldDefinition, OWNER_TYPE } from '../core';

export class CustomerMetafieldDefinition extends MetafieldDefinition {
  constructor() {
    super();
  }

  async generate() {
    Logger.custom('Starting generating customer metafield definition...', {
      type: 'START',
      mode: 'background',
      color: 'MAGENTA',
    });

    await this.generateCustomerWishlistedItemsMetafield();
    await this.generateCustomerWishlistsSyncDateMetafield();
    await this.generateCustomerBirthdateMetafield();

    Logger.custom('Finished generating customer metafield definitions!', {
      type: 'END',
      mode: 'background',
      color: 'BLACK',
    });
  }

  async generateCustomerWishlistedItemsMetafield() {
    try {
      Logger.custom(
        'Generating customer wishlisted items metafield definition...',
        {
          type: 'BEGIN',
          mode: 'background',
          color: 'WHITE',
        },
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

      Logger.success(
        'Wishlisted items metafield definition created successfully! Data: ' +
          JSON.stringify(data, null, 2),
      );
    } catch (e) {
      this.logError(e, this.generateCustomerWishlistedItemsMetafield.name);
    }
  }

  async generateCustomerWishlistsSyncDateMetafield() {
    try {
      Logger.custom(
        'Generating customer wishlisted items sync date metafield definition...',
        {
          type: 'BEGIN',
          mode: 'background',
          color: 'WHITE',
        },
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

      Logger.success(
        'Wishlisted items sync date metafield definition created successfully! Data: ' +
          JSON.stringify(data, null, 2),
      );
    } catch (e) {
      this.logError(e, this.generateCustomerWishlistsSyncDateMetafield.name);
    }
  }

  async generateCustomerBirthdateMetafield() {
    try {
      Logger.custom('Generating customer birthdate metafield definition...', {
        type: 'BEGIN',
        mode: 'background',
        color: 'WHITE',
      });

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

      Logger.success(
        'Customer birthdate metafield definition created successfully! Data: ' +
          JSON.stringify(data, null, 2),
      );
    } catch (e) {
      this.logError(e, this.generateCustomerBirthdateMetafield.name);
    }
  }
}
