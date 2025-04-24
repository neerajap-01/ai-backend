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