import models from '../../_test_/models.json';
import { MetaobjectDefinition } from '../core';

export class ModelEntries extends MetaobjectDefinition {
  async load() {
    this.insert(models);
  }
  async insertTwo(models: any[]) {
    await this.addEntry({ fields: models.slice(0, 2), type: 'model' });
  }

  transformExcelJson(models: any[]) {
    return models.map((model) => ({
      label: '',
      thumbnail: '',
      underbust: '',
      overbust: '',
      bust_size: '',
      hip: '',
      waist: '',
      height: '',
      uk_size_bottoms: '',
      i_m_in_bodysuit_size: '',
      i_m_in_loungetop_size: '',
      i_m_in_thermal_top_size: '',
      i_m_in_thermal_pants_size: '',
      i_m_in_cheekie_size: '',
      i_m_in_lounge_pants_size: '',
      im_in_bra_size: '',
      im_in_shapewear_size: '',
      im_in_max_sculptor_size: '',
      im_in_lounge_short_size: '',
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
