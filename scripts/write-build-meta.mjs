import { mkdir, writeFile } from "node:fs/promises";

const buildId = `build-${Date.now()}`;
const generatedDir = new URL("../src/generated/", import.meta.url);
const publicDir = new URL("../public/", import.meta.url);

await mkdir(generatedDir, { recursive: true });
await mkdir(publicDir, { recursive: true });

const moduleContents = `export const BUILD_ID = ${JSON.stringify(buildId)};\n`;
const jsonContents = `${JSON.stringify({ buildId }, null, 2)}\n`;

await writeFile(new URL("build-meta.js", generatedDir), moduleContents, "utf8");
await writeFile(new URL("build-meta.json", publicDir), jsonContents, "utf8");
