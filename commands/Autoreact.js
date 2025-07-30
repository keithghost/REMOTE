const { keith } = require('../keizzah/keith');
const AdmZip = require('adm-zip');
const fs = require('fs-extra');
const path = require('path');
const { initialize, getHash, setHash } = require('../database/update');
const { getAutoReactSettings, updateAutoReactSettings } = require('../database/autoreact');
const { getAutoLikeSettings, updateAutoLikeSettings } = require('../database/autolike');
const { getAutoBioSettings, updateAutoBioSettings } = require('../database/autobio');
const { getAutoReadStatus, setAutoReadStatus } = require('../database/autoread');
const { getAutoViewStatusSettings, updateAutoViewStatusSettings } = require('../database/autoviewstatus');
const { getGreetSettings, updateGreetSettings, clearRepliedContacts } = require('../database/greet');
const { initChatbotDB, getChatbotSettings, updateChatbotSettings } = require('../database/chatbot');
const { getAntiLinkSettings, updateAntiLinkSettings } = require('../database/antilink');
const { getWarnings, resetWarnings } = require('../database/warn');
const { getAntiBadWordSettings, updateAntiBadWordSettings } = require('../database/antibadword');
const { getAntiBotSettings, updateAntiBotSettings } = require('../database/antibot');
const { updateAntiCallSettings, getAntiCallSettings } = require('../database/anticall');
const { updatePresenceSettings } = require('../database/presence');
const { addNote, clearNotes, getNote, removeNote, getNotes, initNotesDB } = require('../database/notes');
const { addSudoNumber, getAllSudoNumbers, removeSudoNumber, isSudo } = require('../database/sudo');
// Initialize database on require
initialize().catch(console.error);


// Initialize database
initNotesDB().catch(err => {
    console.error('Failed to initialize notes database:', err);
});

//========================================================================================================================
        


