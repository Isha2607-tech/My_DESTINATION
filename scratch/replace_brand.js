const fs = require('fs');
const path = require('path');

const targetDir = 'd:\\companyfolder\\My_DESTINATION\\frontend\\src';
const publicDir = 'd:\\companyfolder\\My_DESTINATION\\frontend\\public';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  // Emails
  { regex: /admin@rukkoo\.in/gi, replacement: 'admin@mydestination.in' },
  { regex: /hr@rukko\.in/gi, replacement: 'hr@mydestination.in' },
  { regex: /rukkoohub@gmail\.com/gi, replacement: 'mydestinationhub@gmail.com' },
  
  // Domains and specific full names
  { regex: /Rukkoo\.in/gi, replacement: 'My DESTINATION' },
  { regex: /rukkoo\.in/gi, replacement: 'mydestination.in' },
  { regex: /rukko\.in/gi, replacement: 'mydestination.in' },
  { regex: /Rukkoo In/gi, replacement: 'My DESTINATION' },
  { regex: /RukkooIn/gi, replacement: 'My DESTINATION' },
  
  // Specific Hub names
  { regex: /Rukkoo Hub/gi, replacement: 'My DESTINATION Hub' },
  { regex: /Rukko Hub/gi, replacement: 'My DESTINATION Hub' },

  // Base names
  { regex: /Rukkoin/g, replacement: 'My DESTINATION' },
  { regex: /rukkoin/g, replacement: 'mydestination' },
  
  { regex: /Rukkoo/g, replacement: 'My DESTINATION' },
  { regex: /rukkoo/g, replacement: 'mydestination' },
  
  { regex: /Rukko/g, replacement: 'My DESTINATION' },
  { regex: /rukko/g, replacement: 'mydestination' },
  
  { regex: /Ruko/g, replacement: 'My DESTINATION' }, // For "Ruko, Book Karo" -> "My DESTINATION, Book Karo"
];

const exclusions = [
  'rukkooin-39480',
  'com.rukkoin.user',
  'com.rukkoin.partner'
];

let changedFiles = 0;

function processFile(filePath) {
  // Only process standard text files
  if (!filePath.match(/\.(js|jsx|ts|tsx|json|html|css|md)$/i)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // We want to avoid replacing within exclusions
  // A hacky way: replace exclusions with placeholders, do replacement, put exclusions back
  let placeholders = {};
  exclusions.forEach((ex, i) => {
    let placeholder = `__EXCLUSION_${i}__`;
    placeholders[placeholder] = ex;
    content = content.split(ex).join(placeholder);
  });

  replacements.forEach(rule => {
    content = content.replace(rule.regex, rule.replacement);
  });

  // Restore exclusions
  Object.keys(placeholders).forEach(placeholder => {
    content = content.split(placeholder).join(placeholders[placeholder]);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
    changedFiles++;
  }
}

walkDir(targetDir, processFile);
if (fs.existsSync(publicDir)) {
  walkDir(publicDir, processFile);
}

console.log(`Done. Changed ${changedFiles} files.`);
