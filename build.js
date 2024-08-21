const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

async function build() {
  await esbuild.build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    outdir: path.join(__dirname, "dist"),
    platform: "node",
    target: "node14",
    format: "cjs",
    minify: true,
    sourcemap: true,
  });

  // テンプレートディレクトリをdistにコピー
  fs.cpSync(
    path.join(__dirname, "src", "templates"),
    path.join(__dirname, "dist", "templates"),
    { recursive: true }
  );

  console.log("Build completed successfully!");
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
