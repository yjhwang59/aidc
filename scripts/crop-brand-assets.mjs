import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SOURCE_CANDIDATES = [
  path.join(ROOT, "public/brand/source-brand-sheet.png"),
  path.join(
    ROOT,
    "../.cursor/projects/c-Users-JackH-aidc-work/assets/c__Users_JackH_AppData_Roaming_Cursor_User_workspaceStorage_1e7d4835f54d85b3304bc7fd16dec24b_images_aidc-banner-logo-favicon-fc41d26d-a13b-418e-a767-9bd5544ba8f0.png",
  ),
];

/** Crop regions as fractions of source width/height [left, top, right, bottom] */
const REGIONS = {
  banner: [0, 0.045, 1, 0.575],
  logoColor: [0.02, 0.685, 0.34, 0.995],
  logoVariants: [0.348, 0.69, 0.482, 0.84],
};

function toPixels([left, top, right, bottom], width, height, square = false) {
  const x = Math.round(left * width);
  const y = Math.round(top * height);
  let w = Math.round((right - left) * width);
  let h = Math.round((bottom - top) * height);
  if (square) {
    const size = Math.min(w, h);
    w = size;
    h = size;
  }
  return { left: x, top: y, width: w, height: h };
}

async function resolveSourcePath() {
  for (const candidate of SOURCE_CANDIDATES) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // try next
    }
  }
  throw new Error(
    "Source brand sheet not found. Copy it to public/brand/source-brand-sheet.png",
  );
}

async function cropRegion(source, region, outputPath, options = {}) {
  const meta = await source.metadata();
  const box = toPixels(region, meta.width, meta.height, options.square);

  let pipeline = source.clone().extract(box);

  if (options.resize) {
    pipeline = pipeline.resize(options.resize.width, options.resize.height, {
      fit: options.resize.fit ?? "cover",
    });
  }

  if (options.format === "jpeg") {
    pipeline = pipeline.jpeg({ quality: 88, mozjpeg: true });
  } else {
    pipeline = pipeline.png({ compressionLevel: 9 });
  }

  await pipeline.toFile(outputPath);
  const outMeta = await sharp(outputPath).metadata();
  console.log(`  ${path.basename(outputPath)} → ${outMeta.width}x${outMeta.height}`);
}

async function main() {
  const brandDir = path.join(ROOT, "public/brand");
  const appDir = path.join(ROOT, "app");

  await fs.mkdir(brandDir, { recursive: true });

  const sourcePath = await resolveSourcePath();
  console.log(`Source: ${sourcePath}`);

  if (sourcePath !== path.join(brandDir, "source-brand-sheet.png")) {
    await fs.copyFile(
      sourcePath,
      path.join(brandDir, "source-brand-sheet.png"),
    );
    console.log("Copied source to public/brand/source-brand-sheet.png");
  }

  const source = sharp(sourcePath);
  const meta = await source.metadata();
  console.log(`Dimensions: ${meta.width}x${meta.height}\n`);

  console.log("Cropping assets:");
  await cropRegion(source, REGIONS.banner, path.join(brandDir, "banner.jpg"), {
    resize: { width: 1920, height: 600 },
    format: "jpeg",
  });
  await cropRegion(
    source,
    REGIONS.logoColor,
    path.join(brandDir, "logo-color.png"),
  );

  const variantsTempPath = path.join(brandDir, "logo-variants-temp.png");
  await cropRegion(source, REGIONS.logoVariants, variantsTempPath);
  const variantsMeta = await sharp(variantsTempPath).metadata();
  const variantSplit = Math.round(variantsMeta.height * 0.47);
  await sharp(variantsTempPath)
    .extract({
      left: 0,
      top: 0,
      width: variantsMeta.width,
      height: variantSplit,
    })
    .png()
    .toFile(path.join(brandDir, "logo-white-dark.png"));
  await sharp(variantsTempPath)
    .extract({
      left: 0,
      top: variantSplit,
      width: variantsMeta.width,
      height: variantsMeta.height - variantSplit,
    })
    .png()
    .toFile(path.join(brandDir, "logo-mono.png"));
  await fs.unlink(variantsTempPath);
  console.log(`  logo-white-dark.png → ${variantsMeta.width}x${variantSplit}`);
  console.log(
    `  logo-mono.png → ${variantsMeta.width}x${variantsMeta.height - variantSplit}`,
  );

  const logoColorPath = path.join(brandDir, "logo-color.png");
  const iconSourcePath = path.join(brandDir, "icon-source.png");

  const logoMeta = await sharp(logoColorPath).metadata();
  const markSize = Math.min(
    Math.round(logoMeta.width * 0.72),
    logoMeta.height,
  );
  await sharp(logoColorPath)
    .extract({
      left: Math.round((logoMeta.width - markSize) / 2),
      top: 0,
      width: markSize,
      height: markSize,
    })
    .png()
    .toFile(iconSourcePath);
  console.log(`  icon-source.png → ${markSize}x${markSize} (from logo mark)`);

  const iconSource = sharp(iconSourcePath);
  console.log("\nGenerating icon sizes:");
  for (const size of [16, 32, 512]) {
    const out = path.join(brandDir, `icon-${size}.png`);
    await iconSource
      .clone()
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(out);
    console.log(`  icon-${size}.png`);
  }

  await fs.unlink(iconSourcePath);

  console.log("\nGenerating app icons:");
  await sharp(path.join(brandDir, "icon-512.png"))
    .resize(180, 180)
    .png()
    .toFile(path.join(appDir, "apple-icon.png"));
  console.log("  app/apple-icon.png (180x180)");

  await sharp(path.join(brandDir, "icon-32.png"))
    .png()
    .toFile(path.join(appDir, "icon.png"));
  console.log("  app/icon.png (32x32)");

  await sharp(path.join(brandDir, "icon-32.png"))
    .png()
    .toFile(path.join(appDir, "favicon.ico"));
  console.log("  app/favicon.ico (32x32 PNG)");

  console.log("\nDone. Assets saved to public/brand/ and app/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
