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

    // Build header map: { "Product Name": 1, "SKU Model": 2, ... }
    const headerMap: Record<string, number> = {};
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      const header = this.getRichTextValue(cell.value).trim();
      if (header) headerMap[header] = colNumber;
    });

    const getCell = (row: ExcelJS.Row, headerName: string) => {
      const colNumber = headerMap[headerName];
      return colNumber ? row.getCell(colNumber).value : null;
    };

    const json: ProductModelType[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const skuModel = getCell(row, 'SKU Model');
      const productName = this.getRichTextValue(getCell(row, 'Product Name'));
      const productType = this.getRichTextValue(getCell(row, 'Product Type'));
      const humanModel = getCell(row, 'Human Model');

      if (!skuModel && !productName) return;

      const humanModelRaw = humanModel ? String(humanModel).trim() : '';
      const humanModels = humanModelRaw
        ? humanModelRaw
            .split('\n')
            .map((m) => m.trim())
            .filter((m) => m && m !== '-' && m !== 'No model')
        : [];

      json.push({
        productSKU: skuModel ? Number(skuModel) : null,
        productName: productName.trim(),
        productType: productType.trim(),
        models: humanModels,
      });
    });

    return json;
  }

  private getRichTextValue(cellValue: ExcelJS.CellValue): string {
    if (!cellValue) return '';
    if (typeof cellValue === 'object' && 'richText' in cellValue) {
      return cellValue.richText.map((run) => run.text).join('');
    }
    return String(cellValue);
  }
}
