import { Logger } from '@/utils/logger';
import fs from 'fs';
import { FileRepository } from '../../../repository/file.repository';
import ProductRepository from '../../../repository/product.repository';
import { ProductModelType } from '../../../utils/parser/xlsx-parser';
import { MetafieldDefinition, MetaobjectDefinition } from '../core';

const fileRepo = new FileRepository();
const productRepo = new ProductRepository();

export class ModelEntries extends MetaobjectDefinition {
  type = 'models'; // metaobject type
  metafield = new MetafieldDefinition();

  /**
   * Load models data that is extracted in the excel via Parser utility
   *
   * NOTE: models must be returned using Parser utility to be more efficient since transformToMetafieldKeyValueFormat is based on the JSON data pulled from Parser utility
   * @param models - array of models details extracted in the Parser utility
   */
  async load(models: Record<string, any>[]) {
    try {
      Logger.custom('Model entries started uploading...', {
        type: 'START',
        mode: 'background',
        color: 'MAGENTA',
      });
      const transformModelData =
        await this.transformToMetafieldKeyValueFormat(models);

      await this.insert(transformModelData).then(() => {
        Logger.custom('Model entries loaded successfully!', {
          type: 'END',
          mode: 'background',
          color: 'BLACK',
        });
      });
    } catch (e: any) {
      Logger.error('Model upload error: ' + e?.message);
      throw e;
    }
  }

  /**
   * Transform extracted model JSON into metafield key/value format
   * @param models
   * @returns
   */
  private async transformToMetafieldKeyValueFormat(models: any[]) {
    const objectKeyValArray = await Promise.all(
      models.map(async (model) => {
        const base64 = model['thumbnail'];

        let imgUid = '';

        const handle = this.createHandle(model['Model Name']);

        // check if its already existed
        const { data } = await this.getEntryByHandle(this.type, handle);

        if (data) {
          Logger.info(
            `Entry ${handle} already exists, setting null value for exclusion!`,
          );
          return null;
        }

        if (base64) {
          const { data, errors } = await this.uploadModelImage(
            base64,
            model['Model Name'],
          );
          if (data) {
            imgUid = data.id;
          } else {
            Logger.warn(
              `uploading image for ${model['Model Name']} failed!` +
                JSON.stringify(errors, null, 2),
            );
          }
        }

        return {
          label: model['Model Name'] || '',
          thumbnail: imgUid,
          underbust: model['Underbust (cm)'] || '',
          overbust: model['Underbust (cm)'] || '',
          bust_size: model['Bust Size'] || '',
          hip: model['Hip (cm)'] || '',
          waist: model['Waist (cm)'] || '',
          height: model['Height (cm)'] || '',
          uk_size_bottoms:
            model['UK Size (Bottoms)']?.replace(/\s+/g, '') || '', // removed white spaces
          i_m_in_bodysuit_size: model["I'M IN Bodysuit Size"] || '',
          i_m_in_lounge_top_size: model["I'M IN Lounge Top Size"] || '',
          i_m_in_thermal_top_size: model["I'M IN Thermal Top Size"] || '',
          i_m_in_thermal_pants_size: model["I'M IN Thermal Pants Size"] || '',
          i_m_in_cheekie_size: model["I'M IN Cheekies Size"] || '',
          i_m_in_lounge_pants_size: model["I'M IN Lounge Pants Size"] || '',
          im_in_bra_size: model["I'M IN Bra Size"] || '',
          im_in_shapewear_size: model["I'M IN Shapewear Size"] || '',
          im_in_max_sculptor_size: model["I'M IN Max Sculptor Size"] || '',
          im_in_lounge_short_size: model["I'M IN Lounge Shorts Size"] || '',
        };
      }),
    );

    // filter entries according to non-existent entries, existent entries have value of null as set above
    const newEntries = objectKeyValArray.filter((val) => val !== null);

    return newEntries.map((info) => {
      // type of lists definition must be added here to prevent errors
      const listFields = [
        'im_in_bra_size',
        'i_m_in_cheekie_size',
        'im_in_shapewear_size',
        'im_in_max_sculptor_size',
        'im_in_lounge_short_size',
        'i_m_in_lounge_pants_size',
      ];

      const metafieldInput = Object.entries(info).map(([key, val]) => ({
        key: key,
        value:
          listFields.includes(key) && val
            ? JSON.stringify(
                val
                  .split(',')
                  .map((v: string) => v.trim())
                  .filter(Boolean),
              )
            : val,
      }));

      return metafieldInput;
    });
  }

