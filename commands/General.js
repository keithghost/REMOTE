const { keith } = require('../keizzah/keith');
const { 
    addNote, 
    clearNotes,
    getNote,
    removeNote, 
    getNotes, 
    initNotesDB 
} = require('../database/notes');
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');

// Initialize Catbox (only in plugin)
const catbox = new Catbox();

// Initialize database
initNotesDB().catch(err => {
    console.error('Failed to initialize notes database:', err);
});

// Media upload helper (only in plugin)
async function uploadToCatbox(mediaPath) {
    if (!fs.existsSync(mediaPath)) {
        throw new Error("File does not exist");
    }
    try {
        const uploadResult = await catbox.uploadFile({ path: mediaPath });
        fs.unlinkSync(mediaPath); // Clean up
        return uploadResult;
    } catch (error) {
        throw new Error(String(error));
    }
}

keith({
    nomCom: 'note2',
    categorie: 'Mods',
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, superUser, msgRepondu } = commandeOptions;

    if (!superUser) {
        return repondre('❌ This command is only allowed to the bot owner');
    }

    if (!arg || arg.length < 1) {
        return repondre(`📝 Usage:\n${prefixe}note add <title> [content]\n${prefixe}note addmedia <title> [content] - reply to media\n${prefixe}note del <id>\n${prefixe}note list\n${prefixe}note get <id>\n${prefixe}note clear`);
    }

    const action = arg[0].toLowerCase();
    const params = arg.slice(1);

    try {
        switch (action) {
            case 'add':
                if (!params.length) {
                    return repondre(`❌ Please provide a title: ${prefixe}note add <title> [content]`);
                }
                const newNote = await addNote({
                    title: params[0], 
                    content: params.slice(1).join(' ')
                });
                return repondre(`✅ Note added!\nID: ${newNote.id}\nTitle: ${newNote.title}`);

            case 'addmedia':
                if (!msgRepondu) {
                    return repondre("❌ Please reply to a media message");
                }
                
                if (!params.length) {
                    return repondre(`❌ Please provide a title: ${prefixe}note addmedia <title> [content]`);
                }
                
                // Download media
                let mediaType, mediaPath;
                if (msgRepondu.imageMessage) {
                    mediaType = 'image';
                    mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
                } else if (msgRepondu.videoMessage) {
                    mediaType = 'video';
                    mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
                } else if (msgRepondu.audioMessage) {
                    mediaType = 'audio';
                    mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
                } else if (msgRepondu.stickerMessage) {
                    mediaType = 'sticker';
                    mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.stickerMessage);
                } else if (msgRepondu.documentMessage) {
                    mediaType = 'document';
                    mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.documentMessage);
                } else {
                    return repondre("❌ Unsupported media type");
                }
                
                // Upload to Catbox
                const mediaUrl = await uploadToCatbox(mediaPath);
                
                // Save note with media reference
                const mediaNote = await addNote({
                    title: params[0],
                    content: params.slice(1).join(' '),
                    mediaType,
                    mediaUrl
                });
                
                return repondre(`✅ Media note saved!\nID: ${mediaNote.id}\nTitle: ${mediaNote.title}\nMedia: ${mediaType}`);

            case 'get':
                if (!params.length) {
                    return repondre(`❌ Please provide note ID: ${prefixe}note get <id>`);
                }
                const noteId = parseInt(params[0]);
                const note = await getNote(noteId);
                
                if (!note) return repondre('❌ Note not found');
                
                let response = `📌 Note #${note.id}\n📝 ${note.title}`;
                if (note.content) response += `\n📄 ${note.content}`;
                if (note.mediaUrl) response += `\n🎞️ Media URL: ${note.mediaUrl}`;
                response += `\n⏰ ${note.createdAt}`;
                
                return repondre(response);

            // Keep your existing cases unchanged
            case 'del':
            case 'list':
            case 'clear':
                // ... existing implementation ...
                
            default:
                return repondre(`❌ Invalid action. Use: ${prefixe}note add/addmedia/del/list/get/clear`);
        }
    } catch (error) {
        console.error('Note command error:', error);
        return repondre(`❌ Error: ${error.message}`);
    }
});
