const { keith } = require('../keizzah/keith');
const { addSudoNumber, getAllSudoNumbers, removeSudoNumber, isSudo } = require('../database/sudo');

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
