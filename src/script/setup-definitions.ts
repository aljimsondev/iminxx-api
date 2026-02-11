import {
  CollectionMetafieldDefinition,
  CustomerMetafieldDefinition,
  ProductMetafieldDefinition,
  ShopMetafieldDefinition,
} from './setup-metafield';
import { MetaobjectDefinitionGenerator } from './setup-metaobject';

(async () => {
  new MetaobjectDefinitionGenerator()
    .generate()
    .then(async ({ promoDetailsMetaobject, modelMetaobject }) => {
      // run metafield generation after metaobject has successfully created

      await Promise.all([
        new CustomerMetafieldDefinition().generate(),
        new CollectionMetafieldDefinition().generate(),
        new ProductMetafieldDefinition().generate({ modelMetaobject }),
        new ShopMetafieldDefinition().generate({
          promoDetailsMetaobject,
        }),
      ]);
    });
})();
