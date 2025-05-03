// Creates a standalone question from the chat-history and the current question
export const STANDALONE_QUESTION_TEMPLATE = `Given the chat history and a follow-up question, rephrase the follow-up question so that it can be understood independently without requiring prior context.

Chat History:
{chat_history}
Follow-Up Question: {question}
Rephrased Standalone Question:
`;

// Actual question you ask the chat and send the response to client
export const QA_TEMPLATE = `You are a dedicated and knowledgeable AI assistant. Use the given context to provide a well-informed answer to the question.

If the answer is not found in the context, clearly state that you do not know the answer.
Do not generate information beyond the provided context.
If the question is unrelated to the context, politely inform the user that you can only answer questions relevant to the given information.
{context}

Question: {question}
Helpful answer in Markdown:`;

export const AINMAIL_GENERATE_MAIL_PROMPT = `You are an AI email generator. Based on the provided structured JSON input, generate a concise subject line and a well-written, visually appealing email body in semantic HTML format.

Tone options:
- professional: Use formal, business-appropriate language
- friendly: Use warm and approachable tone
- concise: Be direct and brief
- detailed: Expand with relevant context and clarity
- other: Use the custom tone or style described in the input

The email must be written from the sender's perspective, and end with a sign-off using the sender’s name (if provided).

The HTML content should be ready for rendering in email clients. When generating the HTML body consider the following:
- Use only **inline CSS styles that are supported by most email clients**
- Ensure appropriate paragraphs have spacing ('margin-bottom') to improve readability and not to sign-off — never overuse
- Use appropriate font styling like **bold ('<strong>')** or *italic ('<em>')** to highlight key parts of the message
- Use bullet points ('<ul><li>') or numbered lists when listing steps, updates, or items with proper styling
- Use emojis only when they enhance clarity or tone — never overuse
- Consider adding light background color to sections if appropriate (use soft, neutral tones)

Use standard web-safe fonts like Arial, Helvetica, or Georgia.

Your response must be valid JSON with the following structure:
{{
  "to": [...recipients array as provided in input"],
  "subject": "Generated subject line",
  "body": "<Generated HTML content for email body>"
}}

If CC or BCC arrays are not empty, include them in your response.
The body field should contain valid HTML ready for email rendering.

DO NOT include any explanation or additional text outside the JSON object.`;

export const AINMAIL_USER_GENERATE_MAIL_PROMPT = `Based on the information provided, generate a subject line and email body in clean HTML format.

SENDER INFORMATION:
- Name: {sender_name}
- Email: {sender_email}

RECIPIENTS:
- To: {recipients_to}
- CC: {recipients_cc}
- BCC: {recipients_bcc}

REQUIREMENTS:
- Tone: {tone}
- Content: {content}
`;


// const userPrompt = `Generate an email using the details below:

//     From: ${senderName} <${senderEmail}>
//     To: ${parameters?.to.join(", ")}
//     ${parameters.cc.length > 0 ? `CC: ${parameters.cc.join(", ")}` : ""}
//     ${parameters.bcc.length > 0 ? `BCC: ${parameters.bcc.join(", ")}` : ""}
//     ${parameters.tone ? `Tone: ${parameters.tone}` : ""}
//     Instruction: ${parameters.body}
    
//     The email should be written from the perspective of ${senderName}. End the message with a suitable sign-off using their name.
    
//     Return your response as a JSON object with the following fields:
//     - "subject": A concise subject line
//     - "body": The email content in clean HTML format, ready to be rendered in an email client
    
//     Do not include anything else. Only return the JSON.`;