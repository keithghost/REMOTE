const { keith } = require("../keizzah/keith");
const { downloadMediaMessage, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { exec } = require('child_process');
const { writeFile } = require("fs/promises");
const fs = require('fs-extra');
const moment = require("moment-timezone");
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { ajouterOuMettreAJourJid, mettreAJourAction, verifierEtatJid } = require("../bdd/antilien");
const { atbajouterOuMettreAJourJid, atbverifierEtatJid } = require("../bdd/antibot");
const { search, download } = require("aptoide-scraper");
const { default: axios } = require('axios');
const { repondre, sendMessage } = require('../keizzah/context');
const conf = require(__dirname + "/../set");

// Tagall Command
keith({ nomCom: "tagall", categorie: 'Group', reaction: "📣" }, async (dest, zk, commandeOptions) => {
  const { ms, arg, verifGroupe, nomGroupe, infosGroupe, nomAuteurMessage, verifAdmin, superUser } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "✋🏿 ✋🏿 This command is reserved for groups ❌");
  }

  const mess = arg && arg.length > 0 ? arg.join(' ') : 'Aucun Message';
  const membresGroupe = verifGroupe ? await infosGroupe.participants : [];

  let tag = `========================\n🌟 *ALPHA-MD* 🌟\n========================\n👥 Group: ${nomGroupe} 🚀\n👤 Author: *${nomAuteurMessage}* 👋\n📜 Message: *${mess}* 📝\n========================\n\n`;

  const emoji = ['🦴', '👀', '😮‍💨', '❌', '✔️', '😇', '⚙️', '🔧', '🎊', '😡', '🙏🏿', '⛔️', '$', '😟', '🥵', '🐅'];
  const random = Math.floor(Math.random() * (emoji.length - 1));

  membresGroupe.forEach(membre => {
    tag += `${emoji[random]} @${membre.id.split("@")[0]}\n`;
  });

  if (verifAdmin || superUser) {
    await sendMessage(zk, dest, ms, {
      text: tag,
      mentions: membresGroupe.map((i) => i.id)
    });
  } else {
    repondre(zk, dest, ms, 'Command reserved for admins');
  }
});

// Invite Command
keith({ nomCom: "invite", categorie: 'Group', reaction: "🙋" }, async (dest, zk, commandeOptions) => {
  const { ms, nomGroupe, nomAuteurMessage, verifGroupe } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "Wait bro, you want the link to my DM?");
  }

  const link = await zk.groupInviteCode(dest);
  const lien = `https://chat.whatsapp.com/${link}`;
  const mess = `Hello ${nomAuteurMessage}, here is the group link of ${nomGroupe}\n\nClick Here To Join: ${lien}`;

  repondre(zk, dest, ms, mess);
});

// Promote Command
keith({ nomCom: "promote", categorie: 'Group', reaction: "👨🏿‍💼" }, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, auteurMessage, superUser, idBot } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "For groups only");
  }

  const membresGroupe = verifGroupe ? await infosGroupe.participants : [];
  const verifMember = (user) => membresGroupe.some(m => m.id === user);
  const memberAdmin = (membresGroupe) => membresGroupe.filter(m => m.admin).map(m => m.id);

  const admins = verifGroupe ? memberAdmin(membresGroupe) : [];
  const admin = verifGroupe ? admins.includes(auteurMsgRepondu) : false;
  const membre = verifMember(auteurMsgRepondu);
  const autAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
  const zkad = verifGroupe ? admins.includes(idBot) : false;

  try {
    if (autAdmin || superUser) {
      if (msgRepondu) {
        if (zkad) {
          if (membre) {
            if (!admin) {
              const txt = `🎊🍾 @${auteurMsgRepondu.split("@")[0]} has been promoted as a group admin.`;
              await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "promote");
              await sendMessage(zk, dest, ms, { text: txt, mentions: [auteurMsgRepondu] });
            } else {
              repondre(zk, dest, ms, "This member is already an administrator of the group.");
            }
          } else {
            repondre(zk, dest, ms, "This user is not part of the group.");
          }
        } else {
          repondre(zk, dest, ms, "Sorry, I cannot perform this action because I am not an administrator of the group.");
        }
      } else {
        repondre(zk, dest, ms, "Please tag the member to be nominated.");
      }
    } else {
      repondre(zk, dest, ms, "Sorry, I cannot perform this action because you are not an administrator of the group.");
    }
  } catch (e) {
    repondre(zk, dest, ms, "Oops! " + e);
  }
});

