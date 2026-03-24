import path from 'path';
import { Parser } from '../../utils/parser/xlsx-parser';
import { ModelEntries } from './entries/models';

(async () => {
  const filePath = path.join(
    __dirname,
    '../../files',
    'IMINXX FULL Products.xlsx',
  );

  const { productModelsMapping } = await new Parser().parse(filePath);

  const modelEntries = new ModelEntries();

  const productToSearch = [
    'Crushing On Lace Midi Bralette',
    'Minimalist Lightly-Lined Seamless Midi Strapless Wireless Bra V2',
    'Modern Edge Bralette',
    'Basic Cotton Freedom Wireless Bra',
    'Basic Lace Freedom Wireless Bra (Modal® Fabric)',
    '365 Anti-Slip Seamless Strapless Push Up Wireless Bra',
    'Entice Me! V3.0 Seamless Push Up Wireless Bra',
    'Entice Me! V3.0 Seamless Mid-Rise Cheeky',
    'Perk Me Up! V2.0 Seamless Super Push Up Wireless Bra',
    'AIR-SHAPER Super Mid-Rise Seamless Shortie (Gentle Compression)',
    'AIR-SHAPER Super High-Rise Seamless Cheekie (Gentle Compression)',
  ];

  const filteredMapping = productModelsMapping.filter((product) =>
    productToSearch.includes(product.productName),
  );

  await modelEntries.assignToProductsByTitle(filteredMapping);
})();
