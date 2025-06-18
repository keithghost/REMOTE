const { keith } = require('../commandHandler');

class TicTacToeManager {
  constructor() {
    this.games = new Map();
    this.gameTimeout = 5 * 60 * 1000; // 5 minutes
    this.timeouts = new Map();
  }

  // Strict WhatsApp ID validation
  isValidWhatsAppId(id) {
    if (!id || typeof id !== 'string') return false;
    
    // Clean the ID first
    const cleaned = id.trim().toLowerCase().replace(/\s+/g, '');
    
    // WhatsApp ID patterns:
    // 1. 1234567890@s.whatsapp.net (standard)
    // 2. 1234567890@c.us (alternative)
    // 3. 1234567890 (just the number)
    const whatsappPattern = /^(\d+)(@[sc]\.(whatsapp\.net|us))?$/;
    
    return whatsappPattern.test(cleaned) && cleaned.length >= 10;
  }

  // Normalize to standard format: 1234567890@s.whatsapp.net
  normalizeWhatsAppId(id) {
    if (!this.isValidWhatsAppId(id)) return null;
    
    const cleaned = id.trim().toLowerCase().replace(/\s+/g, '');
    const numberPart = cleaned.split('@')[0];
    return `${numberPart}@s.whatsapp.net`;
  }

  createGame(chatJid, player1, player2) {
    // Validate both players
    const p1 = this.normalizeWhatsAppId(player1);
    const p2 = this.normalizeWhatsAppId(player2);

    if (!p1 || !p2) {
      console.error("Invalid player IDs:", { 
        originalPlayer1: player1 || 'empty', 
        originalPlayer2: player2 || 'empty',
        normalizedPlayer1: p1,
        normalizedPlayer2: p2
      });
      return {
        success: false,
        message: "❌ Invalid player IDs. Both players must have valid WhatsApp numbers."
      };
    }

    if (p1 === p2) {
      return {
        success: false,
        message: "❌ You cannot play with yourself!"
      };
    }

    const gameId = `${p1}:${p2}`;

    if (!this.games.has(chatJid)) {
      this.games.set(chatJid, new Map());
    }

    const chatGames = this.games.get(chatJid);

    // Check for existing games
    for (const game of chatGames.values()) {
      if (game.players.includes(p1)) {
        return {
          success: false,
          message: "❌ You're already in a game in this chat. Finish that game first."
        };
      }
      if (game.players.includes(p2)) {
        return {
          success: false,
          message: "❌ The other player is already in a game in this chat."
        };
      }
    }

    const gameState = {
      players: [p1, p2],
      board: Array(9).fill(null),
      currentPlayer: p1,
      symbols: {
        [p1]: '❌',
        [p2]: '⭕'
      },
      startTime: Date.now(),
      lastMoveTime: Date.now()
    };

    chatGames.set(gameId, gameState);
    this.setGameTimeout(chatJid, gameId);

    const getDisplayName = (id) => id.split('@')[0];

    return {
      success: true,
      message: `🎮 Game created between @${getDisplayName(p1)} (❌) and @${getDisplayName(p2)} (⭕)`,
      gameId,
      gameState
    };
  }

  makeMove(chatJid, playerId, position) {
    if (!this.games.has(chatJid)) return { 
      success: false, 
      message: "❌ No active games in this chat. Start one with *tt*" 
    };

    const pId = this.normalizeWhatsAppId(playerId);
    if (!pId) return {
      success: false,
      message: "❌ Invalid player ID."
    };

    const chatGames = this.games.get(chatJid);
    let gameId = null;
    let gameState = null;

    for (const [id, game] of chatGames.entries()) {
      if (game.players.includes(pId)) {
        gameId = id;
        gameState = game;
        break;
      }
    }

    if (!gameState) {
      return { 
        success: false, 
        message: "❌ You're not in an active game. Start one with *tt*" 
      };
    }

    if (gameState.currentPlayer !== pId) {
      return { success: false, message: "⏳ It's not your turn!" };
    }

    if (position < 0 || position > 8 || !Number.isInteger(position)) {
      return { 
        success: false, 
        message: "❌ Invalid position! Choose a number between 1-9." 
      };
    }

    if (gameState.board[position] !== null) {
      return { 
        success: false, 
        message: "❌ That position is already taken! Choose another." 
      };
    }

    gameState.board[position] = gameState.symbols[pId];
    gameState.lastMoveTime = Date.now();
    this.setGameTimeout(chatJid, gameId);

    const winner = this.checkWinner(gameState.board);
    let result = null;

    if (winner) {
      result = {
        status: 'win',
        winner: pId,
        symbol: gameState.symbols[pId]
      };
      chatGames.delete(gameId);
      this.clearTimeout(chatJid, gameId);
    } else if (!gameState.board.includes(null)) {
      result = { status: 'draw' };
      chatGames.delete(gameId);
      this.clearTimeout(chatJid, gameId);
    } else {
      gameState.currentPlayer = gameState.players.find(p => p !== pId);
    }

    if (chatGames.size === 0) {
      this.games.delete(chatJid);
    }

    return {
      success: true,
      board: gameState.board,
      result,
      nextPlayer: gameState.currentPlayer
    };
  }

