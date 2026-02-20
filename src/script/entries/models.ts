import { FileRepository } from '../../repository/file.repository';
import { MetaobjectDefinition } from '../core';

const fileRepo = new FileRepository();

export class ModelEntries extends MetaobjectDefinition {
  type = 'models'; // metaobject type

  async load(models: Record<string, any>[]) {
    try {
      console.log('[START] Model entries started uploading...');
      const transformModelData =
        await this.transformToMetafieldKeyValueFormat(models);

      this.insert(transformModelData).then(() => {
        console.log('[END] Model entries loaded successfully!');
      });
    } catch (e) {
      console.error('[Error] Model upload error: ' + e);
    }
  }

  /**
   * Transform extracted model JSON into metafield key/value format
   * @param models
   * @returns
   */
  async transformToMetafieldKeyValueFormat(models: any[]) {
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

  async uploadModelImage(base64: string, filename: string) {
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

  async insert(models: any[][]) {
    for (const metainput of models) {
      const handleField = metainput.find((field) => field.key === 'label');

      if (!handleField) {
        console.warn('[WARN] Skipping entry — no label/handle found');
        continue;
      }

      const handle = this.createHandle(handleField.value);

      console.log('[START] Started adding entry to models metaobject');

      // return await this.checkEntryByHandle('models', metainput);

      const { success, data, errors } = await this.addEntry({
        fields: metainput,
        type: this.type,
        handle: handle,
      });

      if (!success) {
        console.warn(
          '[WARN] Failed to add new entry from models metaobject for ',
        );
        console.log(JSON.stringify(metainput, null, 2));
        console.warn(errors);
      } else {
        console.log('[SUCCESS] Added new entry to models metaobject!');
        console.log(data);
      }
    }
  }

  createHandle(modelName: string) {
    return modelName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special characters except spaces and -
      .trim()
      .replace(/\s+/g, '-'); // replace spaces with -
  }

  createChunks(models: any[], chunkSize: number) {
    let chunks = [];

    for (let i = 0; i < models.length; i += chunkSize) {
      chunks.push(models.slice(i, i + chunkSize));
    }

    return chunks;
  }
}
