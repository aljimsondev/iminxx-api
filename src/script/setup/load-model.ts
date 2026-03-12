import { Logger } from '@/utils/logger';
import path from 'path';
import { Parser } from '../../utils/parser/xlsx-parser';
import { ModelEntries } from './entries/models';

(async () => {
  const filePath = path.join(
    __dirname,
    '../../files',
    'IMINXX FULL Products.xlsx',
  );

  const { models } = await new Parser().parse(filePath);

  const modelEntries = new ModelEntries();

  // load the models first to create their respective metaobject reference before assigning them to products
  modelEntries.load(models).catch((e) => {
    Logger.error('Loading model entries error: ' + e?.message || e);
  });
})();
