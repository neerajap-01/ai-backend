import {
  LangChainAdapter,
} from "ai";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PromptTemplate } from "@langchain/core/prompts";
import { getPineconeClient } from "../config/pineconeClient.js";
import { getOpenAIVectorStore } from "../helpers/openai.helper.js";
import { env } from "../config/keys.js";
import { QA_TEMPLATE, STANDALONE_QUESTION_TEMPLATE } from "../contants/prompt-templates.js";
import { nonStreamingModel, streamingModel } from "./llm.utils.js";

// @ts-expect-error docs type error
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatDocumentsAsString = (documents) => {
  return documents.map((document) => document.pageContent || document?.metadata?.text).join("\n\n");
};

export async function callChain({ question, chatHistory }) {
  try {
    // Open AI recommendation
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");
    const pineconeClient = await getPineconeClient(env.DOCSMIND_PINCONE_INDEX_NAME);
    const vectorStore = await getOpenAIVectorStore(pineconeClient, env.DOCSMIND_PINCONE_INDEX_NAME, env.DOCSMIND_PINECONE_NAMESPACE);
    const retriever = vectorStore.asRetriever();

    // Create a standalone question generator chain
    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(STANDALONE_QUESTION_TEMPLATE);
    const questionGeneratorChain = RunnableSequence.from([
      standaloneQuestionPrompt,
      nonStreamingModel,
      new StringOutputParser(),
    ]);
    
    // Generate a standalone question considering the chat history
    const standaloneQuestion = await questionGeneratorChain.invoke({
      question: sanitizedQuestion,
      chat_history: chatHistory,
    });
    
    // Create the QA prompt
    const qaPrompt = ChatPromptTemplate.fromTemplate(QA_TEMPLATE);
    
    // Create the main chain
    const chain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      qaPrompt,
      streamingModel,
      new StringOutputParser(),
    ]);
    const stream = await chain.stream(standaloneQuestion);
    return LangChainAdapter.toDataStreamResponse(stream, {
      init: {
        status: 200,
        statusText: "OK",
      }
    });
  } catch (e) {
    console.error("Error Langchain: ", e);
    throw new Error("Call chain method failed to execute successfully!!");
  }
}