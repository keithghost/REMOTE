const { keith } = require('../keizzah/keith');
const { initChatbotDB, getChatbotSettings, updateChatbotSettings } = require('../database/chatbot');
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
