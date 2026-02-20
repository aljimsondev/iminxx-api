import { FileRepository } from '../../repository/file.repository';
import { MetaobjectDefinition } from '../core';

const fileRepo = new FileRepository();

export class ModelEntries extends MetaobjectDefinition {
  async load(models: Record<string, any>[]) {
    const transformModelData = await this.transformToMetafieldKeyValueFormat(
      models.slice(0, 1),
    );
    console.log(transformModelData);
    // this.insertTwo(transformModelData);
    // this.insert(transformModelData);
  }
  async insertTwo(models: any[][]) {
    const metafieldInputs = models.slice(0, 2);

    Promise.all(
      metafieldInputs.map(async (metainput) => {
        console.log('[START] Started adding entry to models metaobject');
        const { success, data, errors } = await this.addEntry({
          fields: metainput,
          type: 'models',
        });

        if (!success) {
          console.warn(
            '[WARN] Failed to add new entry from models metaobject!',
          );
          console.warn(errors);
        } else {
          console.log('[SUCCESS] Added new entry to models metaobject!');
          console.log(data);
        }
      }),
    );
  }

  /**
   * Transform extracted model JSON into metafield key/value format
   * @param models
   * @returns
   */
  async transformToMetafieldKeyValueFormat(models: any[]) {
    const objectKeyValArray = models.map(async (model) => {
      let file = null;

      const base64 = model['thumbnail'];

      if (base64) {
        await this.uploadModelImage(base64, model['Model Name']);
      }

      return {
        label: model['Model Name'] || '',
        thumbnail: file,
        underbust: model['Underbust (cm)'] || '',
        overbust: model['Underbust (cm)'] || '',
        bust_size: model['Bust Size'] || '',
        hip: model['Hip (cm)'] || '',
        waist: model['Waist (cm)'] || '',
        height: model['Height (cm)'] || '',
        uk_size_bottoms: model['UK Size (Bottoms)'] || '',
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
    });

    return objectKeyValArray.map((info) => {
      const metafieldInput = Object.entries(info).map(([key, val]) => ({
        key: key,
        value: val,
      }));

      return metafieldInput;
    });
  }

  async uploadModelImage(base64: string, filename: string) {
    const response = await fileRepo.uploadBase64({ base64, filename });

    console.log(response);
  }

  insert(models: any[]) {
    const chunks = this.createChunks(models, 25);

    for (let i = 0; i < chunks.length; i++) {
      this.addEntry({ fields: chunks[i], type: 'model' });
    }
  }

  createChunks(models: any[], chunkSize: number) {
    let chunks = [];

    for (let i = 0; i < models.length; i += chunkSize) {
      chunks.push(models.slice(i, i + chunkSize));
    }

    return chunks;
  }
}