// Demote Command
keith({ nomCom: "demote", categorie: 'Group', reaction: "👨🏿‍💼" }, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, auteurMessage, superUser, idBot } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "For groups only");
  }

  const membresGroupe = verifGroupe ? await infosGroupe.participants : [];
  const verifMember = (user) => membresGroupe.some(m => m.id === user);
  const memberAdmin = (membresGroupe) => membresGroupe.filter(m => m.admin).map(m => m.id);

  const admins = verifGroupe ? memberAdmin(membresGroupe) : [];
  const admin = verifGroupe ? admins.includes(auteurMsgRepondu) : false;
  const membre = verifMember(auteurMsgRepondu);
  const autAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
  const zkad = verifGroupe ? admins.includes(idBot) : false;

  try {
    if (autAdmin || superUser) {
      if (msgRepondu) {
        if (zkad) {
          if (membre) {
            if (admin) {
              const txt = `@${auteurMsgRepondu.split("@")[0]} was removed from their position as a group administrator.\n`;
              await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "demote");
              await sendMessage(zk, dest, ms, { text: txt, mentions: [auteurMsgRepondu] });
            } else {
              repondre(zk, dest, ms, "This member is not a group administrator.");
            }
          } else {
            repondre(zk, dest, ms, "This user is not part of the group.");
          }
        } else {
          repondre(zk, dest, ms, "Sorry, I cannot perform this action because I am not an administrator of the group.");
        }
      } else {
        repondre(zk, dest, ms, "Please tag the member to be removed.");
      }
    } else {
      repondre(zk, dest, ms, "Sorry, I cannot perform this action because you are not an administrator of the group.");
    }
  } catch (e) {
    repondre(zk, dest, ms, "Oops! " + e);
  }
});

// Remove Command
keith({ nomCom: "remove", categorie: 'Group', reaction: "👨🏿‍💼" }, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, nomAuteurMessage, auteurMessage, superUser, idBot } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "For groups only");
  }

  const membresGroupe = verifGroupe ? await infosGroupe.participants : [];
  const verifMember = (user) => membresGroupe.some(m => m.id === user);
  const memberAdmin = (membresGroupe) => membresGroupe.filter(m => m.admin).map(m => m.id);

  const admins = verifGroupe ? memberAdmin(membresGroupe) : [];
  const admin = verifGroupe ? admins.includes(auteurMsgRepondu) : false;
  const membre = verifMember(auteurMsgRepondu);
  const autAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
  const zkad = verifGroupe ? admins.includes(idBot) : false;

  try {
    if (autAdmin || superUser) {
      if (msgRepondu) {
        if (zkad) {
          if (membre) {
            if (!admin) {
              const gifLink = "https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif";
              const sticker = new Sticker(gifLink, {
                pack: 'ALPHA-MD',
                author: nomAuteurMessage,
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345',
                quality: 50,
                background: '#000000'
              });

              await sticker.toFile("st.webp");
              const txt = `@${auteurMsgRepondu.split("@")[0]} was removed from the group.\n`;
              await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "remove");
              await sendMessage(zk, dest, ms, { text: txt, mentions: [auteurMsgRepondu] });
            } else {
              repondre(zk, dest, ms, "This member cannot be removed because they are an administrator of the group.");
            }
          } else {
            repondre(zk, dest, ms, "This user is not part of the group.");
          }
        } else {
          repondre(zk, dest, ms, "Sorry, I cannot perform this action because I am not an administrator of the group.");
        }
      } else {
        repondre(zk, dest, ms, "Please tag the member to be removed.");
      }
    } else {
      repondre(zk, dest, ms, "Sorry, I cannot perform this action because you are not an administrator of the group.");
    }
  } catch (e) {
    repondre(zk, dest, ms, "Oops! " + e);
  }
});

// Add Command
keith({ nomCom: "add", categorie: 'Group', reaction: "👨🏿‍💼" }, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, nomAuteurMessage, auteurMessage, superUser, idBot } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "For groups only");
  }

  const participants = await zk.groupMetadata(dest);
  const isImAdmin = participants.participants.some(p => p.id === zk.user.id && p.admin);
  if (!isImAdmin) {
    return repondre(zk, dest, ms, "I'm not an admin.");
  }

  const match = msgRepondu ? msgRepondu.sender : auteurMsgRepondu;
  if (!match) {
    return repondre(zk, dest, ms, "Please tag the user to add.");
  }

  try {
    await zk.groupParticipantsUpdate(dest, [match], "add");
    repondre(zk, dest, ms, `@${match.split("@")[0]} has been added to the group.`, { mentions: [match] });
  } catch (e) {
    repondre(zk, dest, ms, "Failed to add user: " + e.message);
  }
});

