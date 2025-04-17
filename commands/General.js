
const { keith } = require('../keizzah/keith');
const { 
    addNote, 
    clearNotes,
    getNote,
    removeNote, 
    getNotes, 
    initNotesDB 
} = require('../database/notes');

// Initialize database
initNotesDB().catch(err => {
    console.error('Failed to initialize notes database:', err);
});

keith({
    nomCom: 'note',
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
                    return repondre("❌ Please reply to a media message (image, video, audio, sticker, document)");
                }
                
                if (!params.length) {
                    return repondre(`❌ Please provide a title: ${prefixe}note addmedia <title> [content]`);
                }
                
                // Determine media type and download
                let mediaType, mediaBuffer;
                
                if (msgRepondu.imageMessage) {
                    mediaType = 'image';
                    mediaBuffer = await zk.downloadMediaMessage(msgRepondu.imageMessage);
                } else if (msgRepondu.videoMessage) {
                    mediaType = 'video';
                    mediaBuffer = await zk.downloadMediaMessage(msgRepondu.videoMessage);
                } else if (msgRepondu.audioMessage) {
                    mediaType = 'audio';
                    mediaBuffer = await zk.downloadMediaMessage(msgRepondu.audioMessage);
                } else if (msgRepondu.stickerMessage) {
                    mediaType = 'sticker';
                    mediaBuffer = await zk.downloadMediaMessage(msgRepondu.stickerMessage);
                } else if (msgRepondu.documentMessage) {
                    mediaType = 'document';
                    mediaBuffer = await zk.downloadMediaMessage(msgRepondu.documentMessage);
                } else {
                    return repondre("❌ Unsupported media type. Please reply to an image, video, audio, sticker, or document");
                }
                
                // Upload media to your preferred storage (you might need to implement this)
                // For example, you could save to local filesystem or cloud storage
                const mediaId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
                const mediaUrl = await saveMediaToStorage(mediaBuffer, mediaId, mediaType);
                
                // Create note with media
                const mediaNote = await addNote({
                    title: params[0],
                    content: params.slice(1).join(' '),
                    mediaType,
                    mediaUrl,
                    mediaId
                });
                
                return repondre(`✅ Media note added!\nID: ${mediaNote.id}\nTitle: ${mediaNote.title}\nType: ${mediaType}`);

            case 'del':
                // ... existing delete logic ...

            case 'list':
                const notes = await getNotes();
                if (!notes.length) {
                    return repondre('📭 No notes found');
                }
                const noteList = notes.map(note => {
                    let noteText = `📌 ID: ${note.id}\n📝 ${note.title}`;
                    if (note.mediaType) {
                        noteText += `\n🎞️ Media: ${note.mediaType}`;
                    }
                    noteText += `\n⏰ ${note.createdAt}\n──────────`;
                    return noteText;
                }).join('\n');
                return repondre(`📒 YOUR NOTES:\n\n${noteList}`);

            case 'get':
                if (!params.length) {
                    return repondre(`❌ Please provide note ID: ${prefixe}note get <id>`);
                }
                const getNoteId = parseInt(params[0]);
                if (isNaN(getNoteId)) {
                    return repondre('❌ Please provide a valid note ID number');
                }
                const note = await getNote(getNoteId);
                if (!note) {
                    return repondre(`❌ Note ${getNoteId} not found`);
                }
                
                let response = 
                    `📌 NOTE DETAILS\n\n` +
                    `🆔 ID: ${note.id}\n` +
                    `📝 Title: ${note.title}\n`;
                
                if (note.content) {
                    response += `📄 Content: ${note.content}\n`;
                }
                
                if (note.mediaType && note.mediaUrl) {
                    response += `🎞️ Media: ${note.mediaType}\n`;
                    // If you want to send the media back:
                    // await zk.sendMessage(dest, { [note.mediaType]: note.mediaUrl }, { quoted: msgRepondu });
                }
                
                response += `⏰ Created: ${note.createdAt}`;
                
                return repondre(response);

            // ... rest of your existing cases ...
        }
    } catch (error) {
        console.error('Note command error:', error);
        return repondre(`❌ Error: ${error.message || 'Failed to process command'}`);
    }
});

// Helper function to save media (you'll need to implement this based on your storage solution)
async function saveMediaToStorage(buffer, id, type) {
    // Example: Save to local filesystem
    const fs = require('fs');
    const path = require('path');
    
    const uploadDir = path.join(__dirname, '../media/notes');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const ext = type === 'image' ? 'jpg' : 
                type === 'video' ? 'mp4' : 
                type === 'audio' ? 'mp3' : 
                type === 'sticker' ? 'webp' : 'bin';
    
    const filename = `${id}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    
    await fs.promises.writeFile(filePath, buffer);
    
    // Return URL or path that you can use to retrieve the file later
    return `/media/notes/${filename}`;
    
    // For cloud storage, you would upload to S3, etc. and return the public URL
}
