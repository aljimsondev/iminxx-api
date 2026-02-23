export class FileParser {
  base64ToFile({
    base64,
    filename,
    mimeType,
  }: {
    base64: string;
    filename: string;
    mimeType: string;
  }) {
    const byteString = atob(base64.split(',')[1] ?? base64);
    const byteArray = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
  }
}
