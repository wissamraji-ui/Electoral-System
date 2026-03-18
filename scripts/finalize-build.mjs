import { readFile, writeFile } from "node:fs/promises";

const distDir = new URL("../dist/", import.meta.url);
const publicDir = new URL("../public/", import.meta.url);
const manifestPath = new URL("./.vite/manifest.json", distDir);
const indexHtmlPath = new URL("./index.html", distDir);
const publicBuildMetaPath = new URL("./build-meta.json", publicDir);
const distBuildMetaPath = new URL("./build-meta.json", distDir);

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const currentBuildMeta = JSON.parse(await readFile(publicBuildMetaPath, "utf8"));
const entry = manifest["index.html"];

if (!entry?.file) {
  throw new Error("Vite manifest did not include an index.html entry.");
}

const buildMeta = {
  ...currentBuildMeta,
  entryJs: `/${entry.file}`,
  entryCss: Array.isArray(entry.css) && entry.css.length > 0 ? `/${entry.css[0]}` : ""
};

await writeFile(distBuildMetaPath, `${JSON.stringify(buildMeta, null, 2)}\n`, "utf8");
await writeFile(publicBuildMetaPath, `${JSON.stringify(buildMeta, null, 2)}\n`, "utf8");

const indexHtml = await readFile(indexHtmlPath, "utf8");
const assetTagPattern =
  /<script type="module" crossorigin src="[^"]+"><\/script>\s*<link rel="stylesheet" crossorigin href="[^"]+">/;

const bootLoader = `<script>
      (function () {
        var fallbackBuild = ${JSON.stringify(buildMeta)};
        var booted = false;

        function appendStylesheet(href) {
          if (!href) {
            return;
          }

          var link = document.createElement("link");
          link.rel = "stylesheet";
          link.crossOrigin = "";
          link.href = href;
          document.head.appendChild(link);
        }

        function appendModule(src) {
          var script = document.createElement("script");
          script.type = "module";
          script.crossOrigin = true;
          script.src = src;
          document.head.appendChild(script);
        }

        function boot(meta) {
          if (booted || !meta || !meta.entryJs) {
            return;
          }

          booted = true;
          appendStylesheet(meta.entryCss);
          appendModule(meta.entryJs);
        }

        fetch("/build-meta.json?__ts=" + Date.now(), { cache: "no-store" })
          .then(function (response) {
            return response.ok ? response.json() : null;
          })
          .then(function (payload) {
            var latestMeta =
              payload && typeof payload.entryJs === "string" && payload.entryJs.trim()
                ? payload
                : fallbackBuild;

            boot(latestMeta);
          })
          .catch(function () {
            boot(fallbackBuild);
          });
      })();
    </script>`;

if (!assetTagPattern.test(indexHtml)) {
  throw new Error("Unable to find built asset tags in dist/index.html.");
}

await writeFile(indexHtmlPath, indexHtml.replace(assetTagPattern, bootLoader), "utf8");
