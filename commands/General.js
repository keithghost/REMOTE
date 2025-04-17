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


keith({
  nomCom: "logogen",
  aliases: ["logogenarate", "generatelogo", "webscrap"],
  categorie: "Ai",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions; // Added 'ms' which was missing
  const text = arg.join(" ");

  if (!text) {
    return repondre("Enter title, idea, and slogan.\nFormat: _logogen Title|Idea|Slogan_\n\n*Example:* _logogen DreadedTech|AI-Powered Services|Innovation Meets Simplicity_");
  }

  const [title, idea, slogan] = text.split("|");

  if (!title || !idea || !slogan) {
    return repondre("Incorrect format.\nUse: _logogen Title|Idea|Slogan_");
  }

  try {
    const payload = {
      ai_icon: [333276, 333279],
      height: 300,
      idea,
      industry_index: "N",
      industry_index_id: "",
      pagesize: 4,
      session_id: "",
      slogan,
      title,
      whiteEdge: 80,
      width: 400,
    };

    const { data } = await axios.post("https://www.sologo.ai/v1/api/logo/logo_generate", payload);

    if (!data.data?.logoList || data.data.logoList.length === 0) {
      return repondre("Failed to generate logo. Please try again.");
    }

    for (const logo of data.data.logoList) {
      await zk.sendMessage(dest, {
        image: { url: logo.logo_thumb }, // Fixed typo in property name
        caption: `_Generated Logo for "${title}"_`
      }, { quoted: ms });
    }
  } catch (err) {
    console.error("Logo generation error:", err);
    await repondre("An error occurred while creating the logo.");
  }
});
