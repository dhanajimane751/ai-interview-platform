const { GEMINI_API_KEY } = require("./src/config/env");

const listModels = async () => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
  );
  const data = await res.json();
  data.models.forEach((m) => {
    console.log(m.name, "-> supports:", m.supportedGenerationMethods.join(", "));
  });
};

listModels();