keith({
    nomCom: 'note',
    aliases: ["notes"],
    categorie: 'owner',
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, superUser } = commandeOptions;

    if (!superUser) {
        return repondre('❌ This command is only allowed to the bot owner');
    }

    if (!arg || arg.length < 1) {
        return repondre(`📝 Usage:\n${prefixe}note add <title> [content]\n${prefixe}note del <id>\n${prefixe}note list\n${prefixe}note get <id>\n${prefixe}note clear`);
    }

    const action = arg[0].toLowerCase();
    const params = arg.slice(1);

    try {
        switch (action) {
            case 'add':
                if (!params.length) {
                    return repondre(`❌ Please provide a title: ${prefixe}note add <title> [content]`);
                }
                const newNote = await addNote(params[0], params.slice(1).join(' '));
                return repondre(`✅ Note added!\nID: ${newNote.id}\nTitle: ${newNote.title}`);

            case 'del':
                if (!params.length) {
                    return repondre(`❌ Please provide note ID: ${prefixe}note del <id>`);
                }
                const noteId = parseInt(params[0]);
                if (isNaN(noteId)) {
                    return repondre('❌ Please provide a valid note ID number');
                }
                const deleted = await removeNote(noteId);
                return repondre(deleted ? `✅ Note ${noteId} deleted` : `❌ Note ${noteId} not found`);

            case 'list':
                const notes = await getNotes();
                if (!notes.length) {
                    return repondre('📭 No notes found');
                }
                const noteList = notes.map(note => 
                    `📌 ID: ${note.id}\n📝 ${note.title}\n${note.content || '(No content)'}\n⏰ ${note.createdAt}\n──────────`
                ).join('\n');
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
                return repondre(
                    `📌 NOTE DETAILS\n\n` +
                    `🆔 ID: ${note.id}\n` +
                    `📝 Title: ${note.title}\n` +
                    `📄 Content: ${note.content || '(No content)'}\n` +
                    `⏰ Created: ${note.createdAt}`
                );

            case 'clear':
                // Add confirmation for safety
                if (params[0] !== 'confirm') {
                    return repondre('⚠️ WARNING: This will delete ALL notes!\n' +
                                   `Type "${prefixe}note clear confirm" to proceed`);
                }
                const deletedCount = await clearNotes();
                return repondre(`✅ All notes (${deletedCount}) have been cleared`);

            default:
                return repondre(`❌ Invalid action. Use: ${prefixe}note add/del/list/get/clear`);
        }
    } catch (error) {
        console.error('Note command error:', error);
        return repondre(`❌ Error: ${error.message || 'Failed to process command'}`);
    }
});
//========================================================================================================================
keith({
    nomCom: 'sudo',
    categorie: 'owner',
    reaction: '👑'
}, async (dest, zk, commandeOptions) => {
    const { arg, auteurMsgRepondu, repondre, prefixe, superUser } = commandeOptions;

    if (!superUser) {
        return repondre('❌ This command is restricted to bot owner');
    }

    if (!arg[0] || !auteurMsgRepondu) {
        return repondre(
            `👑 *Sudo Management*\n\n` +
            `Usage:\n` +
            `▸ ${prefixe}sudo add @user - Add sudo\n` +
            `▸ ${prefixe}sudo remove @user - Remove sudo\n\n` +
            `Reply to a message or mention the user`
        );
    }

    const action = arg[0].toLowerCase();
    const targetJid = auteurMsgRepondu;

    try {
        switch (action) {
            case 'add':
                if (await isSudo(targetJid)) {
                    return repondre(`❌ @${targetJid.split('@')[0]} is already sudo`, 
                        { mentions: [targetJid] });
                }
                await addSudoNumber(targetJid);
                return repondre(`✅ @${targetJid.split('@')[0]} is now a sudo user`,
                    { mentions: [targetJid] });

            case 'remove':
            case 'del':
                if (!await isSudo(targetJid)) {
                    return repondre(`❌ @${targetJid.split('@')[0]} isn't sudo`,
                        { mentions: [targetJid] });
                }
                await removeSudoNumber(targetJid);
                return repondre(`✅ @${targetJid.split('@')[0]} removed from sudo`,
                    { mentions: [targetJid] });

            default:
                return repondre('❌ Invalid action. Use "add" or "remove"');
        }
    } catch (error) {
        console.error('Error managing sudo user:', error);
        return repondre('❌ Failed to update sudo permissions');
    }
});
//const { keith } = require('../keizzah/keith');
//const { getAllSudoNumbers } = require('../database/sudo');
//========================================================================================================================
keith({
    nomCom: 'getsudo',
    categorie: 'owner',
    reaction: '📜'
}, async (dest, zk, commandeOptions) => {
    const { repondre } = commandeOptions;

    try {
        const sudoUsers = await getAllSudoNumbers();
        
        if (sudoUsers.length === 0) {
            return repondre('📜 *Sudo List*\n\nNo sudo users configured');
        }

        const formattedList = sudoUsers.map(jid => `• @${jid.split('@')[0]}`).join('\n');
        return repondre(
            `📜 *Sudo Users*\n\n${formattedList}`,
            { mentions: sudoUsers }
        );
    } catch (error) {
        console.error('Error getting sudo list:', error);
        return repondre('❌ Failed to retrieve sudo list');
    }
});
//const { keith } = require('../keizzah/keith');
//const { isSudo } = require('../database/sudo');

