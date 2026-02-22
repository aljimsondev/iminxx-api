import { Logger } from '@/utils/logger';
import {
  MetafieldDefinition,
  MetaobjectDefinitionReturnType,
  OWNER_TYPE,
} from '../core';

export class ShopMetafieldDefinition extends MetafieldDefinition {
  constructor() {
    super();
  }

  generate({
    promoDetailsMetaobject,
  }: {
    promoDetailsMetaobject: MetaobjectDefinitionReturnType['data'] | undefined;
  }) {
    Logger.custom('Starting generating shop metafield definition...', {
      type: 'START',
      mode: 'background',
      color: 'MAGENTA',
    });

    Promise.all([
      this.generateCustomPromoDetailsMetafieldDefinition(
        promoDetailsMetaobject,
      ),
    ]).finally(() => {
      Logger.custom('Finished generating shop metafield definitions!', {
        type: 'END',
        mode: 'background',
        color: 'BLACK',
      });
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

      Logger.custom(
        'Generating custom discount details metafield definition...',
        {
          type: 'BEGIN',
          mode: 'background',
          color: 'WHITE',
        },
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

      Logger.success(
        ' Feature: Custom discount details metafield definition created successfully! Data: ' +
          JSON.stringify(data, null, 2),
      );

      return data;
    } catch (e) {
      this.logError(e, this.generateCustomPromoDetailsMetafieldDefinition.name);
    }
  }
}
