import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { cmsDemoPageSchema, type CmsDemoPage } from "./cms-demo.schema";

export const CMS_DEMO_FILE = path.resolve(process.cwd(), process.env.CMS_DEMO_STORE_FILE || ".demo-data/cms-pages.json");
const storeSchema = z.array(cmsDemoPageSchema);
export async function readCmsDemoPages(): Promise<CmsDemoPage[]> {
  try {
    return storeSchema.parse(JSON.parse(await readFile(CMS_DEMO_FILE, "utf8")));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
}
export async function writeCmsDemoPages(pages: CmsDemoPage[]): Promise<void> {
  await mkdir(path.dirname(CMS_DEMO_FILE), { recursive: true });
  const temporaryFile = `${CMS_DEMO_FILE}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(storeSchema.parse(pages), null, 2), "utf8");
  await rename(temporaryFile, CMS_DEMO_FILE);
}
