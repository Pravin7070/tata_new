const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'src');

const replacements = [
  { match: /(^|\\s|["'\`])text-4xl(\\s|["'\`]|$)/g, replacement: '$1text-3xl$2' },
  { match: /(^|\\s|["'\`])text-3xl(\\s|["'\`]|$)/g, replacement: '$1text-2xl$2' },
  { match: /(^|\\s|["'\`])text-2xl(\\s|["'\`]|$)/g, replacement: '$1text-xl$2' },
  { match: /(^|\\s|["'\`])text-xl(\\s|["'\`]|$)/g, replacement: '$1text-lg$2' },
  { match: /(^|\\s|["'\`])text-lg(\\s|["'\`]|$)/g, replacement: '$1text-base$2' },
  { match: /(^|\\s|["'\`])text-base(\\s|["'\`]|$)/g, replacement: '$1text-sm$2' },
  { match: /(^|\\s|["'\`])gap-12(\\s|["'\`]|$)/g, replacement: '$1gap-8$2' },
  { match: /(^|\\s|["'\`])gap-10(\\s|["'\`]|$)/g, replacement: '$1gap-8$2' },
  { match: /(^|\\s|["'\`])gap-8(\\s|["'\`]|$)/g, replacement: '$1gap-6$2' },
  { match: /(^|\\s|["'\`])gap-6(\\s|["'\`]|$)/g, replacement: '$1gap-4$2' },
  { match: /(^|\\s|["'\`])gap-5(\\s|["'\`]|$)/g, replacement: '$1gap-4$2' },
  { match: /(^|\\s|["'\`])gap-4(\\s|["'\`]|$)/g, replacement: '$1gap-3$2' },
  { match: /(^|\\s|["'\`])p-8(\\s|["'\`]|$)/g, replacement: '$1p-6$2' },
  { match: /(^|\\s|["'\`])p-6(\\s|["'\`]|$)/g, replacement: '$1p-4$2' },
  { match: /(^|\\s|["'\`])p-5(\\s|["'\`]|$)/g, replacement: '$1p-4$2' },
  { match: /(^|\\s|["'\`])sm:p-8(\\s|["'\`]|$)/g, replacement: '$1sm:p-6$2' },
  { match: /(^|\\s|["'\`])sm:p-6(\\s|["'\`]|$)/g, replacement: '$1sm:p-4$2' },
  { match: /(^|\\s|["'\`])px-8(\\s|["'\`]|$)/g, replacement: '$1px-6$2' },
  { match: /(^|\\s|["'\`])py-8(\\s|["'\`]|$)/g, replacement: '$1py-6$2' },
  { match: /(^|\\s|["'\`])px-6(\\s|["'\`]|$)/g, replacement: '$1px-4$2' },
  { match: /(^|\\s|["'\`])py-6(\\s|["'\`]|$)/g, replacement: '$1py-4$2' },
  { match: /(^|\\s|["'\`])h-16(\\s|["'\`]|$)/g, replacement: '$1h-12$2' },
  { match: /(^|\\s|["'\`])h-14(\\s|["'\`]|$)/g, replacement: '$1h-11$2' },
  { match: /(^|\\s|["'\`])h-12(\\s|["'\`]|$)/g, replacement: '$1h-10$2' },
  { match: /(^|\\s|["'\`])w-72(\\s|["'\`]|$)/g, replacement: '$1w-64$2' },
  { match: /(^|\\s|["'\`])w-6(\\s|["'\`]|$)/g, replacement: '$1w-5$2' },
  { match: /(^|\\s|["'\`])h-6(\\s|["'\`]|$)/g, replacement: '$1h-5$2' },
  { match: /(^|\\s|["'\`])rounded-2xl(\\s|["'\`]|$)/g, replacement: '$1rounded-xl$2' },
  { match: /(^|\\s|["'\`])rounded-3xl(\\s|["'\`]|$)/g, replacement: '$1rounded-2xl$2' }
];

function processContent(content) {
  let modified = false;
  let newContent = content;
  for (const rule of replacements) {
    let prevContent;
    do {
      prevContent = newContent;
      newContent = newContent.replace(rule.match, rule.replacement);
      if (newContent !== prevContent) modified = true;
    } while (newContent !== prevContent);
  }
  return { newContent, modified };
}

function walkDir(d) {
  const files = fs.readdirSync(d);
  for (const file of files) {
    const fullPath = path.join(d, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const { newContent, modified } = processContent(content);
      if (modified) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Modified:', fullPath);
      }
    }
  }
}

walkDir(dir);
console.log('Done refactoring classes.');