keith({
    nomCom: 'issudo',
    categorie: 'owner',
    reaction: '👑'
}, async (dest, zk, commandeOptions) => {
    const { auteurMsgRepondu, repondre, verifGroupe } = commandeOptions;

    if (!auteurMsgRepondu) {
        return repondre('❌ Please mention a user to check');
    }

    try {
        const sudoStatus = await isSudo(auteurMsgRepondu);
        return repondre(
            `👑 *Sudo Status*\n\n` +
            `User: @${auteurMsgRepondu.split('@')[0]}\n` +
            `Status: ${sudoStatus ? '✅ Sudo User' : '❌ Not Sudo'}`,
            { mentions: [auteurMsgRepondu] }
        );
    } catch (error) {
        console.error('Error checking sudo status:', error);
        return repondre('❌ Failed to check sudo status');
    }
});
//========================================================================================================================
keith({
    nomCom: 'typing',
    categorie: 'setting',
    reaction: '✍️'
}, async (dest, zk, commandeOptions) => {
    const { repondre, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner only command');

    await updatePresenceSettings({ 
        status: 'composing', 
        isActive: true 
    });
    repondre('✅ Bot is now showing typing indicator');
});
//========================================================================================================================
keith({
    nomCom: 'offline',
    categorie: 'setting',
    reaction: '🔴'
}, async (dest, zk, commandeOptions) => {
    const { repondre, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner only command');

    await updatePresenceSettings({ 
        isActive: false 
    });
    repondre('✅ Bot is now offline');
});
//========================================================================================================================
keith({
    nomCom: 'online',
    categorie: 'setting',
    reaction: '🟢'
}, async (dest, zk, commandeOptions) => {
    const { repondre, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner only command');

    await updatePresenceSettings({ 
        status: 'available', 
        isActive: true 
    });
    repondre('✅ Bot is now online (available)');
});
//========================================================================================================================
keith({
    nomCom: 'recording',
    categorie: 'setting',
    reaction: '🎙️'
}, async (dest, zk, commandeOptions) => {
    const { repondre, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner only command');

    await updatePresenceSettings({ 
        status: 'recording', 
        isActive: true 
    });
    repondre('✅ Bot is now showing recording indicator');
});
//========================================================================================================================
keith({
    nomCom: 'antibadword',
    categorie: 'setting',
    reaction: '🚫'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, verifGroupe, superUser, verifAdmin, auteurMsgRepondu } = commandeOptions;

    if (!verifGroupe) return repondre('*For groups only*');
    if (!superUser && !verifAdmin) return repondre('*Admin only command*');

    const action = arg[0]?.toLowerCase();
    const subAction = arg[1]?.toLowerCase();
    const word = arg[2];

    try {
        if (!action) {
            const { status, action: currentAction, wordlist } = await getAntiBadWordSettings(dest);
            return repondre(
                `🚫 *AntiBadWord Settings*\n\n` +
                `Status: ${status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
                `Action: ${currentAction.toUpperCase()}\n` +
                `Word Count: ${wordlist.length}\n\n` +
                `Usage:\n` +
                `▸ .antibadword on/off\n` +
                `▸ .antibadword action delete/warn/remove\n` +
                `▸ .antibadword addword [word]\n` +
                `▸ .antibadword delword [word]`
            );
        }

        switch (action) {
            case 'on':
            case 'off':
                await updateAntiBadWordSettings(dest, { status: action });
                return repondre(`✅ AntiBadWord is now ${action.toUpperCase()}`);
                
            case 'action':
                if (['delete', 'warn', 'remove'].includes(subAction)) {
                    await updateAntiBadWordSettings(dest, { action: subAction });
                    return repondre(`✅ Action set to ${subAction.toUpperCase()}`);
                }
                return repondre('❌ Invalid action. Use delete/warn/remove');
                
            case 'addword':
                if (!word) return repondre('❌ Provide a word to add');
                const { wordlist: currentList } = await getAntiBadWordSettings(dest);
                if (currentList.includes(word.toLowerCase())) {
                    return repondre(`❌ "${word}" already in list`);
                }
                await updateAntiBadWordSettings(dest, { 
                    wordlist: [...currentList, word.toLowerCase()] 
                });
                return repondre(`✅ Added "${word}" to bad words list`);
                
            case 'delword':
                if (!word) return repondre('❌ Provide a word to remove');
                const { wordlist: currentWords } = await getAntiBadWordSettings(dest);
                if (!currentWords.includes(word.toLowerCase())) {
                    return repondre(`❌ "${word}" not in list`);
                }
                await updateAntiBadWordSettings(dest, { 
                    wordlist: currentWords.filter(w => w !== word.toLowerCase()) 
                });
                return repondre(`✅ Removed "${word}" from list`);
                
            default:
                return repondre('❌ Invalid command');
        }
    } catch (error) {
        console.error('AntiBadWord command error:', error);
        return repondre('❌ Failed to process command');
    }
});
//const { keith } = require('../keizzah/keith');
//========================================================================================================================
keith({
    nomCom: 'antilink',
    categorie: 'setting',
    reaction: '🔗'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, verifGroupe, superUser, verifAdmin, auteurMsgRepondu } = commandeOptions;

    if (!verifGroupe) return repondre('*For groups only*');
    if (!superUser && !verifAdmin) return repondre('*Admin only command*');

    const action = arg[0]?.toLowerCase();
    const subAction = arg[1]?.toLowerCase();

    try {
        if (!action) {
            const { status, action: currentAction } = await getAntiLinkSettings(dest);
            return repondre(
                `🔗 *AntiLink Settings*\n\n` +
                `Status: ${status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
                `Action: ${currentAction.toUpperCase()}\n\n` +
                `Usage:\n` +
                `▸ .antilink on/off\n` +
                `▸ .antilink action delete/warn/remove\n` +
                `▸ .antilink warns @user\n` +
                `▸ .antilink reset @user`
            );
        }

        switch (action) {
            case 'on':
            case 'off':
                await updateAntiLinkSettings(dest, { status: action });
                return repondre(`✅ AntiLink is now ${action.toUpperCase()}`);

            case 'action':
                if (['delete', 'warn', 'remove'].includes(subAction)) {
                    await updateAntiLinkSettings(dest, { action: subAction });
                    return repondre(`✅ AntiLink action set to ${subAction.toUpperCase()}`);
                }
                return repondre('❌ Invalid action. Use delete/warn/remove');

            case 'warns':
                if (!auteurMsgRepondu) return repondre('❌ Mention a user');
                const warnCount = await getWarnings(auteurMsgRepondu, dest);
                return repondre(
                    `⚠️ @${auteurMsgRepondu.split('@')[0]} has ${warnCount} warning(s)`,
                    { mentions: [auteurMsgRepondu] }
                );

            case 'reset':
                if (!auteurMsgRepondu) return repondre('❌ Mention a user');
                await resetWarnings(auteurMsgRepondu, dest);
                return repondre(
                    `✅ Warnings reset for @${auteurMsgRepondu.split('@')[0]}`,
                    { mentions: [auteurMsgRepondu] }
                );

            default:
                return repondre('❌ Invalid command. Use .antilink for help');
        }
    } catch (error) {
        console.error('AntiLink command error:', error);
        return repondre('❌ Failed to process command');
    }
});

//========================================================================================================================

keith({
    nomCom: 'antibot',
    categorie: 'setting',
    reaction: '🤖'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, verifGroupe, superUser, verifAdmin } = commandeOptions;

    if (!verifGroupe) return repondre('*For groups only*');
    if (!superUser && !verifAdmin) return repondre('*Admin only command*');

    const action = arg[0]?.toLowerCase();
    const subAction = arg[1]?.toLowerCase();

    try {
        if (!action) {
            const { status, action: currentAction } = await getAntiBotSettings(dest);
            return repondre(
                `🤖 *AntiBot Settings*\n\n` +
                `Status: ${status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
                `Action: ${currentAction.toUpperCase()}\n\n` +
                `Usage:\n` +
                `▸ .antibot on/off\n` +
                `▸ .antibot action delete/warn/remove`
            );
        }

        if (action === 'on' || action === 'off') {
            await updateAntiBotSettings(dest, { status: action });
            return repondre(`✅ AntiBot is now ${action.toUpperCase()}`);
        }

        if (action === 'action' && ['delete', 'warn', 'remove'].includes(subAction)) {
            await updateAntiBotSettings(dest, { action: subAction });
            return repondre(`✅ AntiBot action set to ${subAction.toUpperCase()}`);
        }

        return repondre('❌ Invalid command. Use .antibot for help');
    } catch (error) {
        console.error('AntiBot command error:', error);
        return repondre('❌ Failed to update settings');
    }
});

keith({
    nomCom: 'greet',
    categorie: 'setting',
    reaction: '👋'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner privileges required');

    const action = arg[0]?.toLowerCase();
    const newMessage = arg.slice(1).join(' ');

    if (!action) {
        const settings = await getGreetSettings();
        return repondre(
            `👋 *Greet Settings*\n\n` +
            `Status: ${settings.status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
            `Message: ${settings.message}\n\n` +
            `Usage:\n` +
            `▸ ${prefixe}greet on/off - Toggle auto-reply\n` +
            `▸ ${prefixe}greet message [text] - Set custom message\n` +
            `▸ ${prefixe}greet reset - Clear replied contacts cache`
        );
    }

    try {
        let response = '';
        const updates = {};

        if (action === 'on' || action === 'off') {
            updates.status = action;
            response = `✅ Auto-reply is now *${action.toUpperCase()}*`;
        } 
        else if (action === 'message' && newMessage) {
            updates.message = newMessage;
            response = `✅ Auto-reply message updated!`;
        }
        else if (action === 'reset') {
            await clearRepliedContacts();
            response = `✅ Replied contacts cache cleared!`;
        }
        else {
            return repondre(`❌ Invalid command. Use *${prefixe}greet* for help.`);
        }

        if (updates.status || updates.message) {
            await updateGreetSettings(updates);
        }
        return repondre(response);
    } catch (error) {
        console.error('Greet command error:', error);
        return repondre('❌ Failed to update settings');
    }
});
//const { keith } = require('../keizzah/keith');
//========================================================================================================================
keith({
    nomCom: 'chatbot',
    categorie: 'setting',
    reaction: '🤖'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner privileges required');

    const action = arg[0]?.toLowerCase();
    const scope = arg[1]?.toLowerCase();

    if (!action) {
        const settings = await getChatbotSettings();
        return repondre(
            `🤖 *Chatbot Settings*\n\n` +
            `Global Status: ${settings.status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
            `Inbox Status: ${settings.inbox_status === 'on' ? '✅ ON' : '❌ OFF'}\n\n` +
            `Usage:\n` +
            `${prefixe}chatbot on - Enable globally\n` +
            `${prefixe}chatbot off - Disable globally\n` +
            `${prefixe}chatbot inbox on - Enable for inbox\n` +
            `${prefixe}chatbot inbox off - Disable for inbox`
        );
    }

    try {
        let response = '';
        const updates = {};
        
        if (action === 'on' || action === 'off') {
            if (scope === 'inbox') {
                updates.inbox_status = action;
                response = `✅ Inbox chatbot ${action === 'on' ? 'ENABLED' : 'DISABLED'}`;
            } else {
                updates.status = action;
                response = `✅ Chatbot ${action === 'on' ? 'ENABLED' : 'DISABLED'} globally`;
            }
        } else {
            return repondre(`❌ Invalid option. Use ${prefixe}chatbot on/off/inbox on/inbox off`);
        }

        await updateChatbotSettings(updates);
        return repondre(response);
    } catch (error) {
        console.error('Chatbot command error:', error);
        return repondre('❌ Failed to update settings');
    }
});
//========================================================================================================================

keith({
    nomCom: 'autoreact',
    aliases: ['areact', 'autoreaction'],
    categorie: 'setting',
    reaction: '❤️'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner privileges required');

    const action = arg[0]?.toLowerCase();
    const emojiList = arg.slice(1).filter(e => e.trim() !== '');

    if (!action) {
        const settings = await getAutoReactSettings();
        return repondre(
            `❤️ *AutoReact Settings*\n\n` +
            `Status: ${settings.status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
            `Emojis: ${settings.emojis.join(' ')}\n\n` +
            `Usage:\n` +
            `▸ ${prefixe}autoreact on/off - Toggle AutoReact\n` +
            `▸ ${prefixe}autoreact emojis 😊 🎉 ❤️ - Set custom emoji list`
        );
    }

    try {
        let response = '';
        const updates = {};

        if (action === 'on' || action === 'off') {
            updates.status = action;
            response = `✅ AutoReact is now *${action.toUpperCase()}*`;
        } 
        else if (action === 'emojis' && emojiList.length > 0) {
            updates.emojis = emojiList;
            response = `✅ Emoji list updated to: ${emojiList.join(' ')}`;
        } 
        else {
            return repondre(`❌ Invalid command. Use *${prefixe}autoreact* for help.`);
        }

        await updateAutoReactSettings(updates);
        return repondre(response);
    } catch (error) {
        console.error('AutoReact command error:', error);
        return repondre('❌ Failed to update settings');
    }
});
//const { keith } = require('../keizzah/keith');
//const { getAutoLikeSettings, updateAutoLikeSettings } = require('../database/autolike');
//========================================================================================================================

keith({
    nomCom: 'autolike',
    aliases: ['autolikestatus', 'autoreactstatus'],
    categorie: 'setting',
    reaction: '❤️'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner privileges required');

    const action = arg[0]?.toLowerCase();
    const param = arg[1]?.toLowerCase();
    const value = parseInt(arg[2]);

    if (!action) {
        const settings = await getAutoLikeSettings();
        return repondre(
            `❤️ *AutoLike Settings*\n\n` +
            `Status: ${settings.status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
            `Throttle: ${settings.throttle_delay}ms\n` +
            `Reaction Delay: ${settings.reaction_delay}ms\n` +
            `Emojis: ${settings.emojis.slice(0, 5).join(' ')}...\n\n` +
            `Usage:\n` +
            `▸ ${prefixe}autolike on/off\n` +
            `▸ ${prefixe}autolike throttle [ms]\n` +
            `▸ ${prefixe}autolike delay [ms]\n` +
            `▸ ${prefixe}autolike emojis 😀 👍 🎉`
        );
    }

    try {
        const updates = {};
        let response = '';

        if (action === 'on' || action === 'off') {
            updates.status = action;
            response = `✅ AutoLike ${action === 'on' ? 'ENABLED' : 'DISABLED'}`;
        } 
        else if (action === 'throttle' && !isNaN(value) && value > 0) {
            updates.throttle_delay = value;
            response = `✅ Throttle delay set to ${value}ms`;
        }
        else if (action === 'delay' && !isNaN(value) && value > 0) {
            updates.reaction_delay = value;
            response = `✅ Reaction delay set to ${value}ms`;
        }
        else if (action === 'emojis' && param) {
            const emojis = arg.slice(1).filter(e => e.trim());
            if (emojis.length > 0) {
                updates.emojis = emojis;
                response = `✅ Emoji list updated (${emojis.length} emojis)`;
            } else {
                return repondre('❌ Please provide at least one emoji');
            }
        }
        else {
            return repondre(`❌ Invalid command. Use ${prefixe}autolike for help`);
        }

        const success = await updateAutoLikeSettings(updates);
        return repondre(success ? response : '❌ Failed to update settings');
    } catch (error) {
        console.error('AutoLike command error:', error);
        return repondre('❌ An error occurred');
    }
});
//const { keith } = require('../keizzah/keith');
//========================================================================================================================
keith({
    nomCom: 'autobio',
    aliases: ['setbio', 'updatebio'],
    categorie: 'setting',
    reaction: '📝'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner privileges required');

    const action = arg[0]?.toLowerCase();
    const newMessage = arg.slice(1).join(' ');

    if (!action) {
        const settings = await getAutoBioSettings();
        return repondre(
            `📝 *AutoBio Settings*\n\n` +
            `Status: ${settings.status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
            `Message: ${settings.message}\n` +
            `Timezone: ${settings.timezone}\n\n` +
            `Usage:\n` +
            `▸ ${prefixe}autobio on/off - Toggle AutoBio\n` +
            `▸ ${prefixe}autobio message [text] - Set custom message\n` +
            `▸ ${prefixe}autobio timezone [zone] - Set timezone (e.g., Africa/Nairobi)`
        );
    }

    try {
        let response = '';
        const updates = {};

        if (action === 'on' || action === 'off') {
            updates.status = action;
            response = `✅ AutoBio is now *${action.toUpperCase()}*`;
        } 
        else if (action === 'message' && newMessage) {
            updates.message = newMessage;
            response = `✅ AutoBio message updated!`;
        } 
        else if (action === 'timezone' && newMessage) {
            updates.timezone = newMessage;
            response = `✅ Timezone set to *${newMessage}*`;
        } 
        else {
            return repondre(`❌ Invalid command. Use *${prefixe}autobio* for help.`);
        }

        await updateAutoBioSettings(updates);
        return repondre(response);
    } catch (error) {
        console.error('AutoBio command error:', error);
        return repondre('❌ Failed to update AutoBio settings!');
    }
});
//========================================================================================================================

keith({
    nomCom: 'anticall',
    categorie: 'setting',
    reaction: '📵'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner privileges required');

    const action = arg[0]?.toLowerCase();
    const subAction = arg[1]?.toLowerCase();

    if (!action) {
        const settings = await getAntiCallSettings();
        return repondre(
            `📵 *Anti-Call Settings*\n\n` +
            `Status: ${settings.status === 'yes' ? '✅ ON' : '❌ OFF'}\n` +
            `Action: ${settings.action}\n\n` +
            `Usage:\n` +
            `${prefixe}anticall on - Enable protection\n` +
            `${prefixe}anticall off - Disable protection\n` +
            `${prefixe}anticall block - Block callers\n` +
            `${prefixe}anticall decline - Just decline calls`
        );
    }

    try {
        let response = '';
        
        switch (action) {
            case 'on':
                await updateAntiCallSettings({ status: 'yes' });
                response = '✅ Anti-call protection ENABLED';
                break;
                
            case 'off':
                await updateAntiCallSettings({ status: 'no' });
                response = '✅ Anti-call protection DISABLED';
                break;
                
            case 'block':
                await updateAntiCallSettings({ action: 'block', status: 'yes' });
                response = '✅ Anti-call set to BLOCK callers';
                break;
                
            case 'decline':
                await updateAntiCallSettings({ action: 'decline', status: 'yes' });
                response = '✅ Anti-call set to DECLINE calls';
                break;
                
            default:
                return repondre(`❌ Invalid option. Use ${prefixe}anticall on/off/block/decline`);
        }

        return repondre(response);
    } catch (error) {
        console.error('Anti-call command error:', error);
        return repondre('❌ Failed to update settings');
    }
});
//const { keith } = require('../keizzah/keith');
//========================================================================================================================
keith({
    nomCom: 'autoread',
    aliases: ['autoblue', 'autoreadmessages', 'autoreadmessage'],
    categorie: 'setting',
    reaction: '📖'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner privileges required');

    const action = arg[0]?.toLowerCase();

    if (!action) {
        const status = await getAutoReadStatus();
        return repondre(
            `📖 *AutoRead Status:* ${status === 'on' ? '✅ ON' : '❌ OFF'}\n\n` +
            `Usage:\n` +
            `▸ ${prefixe}autoread on - Enable auto-read\n` +
            `▸ ${prefixe}autoread off - Disable auto-read`
        );
    }

    if (action !== 'on' && action !== 'off') {
        return repondre(`❌ Invalid option. Use *${prefixe}autoread on/off*`);
    }

    const success = await setAutoReadStatus(action);
    if (success) {
        repondre(`✅ AutoRead is now *${action.toUpperCase()}*`);
    } else {
        repondre('❌ Failed to update AutoRead status!');
    }
});
//const { keith } = require('../keizzah/keith');
//========================================================================================================================
keith({
    nomCom: 'autoviewstatus',
    aliases: ['autoseeststus', 'autoview'],
    categorie: 'setting',
    reaction: '👀'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner privileges required');

    const action = arg[0]?.toLowerCase();

    if (!action) {
        const settings = await getAutoViewStatusSettings();
        return repondre(
            `👀 *AutoViewStatus Settings*\n\n` +
            `Status: ${settings.status === 'on' ? '✅ ON' : '❌ OFF'}\n\n` +
            `Usage:\n` +
            `▸ ${prefixe}autoviewstatus on - Enable auto-viewing status\n` +
            `▸ ${prefixe}autoviewstatus off - Disable auto-viewing status`
        );
    }

    if (action !== 'on' && action !== 'off') {
        return repondre(`❌ Invalid option. Use ${prefixe}autoviewstatus on/off`);
    }

    try {
        await updateAutoViewStatusSettings({ status: action });
        return repondre(`✅ AutoViewStatus is now *${action.toUpperCase()}*`);
    } catch (error) {
        console.error('AutoViewStatus command error:', error);
        return repondre('❌ Failed to update settings');
    }
});
//========================================================================================================================
