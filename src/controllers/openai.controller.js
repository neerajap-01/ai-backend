import { createEmbedding as createEmbeddingService, updateVectorDB } from '../services/openai.service.js';
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { getPineconeClient } from '../config/pineconeClient.js';
import fs from 'fs';

const createSingleFileEmbedding = async (req, res) => {
  try {
    const { namespace } = req.body;

    const filePath = req?.file?.path;
    const result = await createEmbeddingService(filePath, namespace);

    if (!result.flag) {
      return res.status(400).send({
        statusCode: 400,
        error: 1,
        message: result.message,
        data: null
      });
    }

    return res.status(200).send({
      statusCode: 200,
      error: 0,
      message: result.message,
      data: null
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      error: 1,
      message: error.message,
      data: null
    });
  }
};

const createMultipleFileEmbedding = async (req, res) => {
  try {
    const { namespace } = req.body;

    const loader = new DirectoryLoader('./uploads',{
      '.pdf': (path) => new PDFLoader(path, {
          splitPages: false
      })
    });
    const docs = await loader.load();
    //Get Pinecone client instance
    const client = await getPineconeClient();
    console.log("Preparing chunked from PDF files");

    const callBackFn = (filename, totalChunks, chunksUpserted, isComplete) => {
      console.log(`${filename}-${totalChunks}-${chunksUpserted}-${isComplete}`)
      if (!isComplete) {
          res.write(
              JSON.stringify({
                  filename,
                  totalChunks,
                  chunksUpserted,
                  isComplete
              })
          )
      }else{
          res.end();
      }
    };
    await updateVectorDB(client, namespace, docs, callBackFn);

  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      error: 1,
      message: error.message,
      data: null
    });
  } finally {
    //Delete the files
    const files = req?.files;
    if (files && Array.isArray(files)) {
      files.forEach(file => {
        const filePath = file.path;
        if (filePath && fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`Temporary file deleted: ${filePath}`);
          } catch (deleteError) {
            console.error(`Failed to delete temporary file: ${deleteError.message}`);
          }
        }
      });
    }
  }
};

export {
  createSingleFileEmbedding,
  createMultipleFileEmbedding
}