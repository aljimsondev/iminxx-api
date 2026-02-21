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
      console.log('[START] Model entries started uploading...');
      const transformModelData =
        await this.transformToMetafieldKeyValueFormat(models);

      await this.insert(transformModelData).then(() => {
        console.log('[END] Model entries loaded successfully!');
      });
    } catch (e: any) {
      console.error('[Error] Model upload error: ' + e?.message);
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
          console.log(
            `[INFO] Entry ${handle} already exists, setting null value for exclusion!`,
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
            console.error(
              `[WARN] uploading image for ${model['Model Name']} failed!`,
            );
            console.warn(JSON.stringify(errors, null, 2));
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
        console.warn('[WARN] Skipping entry — no label/handle found');
        continue;
      }

      const handle = this.createHandle(handleField.value);

      console.log(
        `[BEGIN] Started adding entry for ${handle} to models metaobject`,
      );

      // return await this.checkEntryByHandle('models', metainput);

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
        console.warn(
          '[WARN] Failed to add new entry from models metaobject for ' + handle,
        );
        console.log(JSON.stringify(metainput, null, 2));
        console.warn(errors);
      } else {
        console.log(
          `[FINISHED] Added new entry for ${handle} to models metaobject!`,
        );
        console.log(data);
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

    console.log('[START] Assigning models to products started!');
    for (const product of products) {
      // if no sku found skip it
      if (!product.productSKU) continue;
      console.info(
        '[BEGIN] Assigning models to product SKU: ' + product.productSKU,
      );

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
        console.info(
          '[SUCCESS] Successfully assigned product models for product SKU: ' +
            product.productSKU,
        );
        console.log(JSON.stringify(result?.data, null, 2));
      } else {
        if (result?.errors) {
          console.info(
            '[FAILED] Failed to assigned product models for product SKU: ' +
              product.productSKU,
          );
          console.error('Reason: ');
          console.error(JSON.stringify(result?.errors, null, 2));
        }
      }
    }
    console.log('[FINISHED] Assigning  models to products task finished!');
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
        return console.warn(
          '[WARN] No exact match for ' + productName + '. Skipping...',
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
}
