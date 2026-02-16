import { read, utils, WorkBook, WorkSheet } from 'xlsx';

export class Parser {
  async loadWorkbookFromFile(file: File) {
    const buffer = await file.arrayBuffer();
    const data = read(buffer);

    return data;
  }

  loadSheet(data: WorkBook, sheetName: string) {
    if (!sheetName) throw new Error('Missing sheetName parameter!');

    const sheet = data.Sheets[sheetName];

    if (!sheet) throw new Error('Unable to get sheet with name ' + sheetName);

    return sheet;
  }

  sheetToJson(
    sheet: WorkSheet,
    options: {
      rowStart: number;
      colStart: number;
    },
  ) {
    const { rowStart = 2, colStart = 3 } = options;
    // Get all cell references in the sheet
    const range = utils.decode_range(sheet['!ref'] || 'A1');

    const json: Array<Record<string, unknown>> = [];

    // Extract model names from the first row (starting from column C)
    const modelNames: string[] = [];
    for (let col = range.s.c + rowStart; col <= range.e.c; col++) {
      const modelCell = sheet[utils.encode_cell({ r: rowStart, c: col })]; // Row 2 has model names
      const modelName = modelCell?.v;
      if (modelName) {
        modelNames.push(modelName);
      }
    }

    // Iterate through model names and create objects
    for (let modelIndex = 0; modelIndex < modelNames.length; modelIndex++) {
      const modelData: Record<string, unknown> = {
        'Model Name': modelNames[modelIndex],
      };

      const modelCol = range.s.c + colStart + modelIndex;

      // Iterate through rows to get attributes for this model
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        const attributeCell =
          sheet[utils.encode_cell({ r: row, c: range.s.c })];
        const valueCell = sheet[utils.encode_cell({ r: row, c: modelCol })];

        const attributeName = attributeCell?.v;
        const attributeValue = valueCell?.v;

        if (attributeName) {
          modelData[attributeName] = attributeValue ?? null;
        }
      }

      json.push(modelData);
    }

    return json;
  }
}
