import { Logger } from '@/utils/logger';
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
    Logger.custom('Starting generating metaobject definitions...', {
      type: 'START',
      mode: 'background',
      color: 'MAGENTA',
    });

    const [promoDetailsMetaobject, modelMetaobject] = await Promise.all([
      this.generateCustomDiscountDetailsMetaobject(),
      this.generateModelMetaobject(),
    ]);

    Logger.custom('Finished generating metaobject definitions!', {
      type: 'END',
      mode: 'background',
      color: 'CYAN',
    });

    return {
      promoDetailsMetaobject,
      modelMetaobject,
    };
  }
  async generateCustomDiscountDetailsMetaobject() {
    try {
      Logger.custom(
        'Generating custom discount details metaobject definition...',
        {
          type: 'BEGIN',
          mode: 'background',
          color: 'WHITE',
        },
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

        Logger.info('Product Model already exist, skipping...');
        Logger.custom('Getting Custom Discount Details metaobject...', {
          type: 'PULLING',
          color: 'WHITE',
          mode: 'background',
        });
        const {
          data: existingMetaobject,
          success: found,
          errors: metaobjectErrors,
        } = await this.findByType(type);

        if (!found) throw metaobjectErrors;

        Logger.success('Retrieved Custom Discount Details metaobject...');
        return existingMetaobject;
      }

      Logger.success(
        '[Feature: Custom discount details metaobject definition created successfully! Data: ' +
          JSON.stringify(data, null, 2),
      );
      return data;
    } catch (e) {
      this.logError(e, this.generateCustomDiscountDetailsMetaobject.name);
      return undefined;
    }
  }

  async generateModelMetaobject() {
    try {
      Logger.custom('Generating models metaobject definition...', {
        type: 'BEGIN',
        mode: 'background',
        color: 'WHITE',
      });
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

        Logger.info('Product Model already exist, proceeding next step...');

        Logger.custom('Getting Product Model metaobject...', {
          type: 'PULLING',
          color: 'WHITE',
          mode: 'background',
        });

        const {
          data: existingMetaobject,
          success: found,
          errors: metaobjectErrors,
        } = await this.findByType(type);

        if (!found) throw metaobjectErrors;

        Logger.success('Retrieved Product Model metaobject...');
        return existingMetaobject;
      }

      Logger.success(
        'Feature: Models metaobject definition created successfully! Data: ' +
          JSON.stringify(data, null, 2),
      );

      return data;
    } catch (e) {
      this.logError(e, this.generateModelMetaobject.name);
      return undefined;
    }
  }
}
