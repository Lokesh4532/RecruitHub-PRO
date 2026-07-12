const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.js') || name.endsWith('.ts')) {
      files.push(name);
    }
  }
  return files;
}

const files = getFiles('/home/lokesh/Downloads/RecruitHirePro-main/app/api');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('next/headers') && content.includes('cookies')) {
    if (!content.includes('export const dynamic')) {
      // Find the last import statement
      const lines = content.split('\n');
      let lastImportIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIdx = i;
        }
      }
      
      lines.splice(lastImportIdx + 1, 0, "\nexport const dynamic = 'force-dynamic';\n");
      fs.writeFileSync(file, lines.join('\n'), 'utf8');
      console.log('Added to', file);
    }
  }
}
