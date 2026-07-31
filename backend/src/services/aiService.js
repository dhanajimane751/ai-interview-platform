const Groq = require("groq-sdk");
const { GROQ_API_KEY, GROQ_MODEL } = require("../config/env");

const groq = new Groq({ apiKey: GROQ_API_KEY });

const callWithRetry = async (fn, retries = 2, delayMs = 5000) => {
  try {
    return await fn();
  } catch (error) {
    const isRateLimit = error.status === 429 || error.message?.includes("rate_limit");
    if (isRateLimit && retries > 0) {
      console.warn(`Rate limited. Retrying in ${delayMs / 1000}s... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return callWithRetry(fn, retries - 1, delayMs);
    }
    throw error;
  }
};

const buildInterviewerPersona = (company, difficulty) => {
  const style = company?.interviewStyle || "Generic";
  const persona = company?.promptPersona;

  return `
You are a professional, realistic AI interviewer conducting a live mock interview.
Interview style: ${style}.
Difficulty: ${difficulty || "Medium"}.
${persona ? `Persona notes: ${persona}` : ""}

Rules:
- Ask ONE question at a time.
- Sound human, warm, and professional — not robotic.
- Wait for the candidate to finish before responding.
- Ask relevant follow-ups based on their previous answers.
- Politely redirect if the candidate rambles too long.
- Never break character or mention you are an AI model.
`;
};

/**
 * Generates the first interview question.
 */
const generateFirstQuestion = async ({ role, company, resumeSummary, jobDescription, difficulty }) => {
  const systemPrompt = buildInterviewerPersona(company, difficulty);

  const userPrompt = `
Candidate role: ${role}
Resume summary: ${resumeSummary || "Not provided"}
Job description: ${jobDescription || "Not provided"}

Start the interview. Greet the candidate briefly and professionally, explain the interview will
have a few rounds, ask permission to begin, then ask the first question.
Keep it natural and conversational, like a real interviewer speaking out loud.
`;

  const completion = await callWithRetry(() =>
    groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    })
  );

  return completion.choices[0].message.content.trim();
};

/**
 * Generates a follow-up or next question based on conversation history.
 * conversationHistory: [{ role: "assistant"/"user", content: "..." }]
 */
const generateNextQuestion = async ({ role, company, difficulty, conversationHistory }) => {
  const systemPrompt = buildInterviewerPersona(company, difficulty);

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    {
      role: "user",
      content:
        "Based on the candidate's last answer, either ask a natural follow-up question or move to the next relevant question. Keep it concise and realistic.",
    },
  ];

  const completion = await callWithRetry(() =>
    groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
    })
  );

  return completion.choices[0].message.content.trim();
};

/**
 * Analyzes the full interview and generates a structured report.
 */
const generateInterviewReport = async ({ role, company, answers, cheatingFlags }) => {
  const qaPairs = answers
    .filter((a) => a.answerText)
    .map((a, i) => `Q${i + 1}: ${a.questionText}\nA${i + 1}: ${a.answerText}`)
    .join("\n\n");

  const flagsSummary =
    cheatingFlags && cheatingFlags.length > 0
      ? `\nProctoring flags detected during interview: ${cheatingFlags.join("; ")}`
      : "\nNo proctoring flags detected during interview.";

  const prompt = `
Role: ${role}
Company style: ${company?.interviewStyle || "Generic"}

Interview transcript:
${qaPairs}
${flagsSummary}

Analyze this interview and return a JSON object with EXACTLY this structure, and NOTHING else
(no markdown, no code fences, no explanation text before or after):
{
  "overallScore": number (0-100),
  "technicalScore": number (0-100),
  "communicationScore": number (0-100),
  "confidenceScore": number (0-100),
  "grammarScore": number (0-100),
  "professionalismScore": number (0-100),
  "timeManagementScore": number (0-100),
  "strengths": [string, string, string],
  "weaknesses": [string, string, string],
  "recommendedImprovements": [string, string, string],
  "aiSuggestions": string (2-3 sentences),
  "hiringProbability": number (0-100),
  "expectedRating": string (e.g. "Strong Hire", "Hire", "Lean Hire", "No Hire")
}

If proctoring flags were detected, factor them into the professionalism score and mention them briefly in aiSuggestions.
`;

  const completion = await callWithRetry(() =>
    groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical interview evaluator. Return ONLY valid JSON, no markdown, no code fences, no extra text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    })
  );

  let text = completion.choices[0].message.content.trim();
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  return JSON.parse(text);
};

module.exports = { generateFirstQuestion, generateNextQuestion, generateInterviewReport };