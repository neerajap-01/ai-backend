import { callChain } from "../utils/langchain.utils.js";

const docsmindChat = async (req, res) => {
  try {
    const { question, chat_history } = req.body;

    const streamingResponse = await callChain({
      question: question,
      chatHistory: chat_history,
    });

    // Set appropriate headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Get reader from the stream
    const reader = streamingResponse.body.getReader();
    
    // Process the stream chunks and send to client
    const processStream = async () => {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          res.end();
          break;
        }
        
        // Send the chunk to the client
        res.write(value);
      }
    };
    
    processStream().catch(err => {
      console.error("Stream processing error:", err);
      res.status(500).end();
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
  docsmindChat,
}