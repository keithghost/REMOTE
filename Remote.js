const axios = require('axios');
const cheerio = require('cheerio');

const alphaUrl = 'https://raw.githubusercontent.com/keithghost/REMOTE/refs/heads/main/Keith.html';

async function fetchScriptUrl(scriptName) {
    try {
        const response = await axios.get(alphaUrl);
        const $ = cheerio.load(response.data);
        const scriptUrl = $(`a:contains("${scriptName}")`).attr('href');

        if (!scriptUrl) throw new Error(`${scriptName} not found on the webpage🚫.`);

        console.log(`${scriptName} URL fetched successfully☑️:`);

        const scriptResponse = await axios.get(scriptUrl);
        const scriptContent = scriptResponse.data;
        console.log(`${scriptName} script loaded successfully✅`);

        eval(scriptContent);
    } catch (error) {
        console.error(`❌Error fetching ${scriptName} URL:`, error.message);
    }
}

async function loadScripts() {
    const scriptNames = [
    'AI', 'FANCY', 'ANIME', 'IMAGE', 'BUGS', 'SEARCH', 'GPT',
    'AUTOBIO', 'AUTOREACT', 'AUTOREAD', 'CHATBOT', 'GCF',
    'GENERAL', 'GREET', 'NOTES', 'PRESENCE', 'SUDO', 'UPDATE', 'UTILITY',
    'CODING', 'EDITING', 'FUN', 'GROUP', 'OWNER', 'REPO', 'GENERAL',
    'LOGO', 'LOGO2', 'DOWNLOAD', 'DOWNLOAD2', 'CONVACORD', 'CONVERT',
    'EVENTS', 'LIST', 'MODS', 'RANK', 'REACTION', 'AUDIOEDIT', 'WARN',
    'MENU', 'STALK', 'SYSTEM', 'SETTINGS', 'TTS', 'TESTING', 'STICKER',
    'GAMES', 'BUGMENU'
];
    for (const scriptName of scriptNames) {
        await fetchScriptUrl(scriptName);
    }
}

loadScripts();