// Delete Command
keith({ nomCom: "del", categorie: 'Group', reaction: "🧹" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe, auteurMsgRepondu, idBot, msgRepondu, verifAdmin, superUser } = commandeOptions;

  if (!msgRepondu) {
    return repondre(zk, dest, ms, "Please mention the message to delete.");
  }

  if (superUser && auteurMsgRepondu === idBot) {
    const key = {
      remoteJid: dest,
      fromMe: true,
      id: ms.message.extendedTextMessage.contextInfo.stanzaId,
    };
    await zk.sendMessage(dest, { delete: key });
    return;
  }

  if (verifGroupe) {
    if (verifAdmin || superUser) {
      try {
        const key = {
          remoteJid: dest,
          id: ms.message.extendedTextMessage.contextInfo.stanzaId,
          fromMe: false,
          participant: ms.message.extendedTextMessage.contextInfo.participant
        };
        await zk.sendMessage(dest, { delete: key });
      } catch (e) {
        repondre(zk, dest, ms, "I need admin rights.");
      }
    } else {
      repondre(zk, dest, ms, "Sorry, you are not an administrator of the group.");
    }
  }
});

// Info Command
keith({ nomCom: "info", categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "Command reserved for groups only.");
  }

  let ppgroup;
  try {
    ppgroup = await zk.profilePictureUrl(dest, 'image');
  } catch {
    ppgroup = conf.URL;
  }

  const info = await zk.groupMetadata(dest);
  const mess = {
    image: { url: ppgroup },
    caption: `*━━━━『GROUP INFO』━━━━*\n\n*🎐 Name:* ${info.subject}\n\n*🔩 Group's ID:* ${dest}\n\n*🔍 Description:* \n\n${info.desc}`
  };

  await sendMessage(zk, dest, ms, mess);
});

// Antilink Command
keith({ nomCom: "antilink", categorie: 'Group', reaction: "🔗" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifGroupe, superUser, verifAdmin } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "*For groups only*");
  }

  if (superUser || verifAdmin) {
    const enetatoui = await verifierEtatJid(dest);
    try {
      if (!arg || !arg[0] || arg === ' ') {
        return repondre(zk, dest, ms, "antilink on to activate the anti-link feature\nantilink off to deactivate the anti-link feature\nantilink action/remove to directly remove the link without notice\nantilink action/warn to give warnings\nantilink action/delete to remove the link without any sanctions\n\nPlease note that by default, the anti-link feature is set to delete.");
      }

      if (arg[0] === 'on') {
        if (enetatoui) {
          repondre(zk, dest, ms, "The antilink is already activated for this group.");
        } else {
          await ajouterOuMettreAJourJid(dest, "oui");
          repondre(zk, dest, ms, "The antilink is activated successfully.");
        }
      } else if (arg[0] === "off") {
        if (enetatoui) {
          await ajouterOuMettreAJourJid(dest, "non");
          repondre(zk, dest, ms, "The antilink has been successfully deactivated.");
        } else {
          repondre(zk, dest, ms, "Antilink is not activated for this group.");
        }
      } else if (arg.join('').split("/")[0] === 'action') {
        const action = (arg.join('').split("/")[1]).toLowerCase();
        if (action === 'remove' || action === 'warn' || action === 'delete') {
          await mettreAJourAction(dest, action);
          repondre(zk, dest, ms, `The anti-link action has been updated to ${action}.`);
        } else {
          repondre(zk, dest, ms, "The only actions available are warn, remove, and delete.");
        }
      } else {
        repondre(zk, dest, ms, "antilink on to activate the anti-link feature\nantilink off to deactivate the anti-link feature\nantilink action/remove to directly remove the link without notice\nantilink action/warn to give warnings\nantilink action/delete to remove the link without any sanctions\n\nPlease note that by default, the anti-link feature is set to delete.");
      }
    } catch (error) {
      repondre(zk, dest, ms, error);
    }
  } else {
    repondre(zk, dest, ms, 'You are not entitled to this command.');
  }
});

