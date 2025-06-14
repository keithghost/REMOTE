const { keith } = require('../commandHandler');
const { parse, generate } = require('@babel/core');
const { default: traverse } = require('@babel/traverse');

keith({
    pattern: "decrypt",
    alias: ["dec", "deobfuscate"],
    desc: "Deobfuscate JavaScript code",
    category: "Coding",
    react: "🔓",
    filename: __filename
}, async (context) => {
    try {
        const { reply, m } = context;

        if (m.quoted && m.quoted.text) {
            const obfuscatedCode = m.quoted.text;

            // Step 1: Parse the obfuscated code into AST
            const ast = parse(obfuscatedCode, {
                sourceType: 'script', // or 'module' if needed
            });

            // Step 2: Simplify the AST (remove obfuscation tricks)
            traverse(ast, {
                // Fix hex/unicode strings (e.g., "\x68\x65\x6c\x6c\x6f" → "hello")
                StringLiteral(path) {
                    if (path.node.extra?.raw) {
                        path.node.value = path.node.extra.raw
                            .replace(/\\x([a-fA-F0-9]{2})/g, (_, hex) => 
                                String.fromCharCode(parseInt(hex, 16))
                            .replace(/\\u([a-fA-F0-9]{4})/g, (_, hex) => 
                                String.fromCharCode(parseInt(hex, 16)));
                        delete path.node.extra; // Clean up
                    }
                },
                // Simplify numeric expressions (e.g., 0x2a → 42)
                NumericLiteral(path) {
                    if (path.node.extra?.raw) {
                        delete path.node.extra;
                    }
                },
                // Reverse simple array-based string lookups
                MemberExpression(path) {
                    if (path.node.property?.type === 'NumericLiteral' &&
                        path.node.object?.type === 'Identifier') {
                        // Replace arr[0] with actual strings if possible
                        // (Advanced: Map array references to their values)
                    }
                }
            });

            // Step 3: Regenerate clean code
            const deobfuscatedCode = generate(ast, {
                compact: false, // Pretty-print
                comments: true,  // Preserve comments
            }).code;

            console.log("Successfully deobfuscated the code");
            reply(deobfuscatedCode);
        } else {
            reply("❌ Please quote an obfuscated JavaScript code to decrypt.");
        }
    } catch (error) {
        console.error("Error in .decrypt command:", error);
        reply("❌ Failed to deobfuscate. Is the code heavily obfuscated?");
    }
});
