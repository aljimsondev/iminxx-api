import ExcelJS from 'exceljs';

export class Parser {
  private media = [];

  async parse(path: string) {
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.readFile(path);
    // Extract models sheet
    const models = this.extractModels(workbook);

    return { models };
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
    for (let col = 4; col <= worksheet.columnCount; col++) {
      const cell = worksheet.getCell(2, col);
      if (cell.value) {
        modelNames.push(String(cell.value));
      }
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
}