// Antibot Command
keith({ nomCom: "antibot", categorie: 'Group', reaction: "🔗" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifGroupe, superUser, verifAdmin } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "*For groups only*");
  }

  if (superUser || verifAdmin) {
    const enetatoui = await atbverifierEtatJid(dest);
    try {
      if (!arg || !arg[0] || arg === ' ') {
        return repondre(zk, dest, ms, 'antibot on to activate the anti-bot feature\nantibot off to deactivate the antibot feature\nantibot action/remove to directly remove the bot without notice\nantibot action/warn to give warnings\nantibot action/delete to remove the bot message without any sanctions\n\nPlease note that by default, the anti-bot feature is set to delete.');
      }

      if (arg[0] === 'on') {
        if (enetatoui) {
          repondre(zk, dest, ms, "The antibot is already activated for this group.");
        } else {
          await atbajouterOuMettreAJourJid(dest, "oui");
          repondre(zk, dest, ms, "The antibot is successfully activated.");
        }
      } else if (arg[0] === "off") {
        if (enetatoui) {
          await atbajouterOuMettreAJourJid(dest, "non");
          repondre(zk, dest, ms, "The antibot has been successfully deactivated.");
        } else {
          repondre(zk, dest, ms, "Antibot is not activated for this group.");
        }
      } else if (arg.join('').split("/")[0] === 'action') {
        const action = (arg.join('').split("/")[1]).toLowerCase();
        if (action === 'remove' || action === 'warn' || action === 'delete') {
          await mettreAJourAction(dest, action);
          repondre(zk, dest, ms, `The anti-bot action has been updated to ${action}.`);
        } else {
          repondre(zk, dest, ms, "The only actions available are warn, remove, and delete.");
        }
      } else {
        repondre(zk, dest, ms, 'antibot on to activate the anti-bot feature\nantibot off to deactivate the antibot feature\nantibot action/remove to directly remove the bot without notice\nantibot action/warn to give warnings\nantibot action/delete to remove the bot message without any sanctions\n\nPlease note that by default, the anti-bot feature is set to delete.');
      }
    } catch (error) {
      repondre(zk, dest, ms, error);
    }
  } else {
    repondre(zk, dest, ms, 'You are not entitled to this command.');
  }
});

// Group Command
keith({ nomCom: "group", categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe, verifAdmin, superUser, arg } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "Command reserved for groups only.");
  }

  if (superUser || verifAdmin) {
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Instructions:\n\nType group open or close');
    }

    const option = arg.join(' ');
    switch (option) {
      case "open":
        await zk.groupSettingUpdate(dest, 'not_announcement');
        repondre(zk, dest, ms, 'Group opened successfully.');
        break;
      case "close":
        await zk.groupSettingUpdate(dest, 'announcement');
        repondre(zk, dest, ms, 'Group closed successfully.');
        break;
      default:
        repondre(zk, dest, ms, "Please don't invent an option.");
    }
  } else {
    repondre(zk, dest, ms, "Command reserved for the administrator.");
  }
});

// Left Command
keith({ nomCom: "left", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe, superUser } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "Command reserved for groups only.");
  }

  if (!superUser) {
    return repondre(zk, dest, ms, "Command reserved for the bot owner.");
  }

  await repondre(zk, dest, ms, 'Sayonara');
  await zk.groupLeave(dest);
});

// Gname Command
keith({ nomCom: "gname", categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    return repondre(zk, dest, ms, "Command reserved for administrators of the group.");
  }

  if (!arg[0]) {
    return repondre(zk, dest, ms, "Please enter the group name.");
  }

  const nom = arg.join(' ');
  await zk.groupUpdateSubject(dest, nom);
  repondre(zk, dest, ms, `Group name updated: *${nom}*`);
});

// Gdesc Command
keith({ nomCom: "gdesc", categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    return repondre(zk, dest, ms, "Command reserved for administrators of the group.");
  }

  if (!arg[0]) {
    return repondre(zk, dest, ms, "Please enter the group description.");
  }

  const nom = arg.join(' ');
  await zk.groupUpdateDescription(dest, nom);
  repondre(zk, dest, ms, `Group description updated: *${nom}*`);
});

