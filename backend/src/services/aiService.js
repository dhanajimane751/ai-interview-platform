const Groq = require("groq-sdk");

const {
    GROQ_API_KEY,
    GROQ_MODEL,
} = require("../config/env");

const groq = new Groq({
    apiKey: GROQ_API_KEY,
});

const callWithRetry = async (
    requestFn,
    retries = 1
) => {
    try {
        return await requestFn();
    } catch (error) {
        const isRateLimit =
            error?.status === 429 ||
            error?.message
                ?.toLowerCase()
                .includes("rate limit");

        if (
            isRateLimit &&
            retries > 0
        ) {
            await new Promise(
                (resolve) =>
                    setTimeout(
                        resolve,
                        1500
                    )
            );

            return callWithRetry(
                requestFn,
                retries - 1
            );
        }

        throw error;
    }
};

const cleanQuestion = (text = "") => {
    let result = text
        .replace(
            /```[\s\S]*?```/g,
            ""
        )
        .replace(
            /\*\*/g,
            ""
        )
        .replace(
            /\*/g,
            ""
        )
        .replace(
            /^#+\s*/gm,
            ""
        )
        .replace(
            /^[-*+]\s+/gm,
            ""
        )
        .replace(
            /^\d+\.\s+/gm,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

    result = result
        .replace(
            /^(interviewer|ai interviewer|assistant)\s*:\s*/i,
            ""
        )
        .replace(
            /^(hello|hi|hey|good morning|good afternoon|good evening)[,!.\s]*/i,
            ""
        )
        .trim();

    const questionMark =
        result.lastIndexOf("?");

    if (
        questionMark !== -1
    ) {
        result = result.slice(
            0,
            questionMark + 1
        );
    }

    return result.trim();
};

const generateFirstQuestion = async ({
    role,
    company,
    resumeText,
    difficulty,
}) => {
    const hasResume =
        typeof resumeText === "string" &&
        resumeText.trim().length > 30;

    const resumeContext = hasResume
        ? resumeText
              .slice(0, 3000)
              .replace(/\s+/g, " ")
              .trim()
        : "No resume was provided.";

    const prompt = `
You are a real interviewer conducting a college campus placement technical interview.

Candidate role: ${role}
Difficulty: ${difficulty || "Medium"}
Company: ${company?.name || "Campus Placement"}

Candidate resume:
${resumeContext}

You are asking the FIRST question of the interview.

The opening must feel like a real human interviewer starting a conversation, not like an AI immediately reading a question.

Start with a very brief and natural conversational opening such as:
"Good to have you here."
"Alright, let's get started."
"Let's begin with your experience."
"Okay, let's start with something from your background."

Then ask ONE clear technical interview question.

IMPORTANT:
The opening should be very short, natural, and professional.
Do not give a long introduction.
Do not introduce yourself.
Do not explain the interview process.
Do not say "I am an AI".
Do not say "welcome to the interview" repeatedly.

If a resume is available:
Begin with a simple question about something genuinely mentioned in the resume, preferably a project, technology, internship, or implementation.

The first question should be easy-to-moderate and conversational because it is the beginning of the interview.

Example:

"Good to have you here. Let's start with your project experience. Could you briefly walk me through your Project Camp application and explain what part you personally worked on?"

Another example:

"Alright, let's get started. I noticed you worked with React and Node.js. Can you briefly explain how you used them together in one of your projects?"

If no resume is available:
Start with a natural opening and then ask a practical technical question related to the candidate's role.

Example:

"Alright, let's get started. Suppose you're building a web application for a large number of users; what would you consider when designing the backend?"

Rules:
- Include a short natural opening.
- Ask exactly ONE main question.
- Keep the complete response to 1-3 sentences.
- The opening should not be more than one short sentence.
- The question should be moderate and suitable for a fresher.
- Keep it practical.
- Do not go very deep.
- Do not ask multiple unrelated questions.
- Do not give answers.
- Do not give hints.
- Do not explain.
- If using resume information, never invent anything.
- Return only what the interviewer would actually say aloud.
`.trim();

    const completion =
        await callWithRetry(() =>
            groq.chat.completions.create({
                model: GROQ_MODEL,
                messages: [
                    {
                        role: "system",
                        content:
                            "You are an experienced and friendly college campus placement interviewer conducting a natural spoken interview with a fresher.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.65,
                max_tokens: 300,
            })
        );

    let question =
        completion.choices?.[0]?.message?.content?.trim() ||
        "";

    question = question
        .replace(/```[\s\S]*?```/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/^#+\s*/gm, "")
        .replace(/^\s*[-*+]\s+/gm, "")
        .replace(/^\s*\d+\.\s+/gm, "")
        .replace(/\s+/g, " ")
        .trim();

    if (
        !question ||
        question.length < 30
    ) {
        question = hasResume
            ? "Good to have you here. Let's start with your project experience. Could you briefly walk me through one of the projects on your resume and explain what you personally worked on?"
            : `Alright, let's get started. For a ${role} position, can you explain how you would approach solving a practical problem in a real application?`;
    }

    return question;
};

const generateNextQuestion =
    async ({
        role,
        company,
        difficulty,
        resumeText,
        conversationHistory,
    }) => {
        const hasResume =
            typeof resumeText ===
                "string" &&
            resumeText
                .trim()
                .length > 30;

        const history =
            Array.isArray(
                conversationHistory
            )
                ? conversationHistory
                : [];

        const questionNumber =
            Math.floor(
                history.length / 2
            ) + 1;

        const recentHistory =
            history
                .slice(-8)
                .map(
                    (item) => {
                        const speaker =
                            item.role ===
                            "assistant"
                                ? "INTERVIEWER"
                                : "CANDIDATE";

                        return `${speaker}: ${item.content}`;
                    }
                )
                .join("\n");

        const resumeContext =
            hasResume
                ? resumeText
                      .slice(
                          0,
                          2500
                      )
                      .replace(
                          /\s+/g,
                          " "
                      )
                      .trim()
                : "No resume was provided.";

        let targetArea = "";

        if (
            questionNumber === 2
        ) {
            targetArea =
                "OOPS";
        } else if (
            questionNumber === 3
        ) {
            targetArea =
                "DBMS/SQL";
        } else if (
            questionNumber === 4
        ) {
            targetArea =
                "Computer Networks";
        } else if (
            questionNumber === 5
        ) {
            targetArea =
                "DSA and problem solving";
        } else if (
            questionNumber === 6
        ) {
            targetArea =
                hasResume
                    ? "Resume/project or role-specific technical knowledge"
                    : "Role-specific technical knowledge";
        } else {
            targetArea =
                "Choose one useful under-tested technical area.";
        }

        const prompt = `
You are conducting a real college campus placement technical interview for a fresher.

Candidate role: ${role}
Difficulty: ${
            difficulty ||
            "Medium"
        }
Company: ${
            company?.name ||
            "Campus Placement"
        }

Candidate resume:
${resumeContext}

Interview question number:
${questionNumber}

Required topic for this question:
${targetArea}

Recent conversation:
${recentHistory ||
            "No previous conversation."}

Your job is to ask the next interview question.

The interview must cover these subjects during the interview:
1. OOPS
2. DBMS/SQL
3. Computer Networks
4. DSA/problem solving
5. Role-specific technical knowledge

These four core subjects MUST be asked whether or not a resume is provided.

If a resume is available, resume/project questions should be additional questions, not a replacement for OOPS, DBMS/SQL, CN, or DSA.

QUESTION DIFFICULTY:

Keep the question at a realistic campus-placement level.

The candidate is a fresher.

Prefer:
- practical scenarios
- common interview concepts
- moderate reasoning
- short coding/problem-solving discussions
- questions that can be answered in about 30-90 seconds

Avoid:
- very deep system design
- advanced distributed systems
- extremely complex optimization
- long architecture questions
- expert-level edge cases
- questions requiring several minutes to understand

For DSA:
Ask a normal interview problem or approach question.
Do not ask a very difficult competitive-programming problem.

For DBMS:
Prefer queries, joins, indexing, normalization, transactions, or practical database situations.

For CN:
Prefer HTTP, TCP/IP, DNS, request-response flow, latency, or common networking scenarios.

For OOPS:
Prefer classes, inheritance, polymorphism, abstraction, interfaces, encapsulation, or simple design situations.

FOLLOW-UP BEHAVIOR:

Look at the previous answer.

If the previous answer was weak:
ask one simple follow-up or move to the next topic.

If the previous answer was strong:
you may ask a slightly harder question, but stay within normal campus-placement difficulty.

Do not deeply interrogate one topic.

Do not ask three or four follow-up questions about the same answer.

The interview should move forward.

RESUME RULES:

If using the resume:
- use only information actually present
- never invent projects, technologies, roles, or responsibilities
- ask concise questions about what the candidate actually did
- do not spend the entire interview on the resume

CONVERSATION STYLE:

The interviewer should sound like a real person.

Example flow:

Interviewer:
"Can you explain the difference between method overloading and method overriding with a simple example?"

Candidate answers.

Interviewer:
"Good. Now suppose you have a SQL query that is becoming slow on a large table. What would you check first?"

Then:

"Imagine a user opens a website in their browser. At a high level, what happens between entering the URL and getting the response?"

Then:

"Suppose you need to find duplicate values in an array. What approach would you use, and what would its time complexity be?"

The questions should feel like this:
simple, clear, practical, and sequential.

Rules:
- ask exactly ONE question
- maximum 2 sentences
- normally ask one concept at a time
- no greeting
- no introduction
- no explanation
- no answer
- no hints
- no multiple unrelated questions
- do not repeat previous questions
- do not go excessively deep
- complete the entire sentence
- return ONLY the question
`.trim();

        const completion =
            await callWithRetry(
                () =>
                    groq.chat.completions.create(
                        {
                            model:
                                GROQ_MODEL,
                            messages: [
                                {
                                    role: "system",
                                    content:
                                        "You are a realistic college campus placement interviewer for fresher technical candidates. Keep interviews natural, moderate, and practical.",
                                },
                                {
                                    role: "user",
                                    content:
                                        prompt,
                                },
                            ],
                            temperature: 0.6,
                            max_tokens: 280,
                        }
                    )
            );

        let question =
            cleanQuestion(
                completion
                    .choices?.[0]
                    ?.message
                    ?.content ||
                    ""
            );

        if (
            !question ||
            question.length < 20
        ) {
            const fallbacks = {
                2: "Can you explain the difference between method overloading and method overriding with a simple example?",
                3: "Suppose a SQL query becomes slow when a table grows larger. What would you check first to improve its performance?",
                4: "When you enter a website URL in your browser, what are the main steps that happen before the page is displayed?",
                5: "Suppose you need to find duplicate values in an array. What approach would you use, and what would be its time complexity?",
            };

            question =
                fallbacks[
                    questionNumber
                ] ||
                `For a ${role} position, can you describe how you would approach solving a common technical problem in a real application?`;
        }

        return question;
    };

const generateInterviewReport =
    async ({
        role,
        company,
        answers,
        cheatingFlags,
        proctoring,
    }) => {
        const qaPairs =
            answers
                .filter(
                    (answer) =>
                        answer.answerText &&
                        answer.answerText.trim()
                )
                .map(
                    (
                        answer,
                        index
                    ) =>
                        `QUESTION ${
                            index + 1
                        }: ${
                            answer.questionText
                        }\nCANDIDATE ANSWER ${
                            index + 1
                        }: ${
                            answer.answerText
                        }`
                )
                .join("\n\n");

        const p =
            proctoring || {};

        const prompt = `
You are an expert college campus placement interviewer evaluating a fresher.

Candidate role: ${role}

INTERVIEW TRANSCRIPT:

${qaPairs}

PROCTORING DATA:

Tab switches:
${p.tabSwitches || 0}

Window focus losses:
${p.windowBlurs || 0}

Fullscreen exits:
${p.fullscreenExits || 0}

No-face events:
${p.noFaceEvents || 0}

Multiple-face events:
${p.multipleFaceEvents || 0}

Camera errors:
${p.cameraErrors || 0}

Microphone errors:
${p.microphoneErrors || 0}

Total warnings:
${p.warnings || 0}

Additional flags:
${
            cheatingFlags?.length
                ? cheatingFlags.join(
                      "; "
                  )
                : "None"
        }

Evaluate ONLY this interview.

Do not mention or evaluate any resume information.

Evaluate:
- technical knowledge
- OOPS
- DBMS/SQL
- Computer Networks
- DSA
- problem solving
- role-specific knowledge
- answer correctness
- communication
- confidence
- grammar
- professionalism
- time management
- voice quality if data exists
- body language if data exists
- eye contact if data exists
- proctoring behavior

SCORING:

This is a fresher campus placement interview.

Be fair and slightly encouraging.

Good fresher performance:
65-80

Strong performance:
80-90

Excellent performance:
90-95

Reserve below 50 for genuinely weak performance.

Do not heavily penalize:
- minor grammar mistakes
- normal hesitation
- imperfect spoken English
- small wording mistakes

Give credit for:
- correct concepts
- reasonable reasoning
- partially correct answers
- practical thinking
- clear communication

Do not give high marks without evidence.

PROCTORING:

One accidental focus loss is minor.

A small number of tab switches should have a moderate effect.

Repeated tab switching should have a stronger effect.

Repeated fullscreen exits should reduce professionalism.

Repeated no-face events should reduce the proctoring score.

Multiple-face events are more serious.

Camera or microphone technical problems should not automatically be considered cheating.

Do not invent data.

Return ONLY valid JSON:

{
  "overallScore": number,
  "technicalScore": number,
  "communicationScore": number,
  "confidenceScore": number,
  "bodyLanguageScore": number,
  "grammarScore": number,
  "voiceScore": number,
  "eyeContactScore": number,
  "professionalismScore": number,
  "timeManagementScore": number,
  "strengths": [
    "string",
    "string",
    "string"
  ],
  "weaknesses": [
    "string",
    "string",
    "string"
  ],
  "recommendedImprovements": [
    "string",
    "string",
    "string"
  ],
  "aiSuggestions": "2-5 sentences based only on the interview.",
  "hiringProbability": number,
  "expectedRating": "Strong Hire | Hire | Lean Hire | No Hire"
}
`.trim();

        const completion =
            await callWithRetry(
                () =>
                    groq.chat.completions.create(
                        {
                            model:
                                GROQ_MODEL,
                            messages: [
                                {
                                    role: "system",
                                    content:
                                        "You are an expert college campus placement interviewer and evaluator. Analyze only the interview transcript and proctoring data. Return only valid JSON.",
                                },
                                {
                                    role: "user",
                                    content:
                                        prompt,
                                },
                            ],
                            temperature: 0.25,
                            max_tokens: 1400,
                        }
                    )
            );

        let text =
            completion
                .choices?.[0]
                ?.message
                ?.content
                ?.trim() ||
            "";

        text = text
            .replace(
                /```json/gi,
                ""
            )
            .replace(
                /```/g,
                ""
            )
            .trim();

        try {
            return JSON.parse(
                text
            );
        } catch (error) {
            console.error(
                "Report JSON parse error:",
                text
            );

            throw new Error(
                "AI returned an invalid interview report"
            );
        }
    };

module.exports = {
    generateFirstQuestion,
    generateNextQuestion,
    generateInterviewReport,
};