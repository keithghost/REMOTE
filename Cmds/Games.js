const { words } = require('word-list');
const { keith } = require('../commandHandler');

// Initialize word pool with validation
const wordPool = words
    .map(w => w.trim().toLowerCase())
    .filter(w => {
        const len = w.length;
        return len >= 3 && len <= 10 && /^[a-z]+$/.test(w);
    });

console.log(`Game initialized with ${wordPool.length} valid words`);

const sessions = {};

// Game validation functions
function isValidWord(word, criteria) {
    return (
        wordPool.includes(word) &&
        word.length === criteria.length &&
        (!criteria.end || word.endsWith(criteria.end))
    );
}

function pickWord(session) {
    const length = Math.floor(Math.random() * 8) + 3;
    const end = Math.random() < 0.5 ? null : String.fromCharCode(97 + Math.floor(Math.random() * 26));

    const pool = wordPool.filter(w =>
        w.length === length &&
        (!end || w.endsWith(end)) &&
        !session.usedWords.has(w)
    );

    if (pool.length === 0) {
        console.warn('No valid words found with current criteria, retrying...');
        return pickWord(session);
    }

    const word = pool[Math.floor(Math.random() * pool.length)];
    session.usedWords.add(word);

    return {
        word,
        clue: `🧠 Guess a ${length}-letter word${end ? ` ending with "${end}"` : ''}!`,
        criteria: { length, end }
    };
}

// Session management
function getSessionId(context) {
    const { m, user } = context;
    return m.isGroup 
        ? m.chat 
        : `private_${[m.sender, user?.jid || m.sender].sort().join('_')}`;
}

function cleanupSession(sessionId) {
    const session = sessions[sessionId];
    if (session) {
        clearTimeout(session.timeoutRef);
        if (session._eventHandler) {
            require('@whiskeysockets/baileys').ev.off("messages.upsert", session._eventHandler);
        }
        delete sessions[sessionId];
    }
}

// Game flow functions
async function askQuestion(sessionId, context) {
    const { client, m } = context;
    const session = sessions[sessionId];

    if (!session || session.finished) return;

    try {
        const { word, clue, criteria } = pickWord(session);
        session.currentWord = word;
        session.currentCriteria = criteria;
        session.round++;

        const questionMessage = await client.sendMessage(m.chat, {
            text: `🔤 Round ${session.round}/20\n${clue}\n📝 Reply with your guess!`,
            mentions: Object.values(session.players).map(p => p.display)
        }, { quoted: m });

        session.questionMessageId = questionMessage.key.id;
        session.eventListenerActive = true;

        if (session._eventHandler) {
            client.ev.off("messages.upsert", session._eventHandler);
        }

        session._eventHandler = handleGuess(sessionId, context);
        client.ev.on("messages.upsert", session._eventHandler);

        session.timeoutRef = setTimeout(async () => {
            if (!session.eventListenerActive) return;
            session.eventListenerActive = false;
            
            await client.sendMessage(m.chat, {
                text: `⏱️ Time's up! The word was *${session.currentWord}*.`
            });

            session.round >= 20 
                ? await endGame(client, sessionId, session)
                : await askQuestion(sessionId, context);
        }, 40000);

    } catch (error) {
        console.error('Error in askQuestion:', error);
        cleanupSession(sessionId);
    }
}

function handleGuess(sessionId, context) {
    return async (update) => {
        try {
            const msg = update.messages?.[0];
            if (!msg || !sessions[sessionId]?.eventListenerActive) return;

            const { client } = context;
            const session = sessions[sessionId];
            const responderId = msg.key.participant || msg.key.remoteJid;
            
            if (!session.players[responderId]) return;

            const isReply = msg.message?.extendedTextMessage?.contextInfo?.stanzaId === session.questionMessageId;
            if (!isReply) return;

            const userAnswer = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "")
                .toLowerCase().trim();

            await client.sendMessage(msg.key.remoteJid, {
                react: { text: '🤖', key: msg.key }
            });

            if (session.usedWords.has(userAnswer)) {
                return await client.sendMessage(msg.key.remoteJid, {
                    text: `⚠️ "${userAnswer}" was already used. Try again!`,
                    mentions: [responderId]
                }, { quoted: msg });
            }

            if (isValidWord(userAnswer, session.currentCriteria)) {
                session.eventListenerActive = false;
                clearTimeout(session.timeoutRef);
                client.ev.off("messages.upsert", session._eventHandler);

                session.players[responderId].score++;
                session.usedWords.add(userAnswer);

                await client.sendMessage(msg.key.remoteJid, {
                    text: `✅ @${responderId.split('@')[0]} got it! "${userAnswer}" is correct!`,
                    mentions: [responderId]
                }, { quoted: msg });

                session.round >= 20 
                    ? await endGame(client, sessionId, session)
                    : await askQuestion(sessionId, { ...context, m: msg });
            } else {
                session.usedWords.add(userAnswer);
                await client.sendMessage(msg.key.remoteJid, {
                    text: `❌ "${userAnswer}" is incorrect. Try again.`,
                    mentions: [responderId]
                }, { quoted: msg });
            }
        } catch (error) {
            console.error('Error handling guess:', error);
        }
    };
}

