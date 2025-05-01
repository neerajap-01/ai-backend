
const messages = async (req, res) => {
  try {
    const { maxResults } = req.body;
    const authHeader = req.headers.authorization;
    
    // Use the token already verified by middleware
    const token = req.user.accessToken;
    const client = new OAuth2Client();
    client.setCredentials({ access_token: token });
    
    // Make request to Gmail API
    const response = await client.request({
      url: `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults || 10}`
    });
    
    // Process messages to extract relevant info
    const messages = await Promise.all(
      response.data.messages.map(async (msg) => {
        const messageDetails = await client.request({
          url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`
        });
        
        // Extract subject, sender, date from headers
        const headers = messageDetails.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value;
        const from = headers.find(h => h.name === 'From')?.value;
        const date = headers.find(h => h.name === 'Date')?.value;
        
        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: messageDetails.data.snippet,
          subject,
          from,
          date
        };
      })
    );
    
    return res.json(messages);
  } catch (error) {
    console.error('Gmail API error:', error);
    return res.status(error.response?.status || 500).json({ 
      error: 'Error fetching emails',
      details: error.message 
    });
  }
};

const sendEmail = async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    
    // Use the token already verified by middleware
    const token = req.user.accessToken;
    const client = new OAuth2Client();
    client.setCredentials({ access_token: token });
    
    // Create email content
    const emailContent = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body
    ].join('\r\n');
    
    // Encode as base64
    const encodedEmail = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    // Make request to Gmail API
    await client.request({
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      method: 'POST',
      data: {
        raw: encodedEmail
      }
    });
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Gmail API error:', error);
    return res.status(error.response?.status || 500).json({ 
      error: 'Error sending email',
      details: error.message 
    });
  }
}

export {
  messages,
  sendEmail
}