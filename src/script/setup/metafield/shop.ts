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
    console.info('[START] Starting generating shop metafield definition...');

    Promise.all([
      this.generateCustomPromoDetailsMetafieldDefinition(
        promoDetailsMetaobject,
      ),
    ]).finally(() => {
      console.info('[END] Finished generating shop metafield definitions!');
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
        '[BEGIN] Generating custom discount details metafield definition...',
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
        '[SUCCESS] Feature: Custom discount details metafield definition created successfully! Data: ',
      );
      console.info(data);

      return data;
    } catch (e) {
      this.logError(e, this.generateCustomPromoDetailsMetafieldDefinition.name);
    }
  }
}