async function endGame(client, sessionId, session) {
    try {
        session.finished = true;
        const players = Object.values(session.players);
        const [p1, p2] = players;
        
        const winnerText = p1.score === p2.score 
            ? "🤝 It's a tie!" 
            : p1.score > p2.score 
                ? `🏆 Winner: @${p1.display.split('@')[0]}` 
                : `🏆 Winner: @${p2.display.split('@')[0]}`;

        await client.sendMessage(session.isPrivate ? p1.display : sessionId, {
            text: `🏁 Game Over!\n\nScores:\n- @${p1.display.split('@')[0]}: ${p1.score}\n- @${p2.display.split('@')[0]}: ${p2.score}\n\n${winnerText}`,
            mentions: [p1.display, p2.display]
        });
    } catch (error) {
        console.error('Error ending game:', error);
    } finally {
        cleanupSession(sessionId);
    }
}

// Command handler
keith({
    pattern: "wordgame",
    alias: ["wg", "guessword"],
    desc: "Word guessing game for 2 players",
    category: "Game",
    react: "🧠",
    filename: __filename
}, async (context) => {
    const { client, m, prefix, user } = context;
    const sessionId = getSessionId(context);
    const senderId = m.sender;
    const args = m.text.trim().split(" ").slice(1);
    const subCommand = args[0]?.toLowerCase();

    if (!sessions[sessionId]) {
        sessions[sessionId] = {
            players: {},
            started: false,
            finished: false,
            round: 0,
            usedWords: new Set(),
            isPrivate: !m.isGroup,
            timeoutRef: null,
            questionMessageId: null,
            eventListenerActive: false,
            _eventHandler: null
        };
    }

    const session = sessions[sessionId];

    if (!subCommand) {
        return await client.sendMessage(m.chat, {
            text: `🧠 *Word Guessing Game*\n\nPlay with 2 players. Reply to questions with guesses!\n\nCommands:\n`
                + `• ${prefix}wordgame join - Join game\n`
                + `• ${prefix}wordgame leave - Quit game\n`
                + `• ${prefix}wordgame players - Show players\n`
                + `• ${prefix}wordgame scores - Show scores`
        }, { quoted: m });
    }

    switch (subCommand) {
        case 'join':
            if (session.players[senderId]) {
                return await client.sendMessage(m.chat, { text: `🔄 You're already in the game!` }, { quoted: m });
            }
            if (Object.keys(session.players).length >= 2) {
                return await client.sendMessage(m.chat, { text: `❌ Game is full (2 players max)` }, { quoted: m });
            }

            session.players[senderId] = { display: senderId, score: 0 };
            
            if (Object.keys(session.players).length === 1) {
                return await client.sendMessage(m.chat, { 
                    text: `✅ You joined! Waiting for 1 more player...` 
                }, { quoted: m });
            }

            session.started = true;
            const introMessage = await client.sendMessage(m.chat, {
                text: `🎮 Game starting! First to answer correctly wins points!\n\nReply to question messages with your guesses.`,
                mentions: Object.values(session.players).map(p => p.display)
            }, { quoted: m });
            
            return await askQuestion(sessionId, { ...context, m: introMessage });

        case 'leave':
            if (!session.players[senderId]) {
                return await client.sendMessage(m.chat, { text: `❌ You're not in this game` }, { quoted: m });
            }

            const opponentId = Object.keys(session.players).find(id => id !== senderId);
            cleanupSession(sessionId);

            return await client.sendMessage(m.chat, {
                text: opponentId 
                    ? `🚪 @${senderId.split('@')[0]} left. @${opponentId.split('@')[0]} wins by default!` 
                    : `🚪 You left the game.`,
                mentions: opponentId ? [opponentId] : []
            }, { quoted: m });

        case 'players':
            const playerList = Object.values(session.players);
            return await client.sendMessage(m.chat, {
                text: playerList.length 
                    ? `👥 Players:\n${playerList.map(p => `- @${p.display.split('@')[0]}`).join('\n')}`
                    : `No players have joined yet.`,
                mentions: playerList.map(p => p.display)
            }, { quoted: m });

        case 'scores':
            if (!session.started) {
                return await client.sendMessage(m.chat, { text: `Game hasn't started yet` }, { quoted: m });
            }
            return await client.sendMessage(m.chat, {
                text: `📊 Scores:\n${
                    Object.values(session.players)
                        .map(p => `- @${p.display.split('@')[0]}: ${p.score}`)
                        .join('\n')
                }`,
                mentions: Object.values(session.players).map(p => p.display)
            }, { quoted: m });

        default:
            return await client.sendMessage(m.chat, { 
                text: `❌ Invalid command. Use ${prefix}wordgame for help` 
            }, { quoted: m });
    }
});
