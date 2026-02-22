import { Logger } from '@/utils/logger';
import { MetafieldDefinition, OWNER_TYPE } from '../core';

export class CollectionMetafieldDefinition extends MetafieldDefinition {
  constructor() {
    super();
  }

  async generate() {
    Logger.custom('Starting generating collection metafield definition...', {
      type: 'START',
      mode: 'background',
      color: 'MAGENTA',
    });

    Promise.all([
      this.generateCreateFitProductFilterConfiguration(),
      this.generateCreateFitNavigationScreenSelectorMapping(),
    ]).finally(() => {
      Logger.custom('Finished generating collection metafield definitions!', {
        type: 'END',
        mode: 'background',
        color: 'BLACK',
      });
    });
  }

  async generateCreateFitProductFilterConfiguration() {
    try {
      Logger.custom(
        'Generating Navigation Product Filter Configuration metafield definition...',
        {
          type: 'BEGIN',
          mode: 'background',
          color: 'WHITE',
        },
      );

      const { success, data, errors } = await this.create({
        name: 'Feature: Create/Find Fit Navigation Product Selector Filter Configuration',
        namespace: 'custom',
        key: 'navigation_product_filter_configuration',
        description:
          'Defines which product attributes are available for filtering with their labels, images, and collection handle.',
        type: 'json',
        ownerType: OWNER_TYPE.COLLECTION,
        pin: true,
      });

      if (!success) throw errors;

      Logger.success(
        'Feature: Create/Find Fit Navigation Product Filter Configuration metafield definition created successfully! Data: ' +
          JSON.stringify(data, null, 2),
      );
    } catch (e) {
      this.logError(e, this.generateCreateFitProductFilterConfiguration.name);
    }
  }

  async generateCreateFitNavigationScreenSelectorMapping() {
    try {
      Logger.custom(
        'Generating navigation screen selector mapping metafield definition...',
        {
          type: 'BEGIN',
          mode: 'background',
          color: 'WHITE',
        },
      );

      const { success, data, errors } = await this.create({
        name: 'Feature: Create/Find Fit Navigation Screen Selector Mapping',
        namespace: 'custom',
        key: 'navigation_screen_selector_mapping',
        description:
          'Navigation screen mapping used for metafield filter configuration',
        type: 'json',
        ownerType: OWNER_TYPE.COLLECTION,
        pin: true,
      });

      if (!success) throw errors;

      Logger.success(
        'Feature: Create/Find Fit navigation screen selector mapping metafield definition created successfully! Data: ' +
          JSON.stringify(data, null, 2),
      );
    } catch (e) {
      this.logError(
        e,
        this.generateCreateFitNavigationScreenSelectorMapping.name,
      );
    }
  }
}
