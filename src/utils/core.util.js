// Process and format OpenAI streaming response for the client
export const streamToClient = async () => {
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // If we've finished but still have incomplete JSON, try to send it
        if (accumulatedJSON && !completeObject) {
          try {
            const finalObject = JSON.parse(accumulatedJSON);
            res.write(`data: ${JSON.stringify(finalObject)}\n\n`);
          } catch (e) {
            console.error("Error parsing final JSON:", e);
          }
        }
        res.write('data: [DONE]\n\n');
        res.end();
        break;
      }
      
      // Decode the chunk and process it
      const chunk = decoder.decode(value);
      
      // Process the SSE formatted chunks from OpenAI
      const lines = chunk.split('\n');
      for (const line of lines) {
        // Skip empty lines or comments
        if (!line.trim() || line.trim() === '' || line.startsWith(':')) continue;
        
        try {
          // Extract JSON from the "data: " prefix
          const jsonString = line.replace(/^data: /, '').trim();
          
          if (jsonString === '[DONE]') continue; // Skip the DONE marker
          
          // Parse the JSON and extract the actual content
          const jsonData = JSON.parse(jsonString);
          const content = jsonData.choices?.[0]?.delta?.content || '';
          
          if (content) {
            accumulatedJSON += content;
            
            // Try to parse the accumulated JSON to see if it's complete
            try {
              const parsedObject = JSON.parse(accumulatedJSON);
              completeObject = parsedObject; // We have a complete object now
              
              // Send the complete object to the client
              res.write(`data: ${JSON.stringify(completeObject)}\n\n`);
              
              // Reset for potential next object
              accumulatedJSON = "";
              completeObject = null;
            } catch (parseError) {
              // JSON isn't complete yet, continue accumulating
            }
          }
        } catch (e) {
          console.error("Error processing chunk:", e, "Line:", line);
        }
      }
    }
  } catch (error) {
    console.error("Stream processing error:", error);
    res.write(`data: {"error": "Stream processing error"}\n\n`);
    res.end();
  }
};