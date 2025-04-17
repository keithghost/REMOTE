const { keith } = require("../keizzah/keith");
const axios = require("axios");

keith({
  nomCom: "codegen",
  aliases: ["codegenarate", "generatecode", "webscrap"],
  categorie: "coding",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg } = commandeOptions;
  const text = arg.join(" ");
  
  if (!text) {
    return repondre("Example usage:\n.codegen Function to calculate triangle area|Python");
  }

  let [prompt, language] = text.split("|").map(v => v.trim());

  if (!prompt || !language) {
    return repondre(
      "Invalid format!\nUse the format:\n.codegen <prompt>|<language>\n\n" +
      "Example:\n.codegen Check for prime number|JavaScript"
    );
  }

  try {
    const payload = {
      customInstructions: prompt,
      outputLang: language
    };

    const { data } = await axios.post("https://www.codeconvert.ai/api/generate-code", payload);

    if (!data || typeof data !== "string") {
      return repondre("Failed to retrieve code from API.");
    }

    repondre(
      `*Generated Code (${language}):*\n` +
      "```" + language.toLowerCase() + "\n" +
      data.trim() +
      "\n```"
    );

  } catch (error) {
    console.error("Code generation error:", error);
    repondre("An error occurred while processing your request.");
  }
});
