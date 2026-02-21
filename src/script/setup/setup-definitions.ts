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
