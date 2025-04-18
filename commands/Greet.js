const { keith } = require('../keizzah/keith');
const { getGreetSettings, updateGreetSettings, clearRepliedContacts } = require('../database/greet');
const { initChatbotDB, getChatbotSettings, updateChatbotSettings } = require('../database/chatbot');
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
