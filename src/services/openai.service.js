import { checkIfNamespaceExists, getPineconeClient } from "../config/pineconeClient.js";
import { chunkedPDFs, getFilename } from "../utils/pdfLoader.util.js";
import { embedAndStoreDocument } from "../helpers/openai.helper.js"
import fs from "fs";
import { env } from "../config/keys.js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { AINMAIL_GENERATE_MAIL_PROMPT, AINMAIL_USER_GENERATE_MAIL_PROMPT } from "../contants/prompt-templates.js";
import { streamingModel } from "../utils/llm.utils.js"

const CHUNK_BATCH_SIZE = env.CHUNK_BATCH_SIZE ?? 10;
const PINECONE_INDEX_NAME = env.PINECONE_INDEX_NAME;

const createEmbedding = async (filePath, namespace) => {
  try {
    if (!filePath) {
      return {
        flag: false,
        message: "No file provided",
      };
    };

    if (!namespace) {
      return {
        flag: false,
        message: "No namespace provided",
      };
    }

    //Get Pinecone client instance
    const pineconeClient = await getPineconeClient();
    console.log("Preparing chunked from PDF file");

    //Check if namespace exists
    const namespaceExists = await checkIfNamespaceExists(pineconeClient, namespace);
    if (namespaceExists) {
      return {
        flag: false,
        message: "Namespace already exists",
      };
    }

    // Get pdf doc into chunks
    const docs = await chunkedPDFs(filePath);
    console.log(`Loading ${docs.length} chunks into Pinecone...`);

    //Create embedding and send to Pinecone
    await embedAndStoreDocument(pineconeClient, namespace, docs);
    console.log("Data embedded and stored in pine-cone index");

    return {
      flag: true,
      message: "Embedding created successfully",
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error creating embedding in OpenAI");
  } finally {
    //Delete the file
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Temporary file deleted: ${filePath}`);
      } catch (deleteError) {
        console.error(`Failed to delete temporary file: ${deleteError.message}`);
      }
    }
  }
};

const updateVectorDB = async (client, namespace, docs, progressCallback) => {
  let callback;
  let totalDocumentChunks;
  let totalDocumentChunksUpseted;

  const processDocument = async (client, namespace, doc) => {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const documentChunks = await splitter.splitText(doc.pageContent);
    totalDocumentChunks = documentChunks.length;
    totalDocumentChunksUpseted = 0;
    const filename = getFilename(doc.metadata.source);
    console.log(`Processing ${filename}...`);
    let chunkBatchIndex = 0;
    while (documentChunks.length > 0) {
      chunkBatchIndex++;
      const chunkBatch = documentChunks.splice(0, CHUNK_BATCH_SIZE)
      await processOneBatch(client, namespace, chunkBatch, chunkBatchIndex, filename)
    }
  }

  const processOneBatch = async (client, namespace, chunkBatch, chunkBatchIndex, filename) => {
    try {
      const embeddings = new OpenAIEmbeddings();
      const cleanedChunks = chunkBatch.map(str => str.replace(/\n/g, ' '));

      // Get embeddings for the entire batch
      const embeddingsBatch = await embeddings.embedDocuments(cleanedChunks);

      let vectorBatch = [];
      for (let i = 0; i < chunkBatch.length; i++) {
        const chunk = cleanedChunks[i];
        const embedding = embeddingsBatch[i];

        const vector = {
          id: `${filename}-${chunkBatchIndex}-${i}`,
          values: embedding,
          metadata: {
            text: chunk,
            source: filename
          }
        }
        vectorBatch.push(vector);
      }

      // Upsert vectors to Pinecone
      const index = client.Index(PINECONE_INDEX_NAME).namespace(namespace);
      await index.upsert(vectorBatch);

      totalDocumentChunksUpseted += vectorBatch.length;
      if (callback) {
        callback(filename, totalDocumentChunks, totalDocumentChunksUpseted, false);
      }
      vectorBatch = [];
    } catch (error) {
      console.error('Error processing batch:', error);
      throw new Error('Failed to process document batch');
    }
  };

  try {
    callback = progressCallback;
    totalDocumentChunks = 0;
    totalDocumentChunksUpseted = 0;

    for (const doc of docs) {
      await processDocument(client, namespace, doc)
    }
    if (callback !== undefined) {
      callback("filename", totalDocumentChunks, totalDocumentChunksUpseted, true)
    }
  } catch (error) {
    console.error("Error updating vector DB:", error);
    throw new Error("Error updating vector DB");
  }
}

const generateMailService = async (parameters, user) => {
  try {
    const { to, cc = [], bcc = [], tone, body } = parameters;

    // Validate input parameters
    if (!body) {
      throw new Error("Email body description is required");
    }

    if (!to || !Array.isArray(to) || to.length === 0) {
      throw new Error("At least one recipient (to) is required");
    }

    if (!Array.isArray(cc) || !Array.isArray(bcc)) {
      throw new Error("cc and bcc must be arrays");
    }

    // Get sender information from user data
    const senderName = user?.name || "User";
    const senderEmail = user?.email || "";

        // Create a custom handler using callbacks
        const encoder = new TextEncoder();
        const stream = new TransformStream();
        const writer = stream.writable.getWriter();
        
        let buffer = "";
        
        // Custom handler that will receive each token
        const handler = {
          handleLLMNewToken: async (token) => {
            buffer += token;
            
            // Try to parse what we have as JSON
            try {
              const jsonContent = JSON.parse(buffer);
              await writer.write(encoder.encode(`data: ${JSON.stringify(jsonContent)}\n\n`));
            } catch (e) {
              // Send token update for visual feedback
              await writer.write(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
            }
          },
          handleLLMEnd: async () => {
            if (buffer) {
              try {
                const jsonContent = JSON.parse(buffer);
                await writer.write(encoder.encode(`data: ${JSON.stringify(jsonContent)}\n\n`));
              } catch (e) {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ raw: buffer })}\n\n`));
              }
            }
            await writer.write(encoder.encode('data: [DONE]\n\n'));
            await writer.close();
          },
          handleLLMError: async (error) => {
            await writer.write(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
            await writer.close();
          }
        };

    // Create chat prompt
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(AINMAIL_GENERATE_MAIL_PROMPT),
      HumanMessagePromptTemplate.fromTemplate(AINMAIL_USER_GENERATE_MAIL_PROMPT)
    ]);

    // Prepare prompt inputs
    const promptInputs = {
      sender_name: senderName,
      sender_email: senderEmail,
      recipients_to: to.join(", "),
      recipients_cc: cc.join(", "),
      recipients_bcc: bcc.join(", "),
      tone: tone || "professional",
      content: body,
    };

    // Create chain
    const chain = chatPrompt.pipe(streamingModel.bind({ callbacks: [handler] }));
    chain.invoke(promptInputs);
    
    // Return response with the stream
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error("Error generating mail:", error);
    throw error;
  }
}

export {
  createEmbedding,
  updateVectorDB,
  generateMailService
}