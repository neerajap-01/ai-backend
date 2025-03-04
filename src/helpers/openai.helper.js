import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { env } from "../config/keys.js";

const embedAndStoreDocument = async (
  client,
  namespace,
  docs = [],
) => {
  try {
    const embeddings = new OpenAIEmbeddings();
    const index = client.index(env.PINECONE_INDEX_NAME);

    //Embed and store the document
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: namespace,
      textKey: "openai_text",
    })
  } catch (error) {
    console.error(error);
    throw new Error("Document embedding and storing failed");
  }
};

const getOpenAIVectorStore = async (client, namespace) => {
  try {
    const embeddings = new OpenAIEmbeddings();
    const index = client.index(env.PINECONE_INDEX_NAME);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      textKey: "openai_text",
      namespace: namespace,
    });

    return vectorStore;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get open ai vector store");
  }
}

export {
  embedAndStoreDocument,
  getOpenAIVectorStore,
}