  getGameState(chatJid, playerId) {
    if (!this.games.has(chatJid)) return null;

    const pId = this.normalizeWhatsAppId(playerId);
    if (!pId) return null;

    const chatGames = this.games.get(chatJid);
    for (const [gameId, game] of chatGames.entries()) {
      if (game.players.includes(pId)) {
        return { gameId, gameState: game };
      }
    }

    return null;
  }

  formatBoard(board) {
    const h = '┄┄┄┄┄┄┄┄┄┄┄';
    const v = '┃';
    const emoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];
    let str = `${h}\n`;

    for (let i = 0; i < 3; i++) {
      str += `${v} `;
      for (let j = 0; j < 3; j++) {
        const index = i * 3 + j;
        const cell = board[index] || emoji[index];
        str += `${cell} ${j < 2 ? v + ' ' : ''}`;
      }
      str += `${v}\n`;
      if (i < 2) str += `${h}\n`;
    }

    return str + h;
  }

  checkWinner(board) {
    const wins = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    for (const [a,b,c] of wins) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return null;
  }

  setGameTimeout(chatJid, gameId) {
    this.clearTimeout(chatJid, gameId);
    const timeout = setTimeout(() => {
      if (this.games.has(chatJid)) {
        const chatGames = this.games.get(chatJid);
        const game = chatGames.get(gameId);
        if (game) {
          const inactivePlayer = game.currentPlayer;
          const opponent = game.players.find(p => p !== inactivePlayer);
          chatGames.delete(gameId);
          if (!chatGames.size) this.games.delete(chatJid);
          console.log(`Game ${gameId} timed out due to inactivity`);
        }
      }
      this.timeouts.delete(`${chatJid}:${gameId}`);
    }, this.gameTimeout);
    this.timeouts.set(`${chatJid}:${gameId}`, timeout);
  }

  clearTimeout(chatJid, gameId) {
    const key = `${chatJid}:${gameId}`;
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
  }

  endGame(chatJid, playerId) {
    if (!this.games.has(chatJid)) {
      return { success: false, message: "❌ No active games in this chat." };
    }

    const pId = this.normalizeWhatsAppId(playerId);
    if (!pId) return {
      success: false,
      message: "❌ Invalid player ID."
    };

    const chatGames = this.games.get(chatJid);
    let gameId = null;
    let gameState = null;

    for (const [id, game] of chatGames.entries()) {
      if (game.players.includes(pId)) {
        gameId = id;
        gameState = game;
        break;
      }
    }

    if (!gameState) {
      return { success: false, message: "❌ You're not in an active game." };
    }

    const opponent = gameState.players.find(p => p !== pId);
    chatGames.delete(gameId);
    this.clearTimeout(chatJid, gameId);
    if (!chatGames.size) this.games.delete(chatJid);

    const getDisplayName = (id) => id.split('@')[0];

    return {
      success: true,
      message: `🏁 Game ended by @${getDisplayName(pId)}. @${getDisplayName(opponent)} wins by forfeit!`,
      opponent
    };
  }

  cleanupExpiredGames() {
    const now = Date.now();
    for (const [chatJid, chatGames] of this.games.entries()) {
      for (const [gameId, game] of chatGames.entries()) {
        if (now - game.lastMoveTime > this.gameTimeout) {
          chatGames.delete(gameId);
          this.clearTimeout(chatJid, gameId);
        }
      }
      if (chatGames.size === 0) {
        this.games.delete(chatJid);
      }
    }
  }
}

