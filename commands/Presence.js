const { keith } = require('../keizzah/keith');
const { updatePresenceSettings } = require('../database/presence');

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
