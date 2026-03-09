import path from 'path';

import { Logger } from '@/utils/logger';
import { Parser, ProductModelType } from '../../utils/parser/xlsx-parser';
import { ModelEntries } from './entries/models';
// import { ModelEntries } from './entries/models';

(async () => {
  const filePath = path.join(
    __dirname,
    '../../files',
    'IMINXX FULL Products.xlsx',
  );

  const { productModelsMapping, models } = await new Parser().parse(filePath);

  const modelEntries = new ModelEntries();

  // For Testing you can passed this array as parameter in assignToProducts method to visualize the adding of metafield in product models
  const modelTest: ProductModelType[] = [
    {
      productSKU: 12020188,
      models: ['Karen'],
      productName: 'Seamless Bikini Cheeky',
      handle: 'seamless-bikini-cheeky',
      productType: 'bra',
    },
  ];

  // load the models first to create their respective metaobject reference before assigning them to products
  modelEntries
    .load(models)
    .then(async () => {
      // once the task is finished we now assign models to products mapping
      await modelEntries.assignToProductsByHandle(productModelsMapping);
    })
    .catch((e) => {
      Logger.error('Loading entries error: ' + e?.message || e);
    });
})();
