import { Logger } from '@/utils/logger';
import { CollectionMetafieldDefinition } from './metafield/collection';
import { CustomerMetafieldDefinition } from './metafield/customer';
import { ProductMetafieldDefinition } from './metafield/product';
import { ShopMetafieldDefinition } from './metafield/shop';
import { MetaobjectDefinitionGenerator } from './metaobject';

(async () => {
  new MetaobjectDefinitionGenerator()
    .generate()
    .then(async ({ promoDetailsMetaobject, modelMetaobject }) => {
      // run metafield generation after metaobject has successfully created
      const generators = [
        new CustomerMetafieldDefinition(),
        new CollectionMetafieldDefinition(),
        new ProductMetafieldDefinition(),
        new ShopMetafieldDefinition(),
      ];

      for (const generator of generators) {
        if (generator instanceof ShopMetafieldDefinition) {
          await generator.generate({ promoDetailsMetaobject });
        } else if (generator instanceof ProductMetafieldDefinition) {
          await generator.generate({ modelMetaobject });
        } else {
          await generator.generate();
        }
      }

      Logger.custom('Finished generating metafield definition', {
        type: 'FINISHED',
        color: 'CYAN',
        mode: 'background',
      });
    });
})();
