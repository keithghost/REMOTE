const { keith } = require('../commandHandler');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
const fs = require('fs');
const PDFDocument = require('pdfkit');

keith({
  pattern: "topdf",
  alias: ["quoted2pdf", "makedoc"],
  desc: "Convert quoted text message to a PDF",
  category: "Utility",
  react: "📄",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a text message to convert to PDF.");
      }

      const quotedText = msgKeith.conversation.trim();
      const fileName = `./temp-${Date.now()}.pdf`;

      // Create a PDF with the quoted text
      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(fileName));
      doc.fontSize(14).text(quotedText, { align: 'left' });
      doc.end();

      // Wait for the file to finish writing before sending
      doc.on('finish', async () => {
        await client.sendMessage(m.chat, {
          document: { url: fileName },
          mimetype: 'application/pdf',
          fileName: 'quoted-message.pdf'
        }, { quoted: m });

        fs.unlinkSync(fileName);
      });

    } catch (err) {
      console.error("Error creating PDF:", err);
      reply("❌ Failed to convert message to PDF. Try again.");
    }
  });
});
