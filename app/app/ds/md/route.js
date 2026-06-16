import path from "node:path";
import { readFile } from "node:fs/promises";

const DESIGN_SYSTEM_DOC_PATH = path.join(process.cwd(), "FxDocs", "Design_System.md");

export async function GET() {
  const markdown = await readFile(DESIGN_SYSTEM_DOC_PATH, "utf8");

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
