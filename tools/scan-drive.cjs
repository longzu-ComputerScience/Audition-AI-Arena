const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== SCANNING GOOGLE DRIVE RECURSIVELY ===\n');

function getFolderContents(folderId, folderPath) {
  try {
    const tmpFile = `/tmp/drive_${folderId}.html`;
    execSync(`curl -s -L "https://drive.google.com/drive/folders/${folderId}" -o "${tmpFile}"`);
    const html = fs.readFileSync(tmpFile, 'utf8');
    const m = html.match(/window\[\x27_DRIVE_ivd\x27\]\s*=\s*\x27([\s\S]*?)\x27;/);
    if (!m) {
      console.log(`No _DRIVE_ivd in folder ${folderPath} (${folderId})`);
      return [];
    }
    const decoded = m[1].replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, '\\');
    const data = JSON.parse(decoded);
    const rawItems = data[0] || [];
    const results = [];

    for (const it of rawItems) {
      const id = it[0];
      const name = it[2];
      const mime = it[3];
      const isFolder = mime === 'application/vnd.google-apps.folder';
      
      const item = {
        id,
        name,
        mime,
        isFolder,
        parentPath: folderPath,
        fullPath: `${folderPath}/${name}`,
      };
      results.push(item);

      if (isFolder) {
        console.log(`Found folder: ${item.fullPath} (${id})`);
        const subResults = getFolderContents(id, item.fullPath);
        results.push(...subResults);
      } else {
        console.log(`  File: ${item.fullPath} (${id}) [${mime}]`);
      }
    }
    return results;
  } catch (err) {
    console.error(`Error scanning folder ${folderPath}:`, err.message);
    return [];
  }
}

const rootId = '1LKKsxsDUbq7abYLVdDtBpM5TalzxoHDI';
const allEntries = getFolderContents(rootId, '');

const allFiles = allEntries.filter(e => !e.isFolder);
const allFolders = allEntries.filter(e => e.isFolder);

console.log(`\nScan Summary:`);
console.log(`Total Folders: ${allFolders.length}`);
console.log(`Total Files: ${allFiles.length}`);

fs.writeFileSync('/tmp/drive_manifest.json', JSON.stringify({ folders: allFolders, files: allFiles }, null, 2));
console.log('Saved /tmp/drive_manifest.json');
