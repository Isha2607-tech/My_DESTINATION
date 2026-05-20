import fs from 'fs';
import path from 'path';

const searchDir = 'd:/companyfolder/My_DESTINATION/frontend/src';

function searchFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      searchFiles(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('base') && content.includes('type')) {
        // Look for occurrences of keys like base and type in objects
        // Or look for something specific
        if (content.includes('base:') && content.includes('type:')) {
          console.log("MATCH (both keys found):", filePath);
        } else if (content.includes('base,') && content.includes('type,')) {
          console.log("MATCH (variables base, type found):", filePath);
        }
      }
    }
  }
}

searchFiles(searchDir);
