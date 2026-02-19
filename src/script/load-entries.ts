import path from 'path';
import { Parser } from '../utils/parser/xlsx-parser';
import { ModelEntries } from './entries/models';

(async () => {
  const filePath = path.join(
    __dirname,
    '../../files',
    'IMINXX FULL Products.xlsx',
  );

  const { models } = await new Parser().parse(filePath);

  await new ModelEntries().load(models);
})();
