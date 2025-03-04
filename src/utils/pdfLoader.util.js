import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const chunkedPDFs = async (filePath) => {
  try {
    if (!filePath) {
      throw new Error("No file provided");
    }

    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunkDocs = await textSplitter.splitDocuments(docs);

    return chunkDocs;
  } catch (error) {
    console.error(error);
    throw new Error("PDF docs chunking failed");
  }
};

export {
  chunkedPDFs,
};