import { checkIfNamespaceExists, getPineconeClient } from "../config/pineconeClient.js";
import { chunkedPDFs } from "../utils/pdfLoader.util.js";
import { embedAndStoreDocument } from "../helpers/openai.helper.js"
import fs from "fs";

const createEmbedding = async (filePath, namespace) => {
  try {
    if (!filePath) {
      return {
        flag: false,
        message: "No file provided",
      };
    };

    if(!namespace) {
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
    if(namespaceExists) {
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

export {
  createEmbedding
}