const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove import
  content = content.replace(/import \{ Pseudocode \} from '..\/components\/Pseudocode';\n/g, '');
  
  // Remove state
  content = content.replace(/const \[showPseudocode, setShowPseudocode\] = useState\(false\);\n/g, '');

  // Remove button blocks (varies slightly)
  content = content.replace(/\{activeAlgorithm\.id !== 'bubbleSort' && \(\s*<button className="btn-pseudocode"[^>]*>[\s\S]*?<\/button>\s*\)\}\n/g, '');
  content = content.replace(/<button className="btn-pseudocode"[^>]*>[\s\S]*?<\/button>\n/g, '');

  // Remove Pseudocode component block
  content = content.replace(/<Pseudocode\s+isOpen=\{showPseudocode\}[\s\S]*?\/>\n/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Cleaned', file);
});