// Gpp Command
keith({ nomCom: "gpp", categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, msgRepondu, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    return repondre(zk, dest, ms, "Command reserved for administrators of the group.");
  }

  if (msgRepondu.imageMessage) {
    const pp = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
    await zk.updateProfilePicture(dest, { url: pp })
      .then(() => {
        repondre(zk, dest, ms, "Group profile picture changed.");
        fs.unlinkSync(pp);
      })
      .catch((err) => repondre(zk, dest, ms, err));
  } else {
    repondre(zk, dest, ms, 'Please mention an image.');
  }
});

// Hidetag Command
keith({ nomCom: "hidetag", categorie: 'Group', reaction: "🎤" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, msgRepondu, verifGroupe, arg, verifAdmin, superUser } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, 'This command is only allowed in groups.');
  }

  if (verifAdmin || superUser) {
    const metadata = await zk.groupMetadata(dest);
    const tag = metadata.participants.map(p => p.id);

    if (msgRepondu) {
      let msg;
      if (msgRepondu.imageMessage) {
        const media = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
        msg = {
          image: { url: media },
          caption: msgRepondu.imageMessage.caption,
          mentions: tag
        };
      } else if (msgRepondu.videoMessage) {
        const media = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
        msg = {
          video: { url: media },
          caption: msgRepondu.videoMessage.caption,
          mentions: tag
        };
      } else if (msgRepondu.audioMessage) {
        const media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
        msg = {
          audio: { url: media },
          mimetype: 'audio/mp4',
          mentions: tag
        };
      } else if (msgRepondu.stickerMessage) {
        const media = await zk.downloadAndSaveMediaMessage(msgRepondu.stickerMessage);
        const stickerMess = new Sticker(media, {
          pack: 'ALPHA-MD-tag',
          type: StickerTypes.CROPPED,
          categories: ["🤩", "🎉"],
          id: "12345",
          quality: 70,
          background: "transparent"
        });
        const stickerBuffer2 = await stickerMess.toBuffer();
        msg = { sticker: stickerBuffer2, mentions: tag };
      } else {
        msg = {
          text: msgRepondu.conversation,
          mentions: tag
        };
      }
      await sendMessage(zk, dest, ms, msg);
    } else {
      if (!arg || !arg[0]) {
        return repondre(zk, dest, ms, 'Enter the text to announce or mention the message to announce.');
      }
      await sendMessage(zk, dest, ms, {
        text: arg.join(' '),
        mentions: tag
      });
    }
  } else {
    repondre(zk, dest, ms, 'Command reserved for administrators.');
  }
});

// Automute Command
keith({ nomCom: "automute", categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    return repondre(zk, dest, ms, 'You are not an administrator of the group.');
  }

  const group_cron = await cron.getCronById(dest);

  if (!arg || arg.length === 0) {
    let state;
    if (group_cron == null || group_cron.mute_at == null) {
      state = "No time set for automatic mute.";
    } else {
      state = `The group will be muted at ${group_cron.mute_at.split(':')[0]} ${group_cron.mute_at.split(':')[1]}`;
    }

    const msg = `*State:* ${state}\n*Instructions:* To activate automatic mute, add the minute and hour after the command separated by ':'\nExample: automute 9:30\n*To delete the automatic mute, use the command *automute del*`;
    repondre(zk, dest, ms, msg);
  } else {
    const texte = arg.join(' ');
    if (texte.toLowerCase() === 'del') {
      if (group_cron == null) {
        repondre(zk, dest, ms, 'No cron job is active.');
      } else {
        await cron.delCron(dest);
        repondre(zk, dest, ms, "The automatic mute has been removed; restart to apply changes.")
          .then(() => exec("pm2 restart all"));
      }
    } else if (texte.includes(':')) {
      await cron.addCron(dest, "mute_at", texte);
      repondre(zk, dest, ms, `Setting up automatic mute for ${texte}; restart to apply changes.`)
        .then(() => exec("pm2 restart all"));
    } else {
      repondre(zk, dest, ms, 'Please enter a valid time with hour and minute separated by ":".');
    }
  }
});

