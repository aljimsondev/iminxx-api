import { MetaobjectDefinition } from '../core';

export class ModelEntries extends MetaobjectDefinition {
  async load(models: Record<string, any>[]) {
    const transformModelData = this.transformToMetafieldKeyValueFormat(models);
    this.insertTwo(transformModelData);
    // this.insert(transformModelData);
  }
  async insertTwo(models: any[]) {
    const metafieldInputs = models.slice(0, 2);
    console.log(metafieldInputs);
    await this.addEntry({ fields: metafieldInputs, type: 'model' });
  }

  /**
   * Transform extracted model JSON into metafield key/value format
   * @param models
   * @returns
   */
  transformToMetafieldKeyValueFormat(models: any[]) {
    return models.map((model) => ({
      label: model['Model Name'] || '',
      thumbnail: model['thumbnail'] || '',
      underbust: model['Underbust (cm)'] || '',
      overbust: model['Underbust (cm)'] || '',
      bust_size: model['Bust Size'] || '',
      hip: model['Hip (cm)'] || '',
      waist: model['Waist (cm)'] || '',
      height: model['Height (cm)'] || '',
      uk_size_bottoms: model['UK Size (Bottoms)'] || '',
      i_m_in_bodysuit_size: model["I'M IN Bodysuit Size"] || '',
      i_m_in_loungetop_size: model["I'M IN Lounge Top Size"] || '',
      i_m_in_thermal_top_size: model["I'M IN Thermal Top Size"] || '',
      i_m_in_thermal_pants_size: model["I'M IN Thermal Pants Size"] || '',
      i_m_in_cheekie_size: model["I'M IN Cheekies Size"] || '',
      i_m_in_lounge_pants_size: model["I'M IN Lounge Pants Size"] || '',
      im_in_bra_size: model["I'M IN Bra Size"] || '',
      im_in_shapewear_size: model["I'M IN Shapewear Size"] || '',
      im_in_max_sculptor_size: model["I'M IN Max Sculptor Size"] || '',
      im_in_lounge_short_size: model["I'M IN Lounge Shorts Size"] || '',
    }));
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
