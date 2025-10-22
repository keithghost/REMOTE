const config = require(__dirname + "/../set");
const { DataTypes } = require("sequelize");
const AdmZip = require('adm-zip');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { keith } = require('../keizzah/keith');

// Database Model Definition
const UpdateDB = config.DATABASE.define("bot_updates", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  current_hash: {
    type: DataTypes.STRING(40),
    allowNull: false,
    defaultValue: "initial"
  },
  last_checked: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM("pending", "updated", "failed"),
    allowNull: false,
    defaultValue: "updated"
  }
}, {
  timestamps: false,
  freezeTableName: true
});

// Database Operations
async function initializeUpdateDB() {
  try {
    await UpdateDB.sync();
    const [record] = await UpdateDB.findOrCreate({
      where: { id: 1 },
      defaults: {
        current_hash: "initial",
        last_checked: new Date(),
        status: "updated"
      }
    });
    return record;
  } catch (error) {
    console.error("❌ Update DB init error:", error);
    throw error;
  }
}

async function getCurrentHash() {
  const record = await UpdateDB.findByPk(1);
  return record?.current_hash || "initial";
}

async function setCurrentHash(hash) {
  return await UpdateDB.update(
    {
      current_hash: hash,
      last_checked: new Date(),
      status: "updated"
    },
    { where: { id: 1 } }
  );
}

// File Operations
async function syncFiles(source, target) {
  const preserve = ['app.json', 'assets'];

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

// Update Command Handler
keith({
  nomCom: 'update',
  aliases: ['upgrade', 'sync'],
  categorie: 'system',
  reaction: '🔄'
}, async (dest, zk, commandeOptions) => {
  const { repondre, superUser } = commandeOptions;

  if (!superUser) return repondre('❌ Owner-only command');

  try {
    await repondre('🔍 Checking for updates...');

    const repo = 'keithkeizzah/ALPHA-MD';
    const { data: commit } = await axios.get(
      `https://api.github.com/repos/${repo}/commits/main`,
      { timeout: 8000 }
    );

    const currentHash = await getCurrentHash();
    if (commit.sha === currentHash) {
      return repondre('✅ Already running the latest version!');
    }

    await repondre('⬇️ Downloading update...');
    const zipUrl = `https://github.com/${repo}/archive/${commit.sha}.zip`;
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

    await repondre('📦 Extracting files...');
    const extractPath = path.join(__dirname, '..', 'temp_extract');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    const extractedFolder = fs.readdirSync(extractPath)
      .find(name => name.startsWith('ALPHA-MD-'));

    const updateSrc = path.join(extractPath, extractedFolder);

    await repondre('🔄 Applying update...');
    await syncFiles(updateSrc, path.join(__dirname, '..'));

    await setCurrentHash(commit.sha);

    await repondre('✅ Update complete! Restarting...');
    fs.unlinkSync(zipPath);
    fs.removeSync(extractPath);

    process.exit(0);
  } catch (err) {
    console.error('❗ Update failed:', err);
    await repondre(`❌ Update failed: ${err.message}`);
  }
});

// Initialize the database when this file is loaded
initializeUpdateDB().catch(console.error);
