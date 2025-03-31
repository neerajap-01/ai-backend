import { getPineconeClient } from "../config/pineconeClient.js";

const getAllIndexes = async (req, res) => {
  try {
    const pineconeClient = await getPineconeClient();
    const { indexes } = await pineconeClient.listIndexes();
    res.status(200).send({
      statusCode: 200,
      error: 0,
      message: "Fetched all indexes",
      data: indexes,
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

const getAllNamespaces = async (req, res) => {
  try {
    const { index } = req.params;
    const pineconeClient = await getPineconeClient();
    const fetchAllIndexes = await pineconeClient.index(index);
    
    const indexDescription = await fetchAllIndexes.describeIndexStats();

    if (!indexDescription || !indexDescription.namespaces) {
      return res.status(400).send({
        statusCode: 400,
        error: 1,
        message: `No namespaces found for index ${index}`,
        data: null
      });
    }
    return res.status(200).send({
      statusCode: 200,
      error: 0,
      message: `Fetched all namespaces for ${index} index`,
      data: {
        namespaces: Object.keys(indexDescription.namespaces),
        stats: indexDescription.namespaces
      },
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      error: 1,
      message: error.message,
      data: null
    }); 
  }
}

export {
  getAllIndexes,
  getAllNamespaces
}