const fs = require('fs');
const path = require('path');

function getRelativePath(fromPath, toPath) {
  let relative = path.relative(path.dirname(fromPath), toPath).replace(/\\/g, '/');
  if (!relative.startsWith('.')) {
    relative = './' + relative;
  }
  // Remove extension for import
  relative = relative.replace(/\.js$/, '');
  return relative;
}

const utilsPath = path.resolve(__dirname, 'src/utils/firebaseErrors.js');
const targetFunctions = ['toast.error', 'setError', 'showError', 'toast.success'];

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Find instances of toast.error(..., setError(..., etc that contain error.message or err.message
  let modified = false;
  
  // Regex to find target function calls. This is tricky with regex, so we'll do a simpler approach:
  // We'll look for error.message and err.message globally, but ONLY if they are inside a file that handles errors,
  // Actually, to be safe, we'll just replace 'error.message' with 'getFriendlyErrorMessage(error)' 
  // and 'err.message' with 'getFriendlyErrorMessage(err)' 
  // ONLY if the line contains toast.error, setError, showError, alert, setAddressErrors, setProductError etc.
  
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Skip console logs so we preserve raw logging
    if (line.includes('console.log') || line.includes('console.error')) {
      continue;
    }

    if (line.match(/(toast\.error|setError|showError|alert|set[A-Za-z]*Error)/)) {
      if (line.includes('error.message')) {
        lines[i] = line.replace(/error\.message/g, 'getFriendlyErrorMessage(error)');
        modified = true;
      }
      if (line.includes('err.message')) {
        lines[i] = line.replace(/err\.message/g, 'getFriendlyErrorMessage(err)');
        modified = true;
      }
      if (line.includes('error.code')) {
        lines[i] = line.replace(/error\.code/g, 'getFriendlyErrorMessage(error)');
        modified = true;
      }
      if (line.includes('err.code')) {
        lines[i] = line.replace(/err\.code/g, 'getFriendlyErrorMessage(err)');
        modified = true;
      }
      
      // Also catch toast.error(error) directly
      if (line.match(/toast\.error\(\s*error\s*\)/)) {
         lines[i] = line.replace(/toast\.error\(\s*error\s*\)/g, 'toast.error(getFriendlyErrorMessage(error))');
         modified = true;
      }
      if (line.match(/toast\.error\(\s*err\s*\)/)) {
         lines[i] = line.replace(/toast\.error\(\s*err\s*\)/g, 'toast.error(getFriendlyErrorMessage(err))');
         modified = true;
      }
    }
  }

  if (modified) {
    let newContent = lines.join('\n');
    
    // Add import statement if not present
    if (!newContent.includes('getFriendlyErrorMessage')) {
       // Should not happen since we just added it, but just in case
    } else if (!newContent.includes('firebaseErrors')) {
      const relPath = getRelativePath(filePath, utilsPath);
      const importStmt = `import { getFriendlyErrorMessage } from '${relPath}';\n`;
      
      // Find the last import line to append after it
      let insertIdx = 0;
      for (let j = 0; j < lines.length; j++) {
        if (lines[j].trim().startsWith('import ')) {
          insertIdx = j + 1;
        } else if (lines[j].trim() !== '' && !lines[j].trim().startsWith('//')) {
          if (insertIdx === 0) insertIdx = j;
          break;
        }
      }
      
      lines.splice(insertIdx, 0, importStmt);
      newContent = lines.join('\n');
    }
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Patched:', filePath);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      if (!fullPath.includes('firebaseErrors.js')) {
        patchFile(fullPath);
      }
    }
  }
}

traverse(path.resolve(__dirname, 'src'));
console.log('Done.');