// Autounmute Command
keith({ nomCom: "autounmute", categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    return repondre(zk, dest, ms, 'You are not an administrator of the group.');
  }

  const group_cron = await cron.getCronById(dest);

  if (!arg || arg.length === 0) {
    let state;
    if (group_cron == null || group_cron.unmute_at == null) {
      state = "No time set for autounmute.";
    } else {
      state = `The group will be un-muted at ${group_cron.unmute_at.split(':')[0]}H ${group_cron.unmute_at.split(':')[1]}`;
    }

    const msg = `*State:* ${state}\n*Instructions:* To activate autounmute, add the minute and hour after the command separated by ':'\nExample: autounmute 7:30\n*To delete autounmute, use the command *autounmute del*`;
    repondre(zk, dest, ms, msg);
  } else {
    const texte = arg.join(' ');
    if (texte.toLowerCase() === 'del') {
      if (group_cron == null) {
        repondre(zk, dest, ms, 'No cron job has been activated.');
      } else {
        await cron.delCron(dest);
        repondre(zk, dest, ms, "The autounmute has been removed; restart to apply changes.")
          .then(() => exec("pm2 restart all"));
      }
    } else if (texte.includes(':')) {
      await cron.addCron(dest, "unmute_at", texte);
      repondre(zk, dest, ms, `Setting up autounmute for ${texte}; restart to apply changes.`)
        .then(() => exec("pm2 restart all"));
    } else {
      repondre(zk, dest, ms, 'Please enter a valid time with hour and minute separated by ":".');
    }
  }
});

// Fkick Command
keith({ nomCom: "fkick", categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifAdmin, superUser, verifZokouAdmin } = commandeOptions;

  if (verifAdmin || superUser) {
    if (!verifZokouAdmin) {
      return repondre(zk, dest, ms, 'You need administrative rights to perform this command.');
    }

    if (!arg || arg.length === 0) {
      return repondre(zk, dest, ms, 'Please enter the country code whose members will be removed.');
    }

    const metadata = await zk.groupMetadata(dest);
    const participants = metadata.participants;

    for (let i = 0; i < participants.length; i++) {
      if (participants[i].id.startsWith(arg[0]) && participants[i].admin === null) {
        await zk.groupParticipantsUpdate(dest, [participants[i].id], "remove");
      }
    }
  } else {
    repondre(zk, dest, ms, 'Sorry, you are not an administrator of the group.');
  }
});

// NSFW Command
keith({ nomCom: "nsfw", categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    return repondre(zk, dest, ms, 'Sorry, you cannot enable NSFW content without being an administrator of the group.');
  }

  const hbd = require('../bdd/hentai');
  const isHentaiGroupe = await hbd.checkFromHentaiList(dest);

  if (arg[0] === 'on') {
    if (isHentaiGroupe) {
      return repondre(zk, dest, ms, 'NSFW content is already active for this group.');
    }
    await hbd.addToHentaiList(dest);
    repondre(zk, dest, ms, 'NSFW content is now active for this group.');
  } else if (arg[0] === 'off') {
    if (!isHentaiGroupe) {
      return repondre(zk, dest, ms, 'NSFW content is already disabled for this group.');
    }
    await hbd.removeFromHentaiList(dest);
    repondre(zk, dest, ms, 'NSFW content is now disabled for this group.');
  } else {
    repondre(zk, dest, ms, 'You must enter "on" or "off".');
  }
});

// Broadcast Command
keith({ nomCom: "broadcast", aliase: "spread", categorie: "Group", reaction: '⚪' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, superUser, nomAuteurMessage } = commandeOptions;

  if (!arg[0]) {
    return repondre(zk, dest, ms, "After the command *broadcast*, type your message to be sent to all groups you are in.");
  }

  if (!superUser) {
    return repondre(zk, dest, ms, "You are too weak to do that.");
  }

  const groups = await zk.groupFetchAllParticipating();
  const groupIds = Object.values(groups).map(group => group.id);
  await repondre(zk, dest, ms, "*ALPHA-MD is sending your message to all groups...💀*");

  const broadcastMessage = `*🌟 ALPHA-MD BROADCAST 🌟*\n\n🀄 Message: ${arg.join(" ")}\n\n🗣️ Author: ${nomAuteurMessage}`;
  for (let groupId of groupIds) {
    await sendMessage(zk, groupId, ms, {
      image: { url: 'https://i.imgur.com/HDLN3If.jpeg' },
      caption: broadcastMessage
    });
  }
});

// Disappearing Messages Command
const handleDisapCommand = async (dest, zk, commandeOptions, duration) => {
  const { ms, repondre, verifGroupe, verifAdmin } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "This command works in groups only.");
  }

  if (!verifAdmin) {
    return repondre(zk, dest, ms, "You are not an admin here!");
  }

  await zk.groupToggleEphemeral(dest, duration);
  repondre(zk, dest, ms, `Disappearing messages successfully turned on for ${duration / 86400} day(s)!`);
};