  private async uploadModelImage(base64: string, filename: string) {
    const { success, data, errors } = await fileRepo.uploadBase64({
      base64,
      filename,
    });

    if (!success) {
      return { errors: errors };
    }

    return {
      data,
    };
  }

  private async insert(models: any[][]) {
    for (const metainput of models) {
      const handleField = metainput.find((field) => field.key === 'label');

      if (!handleField) {
        Logger.info('Skipping entry — no label/handle found');
        continue;
      }

      const handle = this.createHandle(handleField.value);

      Logger.custom(`Started adding entry for ${handle} to models metaobject`, {
        type: 'BEGIN',
        mode: 'background',
        color: 'WHITE',
      });

      const { success, data, errors } = await this.addEntry({
        fields: metainput,
        type: this.type,
        handle: handle,
        capabilities: {
          publishable: {
            status: 'ACTIVE',
          },
        },
      });

      if (!success) {
        Logger.warn(
          'Failed to add new entry from models metaobject for ' +
            handle +
            ' Data : ' +
            JSON.stringify(metainput, null, 2) +
            ' Errors: ' +
            JSON.stringify(errors, null, 2),
        );
      } else {
        Logger.custom(
          `Added new entry for ${handle} to models metaobject! Data: ${JSON.stringify(data, null, 2)}`,
          {
            type: 'FINISHED',
            color: 'CYAN',
            mode: 'background',
          },
        );
      }
    }
  }

  private createHandle(modelName: string) {
    return modelName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special characters except spaces and -
      .trim()
      .replace(/\s+/g, '-'); // replace spaces with -
  }

  private createChunks(models: any[], chunkSize: number) {
    let chunks = [];

    for (let i = 0; i < models.length; i += chunkSize) {
      chunks.push(models.slice(i, i + chunkSize));
    }

    return chunks;
  }

  async assignToProducts(
    products: ProductModelType[],
    options: {
      skuPrefix?: string;
    } = {},
  ) {
    const { skuPrefix } = options;

    Logger.custom('Assigning models to products started!', {
      type: 'START',
      mode: 'background',
      color: 'MAGENTA',
    });

    for (const product of products) {
      // if no sku found skip it
      if (!product.productSKU) continue;

      Logger.custom('Assigning models to product SKU: ' + product.productSKU, {
        type: 'BEGIN',
        mode: 'background',
        color: 'WHITE',
      });

      let sku = product.productSKU.toString();

      // if theres a refix
      if (skuPrefix) {
        const cleanprefix = skuPrefix.replace(/[^a-zA-Z0-9]/g, ''); // removes any special characters in case accidentally passed "-" character
        sku = `${cleanprefix}-${product.productSKU}`;
      }

      const result = await this.assign({
        models: product.models,
        productName: product.productName,
        productSKU: sku,
      });

      if (result?.success) {
        Logger.success(
          'Successfully assigned product models for product SKU: ' +
            product.productSKU,
        );
        console.log(JSON.stringify(result?.data, null, 2));
      } else {
        if (result?.errors) {
          Logger.error(
            'Failed to assigned product models for product SKU: ' +
              product.productSKU +
              ' ' +
              'Reason: ' +
              JSON.stringify(result?.errors, null, 2),
          );
        }
      }
    }
    Logger.custom('Assigning  models to products task finished!', {
      type: 'FINISHED',
      color: 'CYAN',
      mode: 'background',
    });
  }

