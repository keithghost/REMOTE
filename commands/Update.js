const { keith } = require('../keizzah/keith');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');
const { initialize, getHash, setHash } = require('../database/update');

// Initialize database on require
initialize().catch(console.error);

keith({
    nomCom: 'update2',
    aliases: ['upgrade', 'sync'],
    categorie: "system",
    reaction: '🔄'
}, async (dest, zk, commandeOptions) => {
    const { repondre, superUser } = commandeOptions;

    if (!superUser) {
        return repondre("❌ Owner-only command");
    }

    try {
        await repondre("🔍 Checking for updates...");
        
        const { data: commit } = await axios.get(
            "https://api.github.com/repos/keithkeizzah/ALPHA-MD7/commits/main",
            { timeout: 8000 }
        );
        
        const currentHash = await getHash();
        if (commit.sha === currentHash) {
            return repondre("✅ Already running the latest version!");
        }

        await repondre("⬇️ Downloading update...");
        const zipUrl = `https://github.com/keithkeizzah/ALPHA-MD7/archive/${commit.sha}.zip`;
        const zipPath = path.join(__dirname, '..', 'temp_update.zip');
        const writer = fs.createWriteStream(zipPath);
        
        const response = await axios({
            url: zipUrl,
            method: 'GET',
            responseType: 'stream',
            timeout: 30000
        });
        
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await repondre("📦 Extracting files...");
        const extractPath = path.join(__dirname, '..', 'temp_extract');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        await repondre("🔄 Applying update...");
        const updateSrc = path.join(extractPath, `ALPHA-MD7-${commit.sha.substr(0, 7)}`);
        await syncFiles(updateSrc, path.join(__dirname, '..'));

        await setHash(commit.sha);
        await repondre("✅ Update complete! Restarting...");

        // Cleanup
        fs.unlinkSync(zipPath);
        fs.removeSync(extractPath);
        
        process.exit(0);
    } catch (error) {
        console.error('Update failed:', error);
        return repondre(`❌ Update failed: ${error.message}`);
    }
});

async function syncFiles(source, target) {
    const preserve = ['set.js', 'app.json', 'database.sqlite', 'assets'];
    
    const items = await fs.readdir(source);
    for (const item of items) {
        if (preserve.includes(item)) continue;
        
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);
        const stat = await fs.lstat(srcPath);

        if (stat.isDirectory()) {
            await fs.ensureDir(destPath);
            await syncFiles(srcPath, destPath);
        } else {
            await fs.copy(srcPath, destPath);
        }
    }
}
