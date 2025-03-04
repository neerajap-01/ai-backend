import { createEmbedding as createEmbeddingService } from '../services/openai.service.js';

const createEmbedding = async (req, res) => {
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

export {
  createEmbedding
}