  async assignToProductsByHandle(products: ProductModelType[]) {
    Logger.custom('Assigning models to products started!', {
      type: 'START',
      mode: 'background',
      color: 'MAGENTA',
    });

    for (const product of products) {
      // if no title found skip it
      if (!product.productName) continue;

      Logger.custom('Assigning models to product: ' + product.productName, {
        type: 'BEGIN',
        mode: 'background',
        color: 'WHITE',
      });

      const result = await this.assignByProductHandle({
        models: product.models,
        handle: product.handle || '',
      });

      if (result?.success) {
        Logger.success(
          'Successfully assigned product models for product: ' +
            product.productName,
        );
        console.log(JSON.stringify(result?.data, null, 2));
      } else {
        if (result?.errors) {
          Logger.error(
            'Failed to assigned product models for product SKU: ' +
              product.productSKU +
              ' ' +
              'Reason: ' +
              JSON.stringify(result?.errors, null, 2),
          );
        }
      }
    }
    Logger.custom('Assigning  models to products task finished!', {
      type: 'FINISHED',
      color: 'CYAN',
      mode: 'background',
    });
  }

  async assignToProductsByTitle(products: ProductModelType[]) {
    Logger.custom('Assigning models to products started!', {
      type: 'START',
      mode: 'background',
      color: 'MAGENTA',
    });

    const failed = [];
    const notMatchedProducts: string[] = [];

    for (const product of products) {
      try {
        // if no title found skip it
        if (!product.productName) continue;

        Logger.custom('Assigning models to product: ' + product.productName, {
          type: 'BEGIN',
          mode: 'background',
          color: 'WHITE',
        });

        const result = await this.assignByTitle({
          models: product.models,
          title: product.productName,
          notFoundProducts: notMatchedProducts,
        });

        if (result?.success) {
          Logger.success(
            'Successfully assigned product models for product: ' +
              product.productName,
          );
          console.log(JSON.stringify(result?.data, null, 2));
        } else {
          if (result?.errors) {
            Logger.error(
              'Failed to assigned product models for product SKU: ' +
                product.productSKU +
                ' ' +
                'Reason: ' +
                JSON.stringify(result?.errors, null, 2),
            );
          }
        }
      } catch (e) {
        Logger.warn(
          'Error occurred assigning model to: ' + product.productName,
        );

        failed.push(product);
      }
    }

    if (failed.length > 0) {
      fs.writeFileSync('failed_products.json', JSON.stringify(failed, null, 2));
      console.log(
        `Saved ${failed.length} failed products to failed_products.json`,
      );
    }

    if (notMatchedProducts.length > 0) {
      fs.writeFileSync(
        'not_match_products.json',
        JSON.stringify(notMatchedProducts, null, 2),
      );
      console.log(
        `Saved ${notMatchedProducts.length} not matched products to not_match_products.json`,
      );
    }

    Logger.custom('Assigning  models to products task finished!', {
      type: 'FINISHED',
      color: 'CYAN',
      mode: 'background',
    });
  }

