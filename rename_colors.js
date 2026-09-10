const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = {
  'tapsh-green-1': 'tapsh-black',
  'tapsh-green-2': 'tapsh-black',
  'tapsh-green-3': 'tapsh-taupe',
  'tapsh-green-4': 'tapsh-soft-green',
  'tapsh-green-5': 'tapsh-charcoal',
  'tapsh-green-6': 'tapsh-pale-blue',
};

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  for (const [oldClass, newClass] of Object.entries(replacements)) {
    // Replace all occurrences of the old class
    const regex = new RegExp(oldClass, 'g');
    newContent = newContent.replace(regex, newClass);
  }

  // Quick fix: if text-tapsh-pale-blue is used as text color on light backgrounds, it might be unreadable.
  // We'll leave it for now and fix manually.

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      replaceInFile(fullPath);
    }
  });
}

console.log('Starting mass class replacement...');
processDirectory(directoryPath);
console.log('Finished mass class replacement.');
