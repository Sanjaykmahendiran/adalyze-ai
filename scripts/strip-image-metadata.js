/**
 * Script to strip metadata from images to reduce file size
 * This removes EXIF data, color profiles, and other unnecessary metadata
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Directories to process
const imageDirs = [
  path.join(__dirname, "../src/assets"),
  path.join(__dirname, "../public"),
];

// Supported image formats
const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

/**
 * Recursively find all image files in a directory
 */
function findImages(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findImages(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Strip metadata from an image — Windows-safe version
 */
async function stripMetadata(imagePath) {
  const tempPath = imagePath + ".tmp";

  try {
    const originalSize = fs.statSync(imagePath).size;

    // Force remove read-only/locked attributes
    try {
      fs.chmodSync(imagePath, 0o666);
    } catch {}

    // Write optimized image to temp file
    await sharp(imagePath).withMetadata({}).toFile(tempPath);

    // Retry system to handle temp locks
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        // Try atomic copy
        fs.copyFileSync(tempPath, imagePath);
        fs.unlinkSync(tempPath);
        break;
      } catch (err) {
        attempts++;
        await new Promise((res) => setTimeout(res, 150)); // wait & retry
      }
    }

    if (attempts === maxAttempts) {
      console.error(`❌ FORCE FAILED: ${imagePath}`);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return null;
    }

    const newSize = fs.statSync(imagePath).size;
    const saved = originalSize - newSize;
    const percentSaved = ((saved / originalSize) * 100).toFixed(2);

    console.log(
      `✓ ${path.basename(imagePath)}: ${(originalSize / 1024).toFixed(2)}KB → ${(newSize / 1024).toFixed(2)}KB (saved ${percentSaved}%)`
    );

    return { saved, percentSaved };
  } catch (error) {
    console.error(`✗ Error processing ${imagePath}:`, error.message);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    return null;
  }
}


/**
 * Main function
 */
async function main() {
  console.log("🖼️  Starting image metadata stripping...\n");

  let totalImages = 0;
  let totalSaved = 0;
  const results = [];

  // Find all images
  for (const dir of imageDirs) {
    const images = findImages(dir);
    totalImages += images.length;

    for (const imagePath of images) {
      const result = await stripMetadata(imagePath);
      if (result) {
        totalSaved += result.saved;
        results.push({ path: imagePath, ...result });
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`📊 Summary:`);
  console.log(`   Images processed: ${totalImages}`);
  console.log(
    `   Total space saved: ${(totalSaved / 1024).toFixed(2)}KB (${(
      totalSaved /
      1024 /
      1024
    ).toFixed(2)}MB)`
  );

  console.log(
    `   Average reduction: ${
      results.length > 0
        ? (
            results.reduce(
              (sum, r) => sum + parseFloat(r.percentSaved),
              0
            ) / results.length
          ).toFixed(2)
        : 0
    }%`
  );

  console.log("=".repeat(60));
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { stripMetadata, findImages };
