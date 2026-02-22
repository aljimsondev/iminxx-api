import ProductRepository from '@/repository/product.repository';
import { Logger } from '@/utils/logger';
import {
  MetafieldDefinition,
  MetaobjectDefinition,
  MetaobjectDefinitionReturnType,
  OWNER_TYPE,
} from '../core';

const productRepo = new ProductRepository();
const metaobjectBase = new MetaobjectDefinition();

export class ProductMetafieldDefinition extends MetafieldDefinition {
  constructor() {
    super();
  }

  generate({
    modelMetaobject,
  }: {
    modelMetaobject?: MetaobjectDefinitionReturnType['data'];
  }) {
    Logger.custom('Starting generating product metafield definition...', {
      type: 'START',
      mode: 'background',
      color: 'MAGENTA',
    });

    Promise.all([
      this.generateModelsMetafieldDefinition(modelMetaobject),
    ]).finally(() => {
      Logger.custom('Finished generating product metafield definitions!', {
        type: 'END',
        mode: 'background',
        color: 'BLACK',
      });
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

      Logger.custom('Generating product models metafield definition...', {
        type: 'BEGIN',
        mode: 'background',
        color: 'WHITE',
      });

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

      Logger.success(
        'Feature: Product models metafield definition created successfully! Data: ' +
          JSON.stringify(data, null, 2),
      );

      return data;
    } catch (e) {
      this.logError(e, this.generateModelsMetafieldDefinition.name);
    }
  }

  async assignModelsMetafield({
    models,
    productSKU,
    productName,
  }: {
    productSKU: string;
    models: string[];
    productName: string;
  }) {
    if (!productSKU) throw new Error('Product SKU is required!');
    if (!productName) throw new Error('Product name is required!');

    const { data, success } = await productRepo.getProductBySKU(productSKU);

    if (success) {
      // match product name
      const exactProduct = data.find(
        (product: any) =>
          product.title.toLowerCase() === productName.toLowerCase(),
      );

      if (!exactProduct)
        return Logger.warn('[WARN] No exact match for ' + productName);

      const modelsReference = await Promise.all(
        models.map(async (model) => {
          const results = await metaobjectBase.findByDisplayName({
            type: 'models',
            displayName: model,
          });

          if (results.data?.length > 0) return results.data[0]; // return first matched metaobject

          return null;
        }),
      );

      const filterModels = modelsReference.filter((model) => model !== null);

      // NOTE: Metafields allows maximum of 25 per transaction so in case that there are multiple models in a product which is impossible in the current use-case, you can just create chunks for filteredModels
      const result = await this.set([
        {
          type: 'list.metaobject_reference',
          ownerId: exactProduct.id,
          namespace: 'custom',
          key: 'product_models',
          value: JSON.stringify(filterModels.map((model) => model.id)),
        },
      ]);

      return result;
    }
  }
}
