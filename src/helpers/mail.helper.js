/**
 * Helper function to extract body content from Gmail message parts
 * @param {Object} payload - The message payload from Gmail API
 * @returns {Object} - Object containing plainText, htmlContent and attachments
 */
export const extractBodyContent = (payload) => {
  let plainText = '';
  let htmlContent = '';
  const attachments = [];

  const processPart = (part) => {
    const { mimeType } = part;
    
    // Handle attachments
    if (part.filename && part.filename.length > 0) {
      attachments.push({
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.body.size,
        attachmentId: part.body.attachmentId,
      });
      return;
    }
    
    // Handle text content
    if (part.body && part.body.data) {
      const content = Buffer.from(part.body.data, 'base64').toString('utf-8');
      
      if (mimeType === 'text/plain') {
        plainText = content;
      } else if (mimeType === 'text/html') {
        htmlContent = content;
      }
    }
    
    // Recursively process multipart messages
    if (part.parts) {
      part.parts.forEach(processPart);
    }
  };
  
  // Process the main payload
  if (payload.mimeType === 'text/plain' || payload.mimeType === 'text/html') {
    processPart(payload);
  } else if (payload.parts) {
    payload.parts.forEach(processPart);
  }
  
  return { plainText, htmlContent, attachments };
};