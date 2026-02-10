import { MetaobjectDefinitionGenerator } from './setup-metaobject';

(async () => {
  new MetaobjectDefinitionGenerator().generate().then(() => {
    // run metafield generation after metaobject has successfully created
  });
})();
