const { keith } = require('../commandHandler');

class TicTacToeManager {
  constructor() {
    this.games = new Map();
    this.gameTimeout = 5 * 60 * 1000; // 5 minutes
    this.timeouts = new Map();
  }

  // Helper method to validate and normalize player IDs
  normalizePlayerId(playerId) {
    if (!playerId || typeof playerId !== 'string') return null;
    // Remove any non-alphanumeric characters except @ and .
    return playerId.replace(/[^\w@.-]/g, '');
  }

  createGame(chatJid, player1, player2) {
    const normalizedPlayer1 = this.normalizePlayerId(player1);
    const normalizedPlayer2 = this.normalizePlayerId(player2);

    if (!normalizedPlayer1 || !normalizedPlayer2) {
      console.error("Invalid player IDs:", { player1, player2 });
      return {
        success: false,
        message: "Both players must have valid IDs."
      };
    }

    if (normalizedPlayer1 === normalizedPlayer2) {
      return {
        success: false,
        message: "You cannot play with yourself!"
      };
    }

    const gameId = `${normalizedPlayer1}:${normalizedPlayer2}`;

    if (!this.games.has(chatJid)) {
      this.games.set(chatJid, new Map());
    }

    const chatGames = this.games.get(chatJid);

    // Check if either player is already in a game
    for (const game of chatGames.values()) {
      if (game.players.includes(normalizedPlayer1)) {
        return {
          success: false,
          message: "You're already in a game in this chat. Finish that game first."
        };
      }
      if (game.players.includes(normalizedPlayer2)) {
        return {
          success: false,
          message: "The other player is already in a game in this chat."
        };
      }
    }

    const gameState = {
      players: [normalizedPlayer1, normalizedPlayer2],
      board: Array(9).fill(null),
      currentPlayer: normalizedPlayer1,
      symbols: {
        [normalizedPlayer1]: '❌',
        [normalizedPlayer2]: '⭕'
      },
      startTime: Date.now(),
      lastMoveTime: Date.now()
    };

    chatGames.set(gameId, gameState);
    this.setGameTimeout(chatJid, gameId);

    // Extract display names safely
    const getDisplayName = (id) => {
      if (!id) return 'Unknown';
      return id.includes('@') ? id.split('@')[0] : id;
    };

    return {
      success: true,
      message: `Game created between @${getDisplayName(normalizedPlayer1)} (❌) and @${getDisplayName(normalizedPlayer2)} (⭕)`,
      gameId,
      gameState
    };
  }

  makeMove(chatJid, playerId, position) {
    if (!this.games.has(chatJid)) return { 
      success: false, 
      message: "No active games in this chat. Start one with *tt*" 
    };

    const normalizedPlayerId = this.normalizePlayerId(playerId);
    if (!normalizedPlayerId) return {
      success: false,
      message: "Invalid player ID."
    };

    const chatGames = this.games.get(chatJid);
    let gameId = null;
    let gameState = null;

    for (const [id, game] of chatGames.entries()) {
      if (game.players.includes(normalizedPlayerId)) {
        gameId = id;
        gameState = game;
        break;
      }
    }

    if (!gameState) {
      return { 
        success: false, 
        message: "You're not in an active game. Start one with *tt*" 
      };
    }

    if (gameState.currentPlayer !== normalizedPlayerId) {
      return { success: false, message: "It's not your turn!" };
    }

    if (position < 0 || position > 8 || !Number.isInteger(position)) {
      return { 
        success: false, 
        message: "Invalid position! Choose a number between 1-9." 
      };
    }

    if (gameState.board[position] !== null) {
      return { 
        success: false, 
        message: "That position is already taken! Choose another." 
      };
    }

    gameState.board[position] = gameState.symbols[normalizedPlayerId];
    gameState.lastMoveTime = Date.now();
    this.setGameTimeout(chatJid, gameId);

    const winner = this.checkWinner(gameState.board);
    let result = null;

    if (winner) {
      result = {
        status: 'win',
        winner: normalizedPlayerId,
        symbol: gameState.symbols[normalizedPlayerId]
      };
      chatGames.delete(gameId);
      this.clearTimeout(chatJid, gameId);
    } else if (!gameState.board.includes(null)) {
      result = { status: 'draw' };
      chatGames.delete(gameId);
      this.clearTimeout(chatJid, gameId);
    } else {
      gameState.currentPlayer = gameState.players.find(p => p !== normalizedPlayerId);
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

    const normalizedPlayerId = this.normalizePlayerId(playerId);
    if (!normalizedPlayerId) return null;

    const chatGames = this.games.get(chatJid);
    for (const [gameId, game] of chatGames.entries()) {
      if (game.players.includes(normalizedPlayerId)) {
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
          // Notify players about timeout
          const inactivePlayer = game.currentPlayer;
          const opponent = game.players.find(p => p !== inactivePlayer);
          
          chatGames.delete(gameId);
          if (!chatGames.size) this.games.delete(chatJid);
          
          // This would need to be handled by the command handler
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
      return { success: false, message: "No active games in this chat." };
    }

    const normalizedPlayerId = this.normalizePlayerId(playerId);
    if (!normalizedPlayerId) return {
      success: false,
      message: "Invalid player ID."
    };

    const chatGames = this.games.get(chatJid);
    let gameId = null;
    let gameState = null;

    for (const [id, game] of chatGames.entries()) {
      if (game.players.includes(normalizedPlayerId)) {
        gameId = id;
        gameState = game;
        break;
      }
    }

    if (!gameState) {
      return { success: false, message: "You're not in an active game." };
    }

    const opponent = gameState.players.find(p => p !== normalizedPlayerId);
    chatGames.delete(gameId);
    this.clearTimeout(chatJid, gameId);
    if (!chatGames.size) this.games.delete(chatJid);

    const getDisplayName = (id) => {
      if (!id) return 'Unknown';
      return id.includes('@') ? id.split('@')[0] : id;
    };

    return {
      success: true,
      message: `Game ended by @${getDisplayName(normalizedPlayerId)}. @${getDisplayName(opponent)} wins by forfeit!`,
      opponent
    };
  }

  // New method to clean up all games (for maintenance)
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
  pattern: "tt",
  alias: ["tictactoe", "ttt"],
  desc: "Start a TicTacToe game with another user",
  category: "Games",
  react: "❌⭕",
  filename: __filename
}, async (context) => {
  const { reply, m, sender } = context;
  try {
    if (!m.quoted) return reply("Reply to someone's message to start a game with them!");
    if (m.quoted.fromMe) return reply("You can't play with the bot! Reply to another user.");

    const opponent = m.quoted.sender;
    const result = tictactoeManager.createGame(m.chat, sender, opponent);
    if (!result.success) return reply(result.message);

    const formattedBoard = tictactoeManager.formatBoard(result.gameState.board);

    const getDisplayName = (id) => {
      if (!id) return 'Unknown';
      return id.includes('@') ? id.split('@')[0] : id;
    };

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

    const getDisplayName = (id) => {
      if (!id) return 'Unknown';
      return id.includes('@') ? id.split('@')[0] : id;
    };

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

// Add periodic cleanup (optional)
setInterval(() => {
  tictactoeManager.cleanupExpiredGames();
}, 60 * 60 * 1000); // Clean up every hour
