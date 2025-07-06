const path = require('path');
const { keith } = require('../commandHandler');
const wordList = require('word-list'); // The npm package

// Load words from the word-list package
const wordPool = wordList
    .split('\n')
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length >= 3 && w.length <= 10 && /^[a-z]+$/.test(w));

const sessions = {};

function isValidWord(word, criteria) {
    if (!wordPool.includes(word)) return false;
    if (word.length !== criteria.length) return false;
    if (criteria.end && !word.endsWith(criteria.end)) return false;
    return true;
}

function pickWord(session) {
    const length = Math.floor(Math.random() * 8) + 3; 
    const end = Math.random() < 0.5 ? null : String.fromCharCode(97 + Math.floor(Math.random() * 26));

    let pool = wordPool.filter(w =>
        w.length === length &&
        (!end || w.endsWith(end)) &&
        !session.usedWords.has(w)
    );

    if (pool.length === 0) return pickWord(session); 

    const word = pool[Math.floor(Math.random() * pool.length)];
    session.usedWords.add(word); 

    const criteria = { length, end };
    return { word, clue: `🧠 Guess a ${length}-letter word${end ? ` ending with "${end}"` : ""}!`, criteria };
}

function getSessionId(context) {
    const { m, user } = context;
    if (m.isGroup) {
        return m.chat;
    } else {
        const participants = [m.sender, user?.jid || m.sender].sort();
        return `private_${participants.join('_')}`;
    }
}

keith({
    pattern: "gwrd",
    alias: ["wordguess", "gw"],
    desc: "Word guessing game for 2 players",
    category: "Game",
    react: "➕",
    filename: __filename
}, async (context) => {
    const { client, m, prefix, user } = context;
    const sessionId = getSessionId(context);
    const senderId = m.sender;
    const text = m.text.trim();
    const args = text.split(" ").slice(1);

    if (!sessions[sessionId]) {
        sessions[sessionId] = {
            players: {},
            started: false,
            finished: false,
            currentWord: null,
            currentCriteria: null,
            round: 0,
            timeoutRef: null,
            questionMessageId: null,
            eventListenerActive: false,
            _eventHandler: null,
            usedWords: new Set(),
            isPrivate: !m.isGroup
        };
    }

    const session = sessions[sessionId];

    if (args.length === 0) {
        return await client.sendMessage(m.chat, {
            text: `🔤 *Word Guessing Game*\n\n` +
                `2 players required. First to answer wins the point.\n\n` +
                `📘 *Usage:*\n` +
                `• ${prefix}gword join — join game\n` +
                `• ${prefix}gword leave — leave game\n` +
                `• ${prefix}gword players — view players\n` +
                `• ${prefix}gword scores — view scores\n` +
                `• Reply to question messages with your guess!`
        }, { quoted: m });
    }

    const sub = args[0].toLowerCase();

    if (sub === "join") {
        if (session.players[senderId]) {
            return await client.sendMessage(m.chat, {
                text: `🕹️ You've already joined.`
            }, { quoted: m });
        }

        if (Object.keys(session.players).length >= 2) {
            return await client.sendMessage(m.chat, {
                text: `❌ 2 players already joined.`
            }, { quoted: m });
        }

        session.players[senderId] = {
            display: senderId,
            score: 0
        };

        if (Object.keys(session.players).length === 1) {
            return await client.sendMessage(m.chat, {
                text: `✅ You joined.\n⏳ Waiting for opponent...`
            }, { quoted: m });
        }

        session.started = true;
        const players = Object.values(session.players);

        const introMessage = await client.sendMessage(m.chat, {
            text: `✅ @${senderId.split("@")[0]} joined.\n\n🎮 Game starting!\n\n⚡ First to answer gets the point!\nReply to question messages with your guess!`,
            mentions: [senderId]
        }, { quoted: m });

        return await askQuestion(sessionId, { ...context, m: introMessage });
    }

    if (sub === "leave") {
        if (!session.players[senderId]) {
            return await client.sendMessage(m.chat, {
                text: `🚫 You're not in this game.`
            }, { quoted: m });
        }

        const opponent = Object.keys(session.players).find(p => p !== senderId);
        clearTimeout(session.timeoutRef);
        session.eventListenerActive = false;

        if (session._eventHandler) {
            client.ev.off("messages.upsert", session._eventHandler);
        }

        delete sessions[sessionId];

        if (opponent) {
            return await client.sendMessage(m.chat, {
                text: `🚪 You left the game.\n🏆 @${session.players[opponent].display.split("@")[0]} has won...`,
                mentions: [session.players[opponent].display]
            }, { quoted: m });
        } else {
            return await client.sendMessage(m.chat, {
                text: `🚪 You left the game.`
            }, { quoted: m });
        }
    }

    if (sub === "players") {
        const playerList = Object.values(session.players);
        if (playerList.length === 0) {
            return await client.sendMessage(m.chat, {
                text: `No one has joined.`
            }, { quoted: m });
        }

        const textList = playerList.map(p => `- @${p.display.split("@")[0]}`).join("\n");
        return await client.sendMessage(m.chat, {
            text: `👥 Players:\n${textList}`,
            mentions: playerList.map(p => p.display)
        }, { quoted: m });
    }

    if (sub === "scores") {
        if (!session.started) {
            return await client.sendMessage(m.chat, {
                text: `Game hasn't started yet.`
            }, { quoted: m });
        }

        const scoresText = Object.values(session.players).map(
            p => `- @${p.display.split("@")[0]}: ${p.score}/10`
        ).join("\n");

        return await client.sendMessage(m.chat, {
            text: `📊 Scores:\n${scoresText}`,
            mentions: Object.values(session.players).map(p => p.display)
        }, { quoted: m });
    }

    if (!session.started || session.finished) {
        return await client.sendMessage(m.chat, {
            text: `❌ Please reply to the question message with your guess!`
        }, { quoted: m });
    }
});

