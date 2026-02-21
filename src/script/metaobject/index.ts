import { MetaobjectDefinition } from '../core';
import {
  customDiscountDetailsDefinition,
  modelDefinitions,
} from '../field-definitions';

export class MetaobjectDefinitionGenerator extends MetaobjectDefinition {
  constructor() {
    super();
  }

  async generate() {
    console.info('[START] Starting generating metaobject definitions...');

    const [promoDetailsMetaobject, modelMetaobject] = await Promise.all([
      this.generateCustomDiscountDetailsMetaobject(),
      this.generateModelMetaobject(),
    ]);

    console.info('[END] Finished generating metaobject definitions!');

    return {
      promoDetailsMetaobject,
      modelMetaobject,
    };
  }
  async generateCustomDiscountDetailsMetaobject() {
    try {
      console.info(
        '[BEGIN] Generating custom discount details metaobject definition...',
      );

      const type = 'discount';

      const { success, data, errors } = await this.create({
        type,
        name: 'Discount Details',
        description: 'Custom Discount Details for extra promotion capability',
        fieldDefinitions: customDiscountDetailsDefinition,
      });

      if (!success) {
        // check if it already exists
        const existed = errors?.find((error) => error.code === 'TAKEN');

        if (!existed) throw errors;

        console.info('[INFO] Product Model already exist, skipping...');
        console.info('[PULLING] Getting Custom Discount Details metaobject...');
        const {
          data: existingMetaobject,
          success: found,
          errors: metaobjectErrors,
        } = await this.findByType(type);

        if (!found) throw metaobjectErrors;

        console.info(
          '[SUCCESS] Retrieved Custom Discount Details metaobject...',
        );
        return existingMetaobject;
      }

      console.info(
        '[SUCCESS] Feature: Custom discount details metaobject definition created successfully! Data: ',
      );
      console.info(data);
      return data;
    } catch (e) {
      this.logError(e, this.generateCustomDiscountDetailsMetaobject.name);
      return undefined;
    }
  }

  async generateModelMetaobject() {
    try {
      console.info('[BEGIN] Generating models metaobject definition...');
      const type = 'models';
      const { success, data, errors } = await this.create({
        type: type,
        name: 'Models',
        description: 'Models metaobject containing models bio',
        fieldDefinitions: modelDefinitions,
      });

      if (!success) {
        // check if it already exists
        const existed = errors?.find((error) => error.code === 'TAKEN');

        if (!existed) throw errors;

        console.info('[INFO] Product Model already exist, skipping...');
        console.info('[PULLING] Getting Product Model metaobject...');
        const {
          data: existingMetaobject,
          success: found,
          errors: metaobjectErrors,
        } = await this.findByType(type);

        if (!found) throw metaobjectErrors;

        console.info('[SUCCESS] Retrieved Product Model metaobject...');
        return existingMetaobject;
      }

      console.info(
        '[SUCCESS] Feature: Models metaobject definition created successfully! Data: ',
      );

      return data;
    } catch (e) {
      this.logError(e, this.generateModelMetaobject.name);
      return undefined;
    }
  }
}