// Disappearing Messages Off Command
keith({ nomCom: "disap-off", categorie: "Group", reaction: '㋛' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe, verifAdmin } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "This command works in groups only.");
  }

  if (!verifAdmin) {
    return repondre(zk, dest, ms, "You are not an admin here!");
  }

  await zk.groupToggleEphemeral(dest, 0);
  repondre(zk, dest, ms, "Disappearing messages successfully turned off!");
});

// Poll Command
keith({ nomCom: "poll", reaction: '✨', categorie: "Group" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  const [question, ...options] = arg.join(" ").split('/');

  if (options.length < 2) {
    return repondre(zk, dest, ms, "Incorrect format. Example: poll what is 1+1/2, 3, 4");
  }

  const pollOptions = options[0].split(',').map(option => option.trim());

  await sendMessage(zk, dest, ms, {
    poll: {
      name: question,
      values: pollOptions
    }
  });
});

// Disappearing Messages Setup Command
keith({ nomCom: 'disap', categorie: "Group", reaction: '❦' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe, verifAdmin } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "This command works in groups only.");
  }

  if (!verifAdmin) {
    return repondre(zk, dest, ms, "You are not an admin here!");
  }

  repondre(zk, dest, ms, "*Do you want to turn on disappearing messages?*\n\nType one of the following:\n*disap1* for 1 day\n*disap7* for 7 days\n*disap90* for 90 days\nOr type *disap-off* to turn it off.");
});

// Disappearing Messages Commands (1, 7, 90 days)
keith({ nomCom: "disap1", categorie: "Group", reaction: '⚪' }, async (dest, zk, commandeOptions) => {
  handleDisapCommand(dest, zk, commandeOptions, 86400); // 1 day
});
keith({ nomCom: "disap7", categorie: 'Group', reaction: '⚪' }, async (dest, zk, commandeOptions) => {
  handleDisapCommand(dest, zk, commandeOptions, 604800); // 7 days
});
keith({ nomCom: "disap90", categorie: 'Group', reaction: '⚪' }, async (dest, zk, commandeOptions) => {
  handleDisapCommand(dest, zk, commandeOptions, 7776000); // 90 days
});

// Requests Command
keith({ nomCom: 'req', alias: 'requests', categorie: "Group", reaction: "⚪" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe, verifAdmin } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "This command works in groups only.");
  }

  if (!verifAdmin) {
    return repondre(zk, dest, ms, "You are not an admin here!");
  }

  const pendingRequests = await zk.groupRequestParticipantsList(dest);
  if (pendingRequests.length === 0) {
    return repondre(zk, dest, ms, "There are no pending join requests.");
  }

  const requestList = pendingRequests.map(request => `+${request.jid.split('@')[0]}`).join("\n");
  await sendMessage(zk, dest, ms, {
    text: `Pending Participants:- 🕓\n${requestList}\n\nUse the command approve or reject to approve or reject these join requests.`
  });
});

// Approve/Reject Requests Command
const handleRequestCommand = async (dest, zk, commandeOptions, action) => {
  const { ms, repondre, verifGroupe, verifAdmin } = commandeOptions;

  if (!verifGroupe) {
    return repondre(zk, dest, ms, "This command works in groups only.");
  }

  if (!verifAdmin) {
    return repondre(zk, dest, ms, "You are not an admin here!");
  }

  const pendingRequests = await zk.groupRequestParticipantsList(dest);
  if (pendingRequests.length === 0) {
    return repondre(zk, dest, ms, `There are no pending join requests for this group.`);
  }

  for (const request of pendingRequests) {
    await zk.groupRequestParticipantsUpdate(dest, [request.jid], action);
  }

  repondre(zk, dest, ms, `All pending join requests have been ${action === "approve" ? "approved" : "rejected"}.`);
};

// Approve Requests Command
keith({ nomCom: "approve", categorie: "Group", reaction: "⚪" }, (dest, zk, commandeOptions) => handleRequestCommand(dest, zk, commandeOptions, "approve"));

// Reject Requests Command
keith({ nomCom: "reject", categorie: "Group", reaction: "⚪" }, (dest, zk, commandeOptions) => handleRequestCommand(dest, zk, commandeOptions, "reject"));
