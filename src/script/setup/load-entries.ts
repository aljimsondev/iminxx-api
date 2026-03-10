import { Logger } from '@/utils/logger';
import fs from 'fs';
import path from 'path';
import { Parser, ProductModelType } from '../../utils/parser/xlsx-parser';
import { ModelEntries } from './entries/models';

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
      models: ['Katie'],
      productName: 'Ooom-pha-licous Scallop 2-Way Wireless Super Push Up Bra',
      handle:
        'ooom-pha-licous-scallop-2-way-wireless-super-push-up-bra-in-nude',
      productType: 'bra',
    },
  ];

  // return await modelEntries.assignToProductsByTitle(modelTest);

  // load the models first to create their respective metaobject reference before assigning them to products
  modelEntries
    .load(models)
    .then(async () => {
      // once the task is finished we now assign models to products mapping
      await modelEntries.assignToProductsByTitle(productModelsMapping);
    })
    .then(async () => {
      Logger.info('Checking for failed products for retries...');

      while (fs.existsSync('failed_products.json')) {
        const failedProducts = JSON.parse(
          fs.readFileSync('failed_products.json', 'utf-8'),
        );

        if (failedProducts.length === 0) {
          fs.unlinkSync('failed_products.json');
          break;
        }

        Logger.custom(`Retrying ${failedProducts.length} failed products...`, {
          type: 'START',
          color: 'MAGENTA',
          mode: 'background',
        });

        // Delete before retrying so new failures write a fresh file
        fs.unlinkSync('failed_products.json');

        await modelEntries.assignToProductsByTitle(failedProducts);

        Logger.custom('Retry batch finished!', {
          type: 'FINISHED',
          color: 'CYAN',
          mode: 'background',
        });
      }

      Logger.info('All products processed, no more failed retries.');
    })
    .catch((e) => {
      Logger.error('Loading entries error: ' + e?.message || e);
    });
})();