const tictactoeManager = new TicTacToeManager();

// Start Game Command
keith({
  pattern: "tttt",
  alias: ["tictactoe", "ttt"],
  desc: "Start a TicTacToe game with another user",
  category: "Games",
  react: "❌⭕",
  filename: __filename
}, async (context) => {
  const { reply, m, sender } = context;
  try {
    if (!m.quoted) return reply("❌ Please reply to someone's message to start a game with them!");
    if (m.quoted.fromMe) return reply("❌ You can't play with the bot! Reply to another user.");

    const opponent = m.quoted.sender;
    
    // Validate both players
    if (!tictactoeManager.isValidWhatsAppId(sender)) {
      return reply("❌ Your account doesn't have a valid WhatsApp ID!");
    }
    
    if (!tictactoeManager.isValidWhatsAppId(opponent)) {
      return reply("❌ The user you replied to doesn't have a valid WhatsApp ID!");
    }

    const result = tictactoeManager.createGame(m.chat, sender, opponent);
    if (!result.success) return reply(result.message);

    const formattedBoard = tictactoeManager.formatBoard(result.gameState.board);
    const getDisplayName = (id) => id.split('@')[0];

    await reply(
      `🎮 *TIC-TAC-TOE* 🎮\n\n${result.message}\n\n${formattedBoard}\n\n@${getDisplayName(result.gameState.currentPlayer)}'s turn (❌)\n\nTo make a move, reply with a number (1-9).\n\n*End the game with* \`\`\`ttend\`\`\``,
      { mentions: [sender, opponent] }
    );
  } catch (e) {
    console.error("TicTacToe Start Error:", e);
    reply("❌ Error starting the game. Please try again.");
  }
});

// End Game Command
keith({
  pattern: "ttend",
  desc: "End your current TicTacToe game",
  category: "Games",
  react: "🏁",
  filename: __filename
}, async (context) => {
  const { reply, m, sender } = context;
  try {
    const result = tictactoeManager.endGame(m.chat, sender);
    if (!result.success) return reply(result.message);

    await reply(result.message, { mentions: [sender, result.opponent] });
  } catch (e) {
    console.error("TicTacToe End Error:", e);
    reply("❌ Error ending the game. Please try again.");
  }
});

// Move Handler
keith({ on: "text" }, async (context) => {
  const { body, reply, m, sender } = context;
  try {
    // Only process moves if it's a single digit 1-9
    if (!/^[1-9]$/.test(body.trim())) return;
    
    const position = parseInt(body.trim()) - 1;

    const gameInfo = tictactoeManager.getGameState(m.chat, sender);
    if (!gameInfo) return;

    const moveResult = tictactoeManager.makeMove(m.chat, sender, position);
    if (!moveResult.success) return reply(moveResult.message);

    const formattedBoard = tictactoeManager.formatBoard(moveResult.board);
    const getDisplayName = (id) => id.split('@')[0];

    if (moveResult.result) {
      const otherPlayer = gameInfo.gameState.players.find(p => p !== sender);
      if (moveResult.result.status === 'win') {
        await reply(
          `🎮 *TIC-TAC-TOE* 🎮\n\n${formattedBoard}\n\n🎉 @${getDisplayName(sender)} (${moveResult.result.symbol}) has won the game! 🎉`,
          { mentions: [sender, otherPlayer] }
        );
      } else if (moveResult.result.status === 'draw') {
        await reply(
          `🎮 *TIC-TAC-TOE* 🎮\n\n${formattedBoard}\n\n🤝 The game ended in a draw! 🤝`,
          { mentions: gameInfo.gameState.players }
        );
      }
    } else {
      const nextPlayerSymbol = gameInfo.gameState.symbols[moveResult.nextPlayer];
      
      await reply(
        `🎮 *TIC-TAC-TOE* 🎮\n\n${formattedBoard}\n\n@${getDisplayName(moveResult.nextPlayer)}'s turn (${nextPlayerSymbol})`,
        { mentions: [moveResult.nextPlayer] }
      );
    }
  } catch (e) {
    console.error("TicTacToe Move Error:", e);
    reply("❌ Error processing your move. Please try again.");
  }
});

// Periodic cleanup of expired games
setInterval(() => {
  tictactoeManager.cleanupExpiredGames();
}, 60 * 60 * 1000); // Clean up every hour
