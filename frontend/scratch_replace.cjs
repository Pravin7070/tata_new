const fs = require('fs');
const file = 'src/pages/Vehicle.tsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure StatusRow is imported
if (!content.includes('StatusRow')) {
  content = content.replace('import { TireCard }', 'import { StatusRow } from \'../components/vehicle/StatusRow\';\nimport { TireCard }');
}

const regex = /<div className="flex justify-between border-b border-automotive-gray\/10 pb-1.5">\s*<span className="text-automotive-gray uppercase text-\[10px\] tracking-wider">([^<]+)<\/span>\s*<span className="([^>]+)">([^<]+)<\/span>\s*<\/div>/g;
content = content.replace(regex, (match, label, cls, val) => {
  let valueClass = cls.includes('text-automotive-white font-mono') && !cls.includes('bg-') ? '' : ` valueClass="${cls}"`;
  return `            <StatusRow label="${label}" value="${val}"${valueClass} />`;
});

const regexLast = /<div className="flex justify-between items-center">\s*<span className="text-automotive-gray uppercase text-\[10px\] tracking-wider">([^<]+)<\/span>\s*<span className="([^>]+)">([^<]+)<\/span>\s*<\/div>/g;
content = content.replace(regexLast, (match, label, cls, val) => {
  let valueClass = cls.includes('text-automotive-white font-mono') && !cls.includes('bg-') ? '' : ` valueClass="${cls}"`;
  return `            <StatusRow label="${label}" value="${val}"${valueClass} isLast />`;
});

fs.writeFileSync(file, content);
console.log('Replacement complete');
