import {
  MetafieldDefinition,
  MetaobjectDefinitionReturnType,
  OWNER_TYPE,
} from '../core';

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
        pin: true,
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