  private async assign({
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

    const { data, success, error } =
      await productRepo.getProductBySKU(productSKU);

    if (success) {
      // match product name
      const exactProduct = data.find(
        (product: any) =>
          product.title.toLowerCase() === productName.toLowerCase(),
      );

      if (!exactProduct)
        return Logger.warn(
          'No exact match for ' + productName + '. Skipping...',
        );

      const modelsReference = await Promise.all(
        models.map(async (model) => {
          const results = await this.findByDisplayName({
            type: this.type,
            displayName: model,
          });

          if (results.data?.length > 0) return results.data[0]; // return first matched metaobject

          return null;
        }),
      );

      const filterModels = modelsReference.filter((model) => model !== null);

      // NOTE: Metafields allows maximum of 25 per transaction so in case that there are multiple models in a product which is impossible in the current use-case, you can use createChunks method
      const result = await this.metafield.set([
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
    return {
      success: false,
      errors: error,
    };
  }

  private async assignByProductHandle({
    models,
    handle,
  }: {
    models: string[];
    handle: string;
  }) {
    if (!handle) throw new Error('Product handle is required!');

    const { data, success, error } = await productRepo.getProductsByQuery(
      `handle:${handle}`,
    );

    if (success) {
      const product = data[0];

      if (!product)
        return Logger.warn(
          'Product with handle ' + handle + ' does not exist. Skipping...',
        );

      const modelsReference = await Promise.all(
        models.map(async (model) => {
          const results = await this.findByDisplayName({
            type: this.type,
            displayName: model,
          });
          if (results.data?.length > 0) return results.data[0]; // return first matched metaobject
          return null;
        }),
      );
      const filterModels = modelsReference.filter((model) => model !== null);
      // NOTE: Metafields allows maximum of 25 per transaction so in case that there are multiple models in a product which is impossible in the current use-case, you can use createChunks method
      const result = await this.metafield.set([
        {
          type: 'list.metaobject_reference',
          ownerId: product.id,
          namespace: 'custom',
          key: 'product_models',
          value: JSON.stringify(filterModels.map((model) => model.id)),
        },
      ]);
      return result;
    }
    return {
      success: false,
      errors: error,
    };
  }

  private async assignByTitle({
    models,
    title,
    notFoundProducts,
  }: {
    models: string[];
    title: string;
    notFoundProducts: any[];
  }) {
    if (!title) throw new Error('Product title is required!');

    const { data, success, error } = await productRepo.getProductsByQuery(
      `title:${title} AND status:active`,
    );

    if (success) {
      const normalize = (str: string) =>
        str
          .toLowerCase()
          .trim()
          .replace(/\u00A0/g, ' ') // non-breaking spaces
          .replace(/[-\/]/g, ' ') // replace hyphens/slashes with space  ← fix
          .replace(/[^a-z0-9\s]/g, '') // remove remaining special characters
          .replace(/\s+/g, ' '); // collapse multiple spaces

      const filteredProducts: any[] = data.filter((product: any) =>
        normalize(product.title).startsWith(normalize(title)),
      );

      if (filteredProducts.length <= 0) {
        const res = {
          title: title,
          results: data,
          count: data.length,
        };

        notFoundProducts.push(res); // push to array for record keeping

        return Logger.warn(
          'No matched results for product: ' + title + '. Skipping...',
        );
      }

      const modelsReference = await Promise.all(
        models.map(async (model) => {
          const results = await this.findByDisplayName({
            type: this.type,
            displayName: model,
          });
          if (results.data?.length > 0) return results.data[0]; // return first matched metaobject
          return null;
        }),
      );

      const filterModels = modelsReference.filter((model) => model !== null);

      if (filterModels.length <= 0)
        return Logger.warn(
          'No result for model ' + JSON.stringify(models, null, 2),
        );

      for (const product of filteredProducts) {
        // check if metafield already assign
        Logger.custom('Assigning to: ' + product.title, {
          type: 'BEGIN',
          color: 'WHITE',
          mode: 'background',
        });

        const hasAssignedModel = await productRepo.hasAssignedModel(product.id);

        if (hasAssignedModel) {
          Logger.info(
            'Already assigned model to: ' + product.title + '. Skipping...',
          );
        } else {
          await this.metafield.set([
            {
              type: 'list.metaobject_reference',
              ownerId: product.id,
              namespace: 'custom',
              key: 'product_models',
              value: JSON.stringify(filterModels.map((model) => model.id)),
            },
          ]);
        }
      }

      Logger.custom(`Models assigned to product :${title}`, {
        type: 'END',
        color: 'CYAN',
        mode: 'background',
      });

      return {
        success: true,
        data: filteredProducts.map((product) => product.title),
      };
    }
    return {
      success: false,
      errors: error,
    };
  }
}