async function askQuestion(sessionId, context) {
    const { client, m } = context;
    const session = sessions[sessionId];

    if (!session || session.finished) return;

    const { word, clue, criteria } = pickWord(session);
    session.currentWord = word;
    session.currentClue = clue;
    session.currentCriteria = criteria;
    session.round++;

    console.log(`[${sessionId}] ❓ Round ${session.round}: "${clue}" — answer: "${word}"`);

    const questionMessage = await client.sendMessage(m.chat, {
        text: `🔤 Round ${session.round}/20\n${clue}\n📝 Reply to this message with your guess!`,
        mentions: Object.values(session.players).map(p => p.display)
    }, { quoted: m });

    session.questionMessageId = questionMessage.key.id;
    session.eventListenerActive = true;

    if (session._eventHandler) {
        client.ev.off("messages.upsert", session._eventHandler);
    }

    const eventHandler = async (update) => {
        try {
            if (!update?.messages?.[0]) return;
            if (!session.eventListenerActive) return;

            const msg = update.messages[0];
            const chatId = msg.key.remoteJid;
            const responderId = msg.key.participant || msg.key.remoteJid;
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
            const stanzaId = contextInfo?.stanzaId;

            const isReplyToQuestion = stanzaId === session.questionMessageId;
            const isFromPlayer = session.players[responderId];
            const isCorrectChat = session.isPrivate ? 
                (chatId === sessionId.split('_')[1] || chatId === sessionId.split('_')[2]) : 
                (chatId === sessionId);

            if (!isReplyToQuestion || !isCorrectChat || !isFromPlayer) return;

            const userAnswer = (
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                ""
            ).toLowerCase().trim();

            console.log(`[${sessionId}] 🧠 @${responderId.split("@")[0]} guessed: "${userAnswer}"`);

            await client.sendMessage(chatId, {
                react: { text: '🤖', key: msg.key }
            });

            if (session.usedWords.has(userAnswer)) {
                return await client.sendMessage(chatId, {
                    text: `⚠️ The word "${userAnswer}" has already been used. Try a new word!`,
                    mentions: [session.players[responderId].display]
                }, { quoted: msg });
            }

            const isCorrect = isValidWord(userAnswer, session.currentCriteria);

            if (isCorrect) {
                session.eventListenerActive = false;
                clearTimeout(session.timeoutRef);
                client.ev.off("messages.upsert", session._eventHandler);

                session.players[responderId].score++;
                session.usedWords.add(userAnswer); 

                await client.sendMessage(chatId, {
                    text: `✅ @${session.players[responderId].display.split("@")[0]} got it! "${userAnswer}" is correct!`,
                    mentions: [session.players[responderId].display]
                }, { quoted: msg });

                if (session.round >= 20) {
                    return await endGame(client, sessionId, session);
                }

                return await askQuestion(sessionId, { ...context, m: msg });
            } else {
                session.usedWords.add(userAnswer); 
                await client.sendMessage(chatId, {
                    text: `❌ "${userAnswer}" is incorrect. Try again.`,
                    mentions: [session.players[responderId].display]
                }, { quoted: msg });
            }

        } catch (err) {
            console.error(`[${sessionId}] ❌ Error in message listener:`, err);
        }
    };

    session._eventHandler = eventHandler;
    client.ev.on("messages.upsert", eventHandler);

    session.timeoutRef = setTimeout(async () => {
        if (!session.eventListenerActive) return;

        session.eventListenerActive = false;
        client.ev.off("messages.upsert", session._eventHandler);

        console.log(`[${sessionId}] ⏱️ Time's up. Correct word: ${session.currentWord}`);

        await client.sendMessage(m.chat, {
            text: `⏱️ Time's up! An example answer was *${session.currentWord}*.`
        });

        if (session.round >= 20) {
            await endGame(client, sessionId, session);
        } else {
            await askQuestion(sessionId, context);
        }
    }, 40000);
}

async function endGame(client, sessionId, session) {
    session.finished = true;
    const players = Object.values(session.players);
    const [p1, p2] = players;
    const s1 = p1.score;
    const s2 = p2.score;
    const d1 = p1.display;
    const d2 = p2.display;

    const winner = s1 === s2 ? "🤝 It's a tie!" :
                   s1 > s2 ? `🏆 Winner: @${d1.split("@")[0]}` :
                             `🏆 Winner: @${d2.split("@")[0]}`;

    await client.sendMessage(session.isPrivate ? d1 : sessionId, {
        text: `🏁 Game Over!\n\nScores:\n- @${d1.split("@")[0]}: ${s1}/20\n- @${d2.split("@")[0]}: ${s2}/20\n\n${winner} 🎉`,
        mentions: [d1, d2]
    });

    delete sessions[sessionId];
}
