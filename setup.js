const fs = require('fs');
const path = require('path');

// Function to copy a directory recursively
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyDir(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Function to copy a file if it exists
function copyFileIfExists(src, dest) {
  if (fs.existsSync(src)) {
    // Create destination directory if it doesn't exist
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Copy the file
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} to ${dest}`);
  } else {
    console.log(`Warning: ${src} does not exist, skipping`);
  }
}

// Copy src directory from business-ai-simulator to root
const srcDir = path.join(__dirname, 'business-ai-simulator', 'src');
const destDir = path.join(__dirname, 'src');

console.log(`Copying files from ${srcDir} to ${destDir}...`);
copyDir(srcDir, destDir);

// Copy specific configuration files
console.log('Copying configuration files...');

// Copy next.config.js if it exists in the business-ai-simulator directory
copyFileIfExists(
  path.join(__dirname, 'business-ai-simulator', 'next.config.js'),
  path.join(__dirname, 'next.config.js')
);

// Copy tsconfig.json if it exists in the business-ai-simulator directory
copyFileIfExists(
  path.join(__dirname, 'business-ai-simulator', 'tsconfig.json'),
  path.join(__dirname, 'tsconfig.json')
);

// Copy postcss.config.js if it exists in the business-ai-simulator directory
copyFileIfExists(
  path.join(__dirname, 'business-ai-simulator', 'postcss.config.js'),
  path.join(__dirname, 'postcss.config.js')
);

// Copy tailwind.config.js if it exists in the business-ai-simulator directory
copyFileIfExists(
  path.join(__dirname, 'business-ai-simulator', 'tailwind.config.js'),
  path.join(__dirname, 'tailwind.config.js')
);

console.log('Setup completed successfully!');
