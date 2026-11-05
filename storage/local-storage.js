import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function saveFile(file, preloadedBuffer = null) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const extension = path.extname(file.name).toLowerCase();
  const storageKey = `${crypto.randomUUID()}${extension}`;

  const filePath = path.join(UPLOAD_DIR, storageKey);

  const buffer = preloadedBuffer || Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, buffer, { flag: "wx" });

  return storageKey;
}

export async function deleteFile(storageKey) {
  const safeName = path.basename(storageKey);

  if (safeName !== storageKey) {
    throw new Error("Invalid storage key");
  }

  const filePath = path.join(UPLOAD_DIR, safeName);

  await fs.unlink(filePath);
}

export async function getFile(storageKey) {
  const safeName = path.basename(storageKey);

  if (safeName !== storageKey) {
    throw new Error("Invalid storage key");
  }

  const filePath = path.join(UPLOAD_DIR, safeName);

  return fs.readFile(filePath);
}
