import ExcelJS from 'exceljs';

export type ProductModelType = {
  productSKU: number | null;
  productName: string;
  productType: string;
  models: string[];
  handle?: string;
};

export class Parser {
  private media = [];

  async parse(path: string) {
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.readFile(path);
    // Extract models sheet
    const models = this.extractModels(workbook);
    const productModelsMapping = this.extractProductModelsMapping(workbook);

    return { models, productModelsMapping };
  }

  private extractModels(workbook: ExcelJS.Workbook) {
    const worksheet = workbook.getWorksheet('MODEL SIZE');

    if (!worksheet) throw new Error('Unable to parse worksheet!');

    this.media = (workbook as any).media;

    const json = this.modelSheetToJson(worksheet);

    return json;
  }

  private modelSheetToJson(worksheet: ExcelJS.Worksheet) {
    const json: Array<Record<string, any>> = [];
    const modelNames: string[] = [];

    // Extract model names from row 2 (columns D onwards)
    for (let col = 4; col <= worksheet.columnCount - 1; col++) {
      const cell = worksheet.getCell(2, col);

      modelNames.push(cell.value ? String(cell.value) : `Model-${col}`);
    }

    const imageMap = this.extractImages(worksheet);

    // Iterate through models
    for (let modelIndex = 0; modelIndex < modelNames.length; modelIndex++) {
      const modelCol = 4 + modelIndex;
      const modelData: Record<string, any> = {
        'Model Name': modelNames[modelIndex],
      };

      // Look up image by modelCol (0-based = modelCol - 1)
      const image = imageMap[modelCol - 1];
      if (image) {
        modelData['thumbnail'] = image.data;
      }

      // Extract attributes (rows 3+)
      for (let row = 3; row <= worksheet.rowCount; row++) {
        const attributeCell = worksheet.getCell(row, 1);
        const valueCell = worksheet.getCell(row, modelCol);

        if (attributeCell.value) {
          modelData[String(attributeCell.value)] = valueCell.value ?? null;
        }
      }

      json.push(modelData);
    }

    return json;
  }

  private extractImages(
    worksheet: ExcelJS.Worksheet,
  ): Record<string, { imageId: number; data: string }> {
    const imageMap: Record<string, { imageId: number; data: string }> = {};
    const media = worksheet.getImages();

    // Create a map of imageId to base64
    media.forEach((m) => {
      if (!isNaN((m as any).imageId)) {
        const key = m.range.tl.nativeCol;
        const matchedMedia: any = this.media.find(
          (_media) => (_media as any).index == m.imageId,
        );

        if (matchedMedia) {
          const imageBuffer = matchedMedia.buffer;
          const mimeType = `${matchedMedia.type}/${matchedMedia.extension}`;
          const base64 = Buffer.from(imageBuffer).toString('base64');
          imageMap[key] = {
            imageId: (m as any).imageId,
            data: `data:${mimeType};base64,${base64}`,
          };
        } else {
          console.log('Media not found for: ' + m.imageId);
        }
      }
    });

    return imageMap;
  }

  extractProductModelsMapping(workbook: ExcelJS.Workbook): ProductModelType[] {
    const worksheet = workbook.getWorksheet('MODEL SIZE TAGGING');
    if (!worksheet)
      throw new Error('Unable to parse worksheet for product models mapping!');

    const json: ProductModelType[] = [];

    // Start from row 2 to skip the header row
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const skuModel = row.getCell(1).value; // Column A: SKU Model
      const productName = row.getCell(2).value; // Column B: Product Name
      const productType = row.getCell(3).value; // Column C: Product Type
      const humanModel = row.getCell(4).value; // Column E: Human Model

      // Skip empty rows
      if (!skuModel && !productName) return;

      // Normalize human model: split multi-line values into an array
      const humanModelRaw = humanModel ? String(humanModel).trim() : '';
      const humanModels = humanModelRaw
        ? humanModelRaw
            .split('\n')
            .map((m) => m.trim())
            .filter((m) => m && m !== '-')
        : [];

      json.push({
        productSKU: skuModel ? Number(skuModel) : null,
        productName: productName ? String(productName).trim() : '',
        productType: productType ? String(productType).trim() : '',
        models: humanModels,
      });
    });

    return json;
  }
}
