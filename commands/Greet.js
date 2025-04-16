const { keith } = require('../keizzah/keith');
const { getGreetSettings, updateGreetSettings, clearRepliedContacts } = require('../database/greet');

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
