const axios = require('axios');

async function translateText(text, targetLang) {
  try {
    const response = await axios.post('https://libretranslate.de/translate', {
      q: text,
      source: 'auto',
      target: targetLang,
      format: 'text'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    return response.data.translatedText;
  } catch (err) {
    console.error("Translation error:", err.message);
    return text; // fallback to original if error
  }
}

module.exports = { translateText };
