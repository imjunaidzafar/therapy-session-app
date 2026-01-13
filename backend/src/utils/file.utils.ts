import * as fs from 'fs';
import * as path from 'path';

export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function deleteFile(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

export function generateUniqueFilename(
  originalFilename: string,
  uuid: string,
): string {
  const ext = getFileExtension(originalFilename);
  return `${uuid}${ext}`;
}
