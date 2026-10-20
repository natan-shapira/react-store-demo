interface CompressImageOptions {
  maxSize?: number;
  quality?: number;
}

export async function compressImage(
  file: File,
  { maxSize = 150, quality = 0.8 }: CompressImageOptions = {}
): Promise<string> {
  const bitmap = await createImageBitmap(file);

  try {
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not supported");
    }

    // JPEG has no alpha channel, so transparent areas would otherwise turn black
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    bitmap.close();
  }
}
