import { MetafieldDefinition, OWNER_TYPE } from '../core';

export class CollectionMetafieldDefinition extends MetafieldDefinition {
  constructor() {
    super();
  }

  async generate() {
    console.info(
      '[START] Starting generating collection metafield defination...',
    );

    Promise.all([
      this.generateCreateFitProductFilterConfiguration(),
      this.generateCreateFitNavigationScreenSelectorMapping(),
    ]).finally(() => {
      console.info(
        '[END] Finished generating collection metafield definations!',
      );
    });
  }

  async generateCreateFitProductFilterConfiguration() {
    try {
      console.info(
        '[BEGIN] Generating Navigation Product Filter Configuration metafield defination...',
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

      console.info(
        '[SUCCESS] Feature: Create/Find Fit Navigation Product Filter Configuration metafield defination created successfully! Data: ',
      );
      console.info(data);
    } catch (e) {
      this.logError(e, this.generateCreateFitProductFilterConfiguration.name);
    }
  }

  async generateCreateFitNavigationScreenSelectorMapping() {
    try {
      console.info(
        '[BEGIN] Generating navigation screen selector mapping metafield defination...',
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

      console.info(
        '[SUCCESS] Feature: Create/Find Fit navigation screen selector mapping metafield defination created successfully! Data: ',
      );
      +JSON.stringify(data);
    } catch (e) {
      this.logError(
        e,
        this.generateCreateFitNavigationScreenSelectorMapping.name,
      );
    }
  }
}
