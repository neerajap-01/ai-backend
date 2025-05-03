import { OAuth2Client } from 'google-auth-library';
import { extractBodyContent } from '../helpers/mail.helper.js';
import { generateMailService } from '../services/openai.service.js';
import { streamToClient } from '../utils/core.util.js';

const messages = async (req, res) => {
  try {
    const { maxResults } = req.body;

    // Use the token already verified by middleware
    const token = req.user.accessToken;
    const client = new OAuth2Client();
    client.setCredentials({ access_token: token });

    // Make request to Gmail API
    const response = await client.request({
      url: `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults || 50}`
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

    return res.json({
      ok: true,
      statusCode: 200,
      data: {
        messages: messages,
        totalMessages: response.data.resultSizeEstimate
      }
    });
  } catch (error) {
    console.error('Gmail API error:', error);
    return res.status(error.response?.status || 500).json({
      ok: false,
      statusCode: error.response?.status || 500,
      error: 'Error fetching emails',
      data: null,
      message: 'Error fetching emails'
    });
  }
};

/**
 * Fetch All details of a Email using Message ID
 * @returns {Promise<Object>} - The email message details
 */
const getEmailDetails = async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!messageId) {
      return res.status(400).json({
        ok: false,
        statusCode: 400,
        error: 'Message ID is required',
        data: null
      });
    }

    // Use the token already verified by middleware
    const token = req.user.accessToken;
    const client = new OAuth2Client();
    client.setCredentials({ access_token: token });

    // Make request to Gmail API
    const response = await client.request({
      url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`
    });

    // Extract key header information
    const headers = response.data.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
    const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
    const to = headers.find(h => h.name === 'To')?.value || 'No Recipient';
    const date = headers.find(h => h.name === 'Date')?.value || 'Unknown Date';
    const cc = headers.find(h => h.name === 'Cc')?.value || '';
    const bcc = headers.find(h => h.name === 'Bcc')?.value || '';

    // Extract email body content
    const { plainText, htmlContent, attachments } = extractBodyContent(response.data.payload);

    // Prepare formatted response
    const formattedEmail = {
      id: response.data.id,
      threadId: response.data.threadId,
      labelIds: response.data.labelIds,
      snippet: response.data.snippet,
      headers: {
        subject,
        from,
        to,
        date,
        cc,
        bcc
      },
      body: {
        plainText,
        htmlContent
      },
      attachments
    };

    return res.json({
      ok: true,
      statusCode: 200,
      data: {
        message: formattedEmail
      }
    });
  } catch (error) {
    console.error('Gmail API error:', error);
    return res.status(error.response?.status || 500).json({
      ok: false,
      statusCode: error.response?.status || 500,
      error: 'Error fetching email details',
      data: null,
      message: 'Error fetching email details'
    });
  }
};

/**
 * 
 * Generate mail using using OpenAI API
 * @returns {Promise<Object>} - The email message details
 */
const generateMail = async (req, res) => {
  try {
    const { to, body } = req.body;

    if (!to || !body) {
      return res.status(400).json({
        ok: false,
        statusCode: 400,
        error: 'To and body are required for generating mail',
        data: null
      });
    }

    const streamingResponse = await generateMailService(req.body, req.user);

    // Set appropriate headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Pipe the streaming response directly to the client
    streamingResponse.body.pipeTo(
      new WritableStream({
        write(chunk) {
          res.write(new TextDecoder().decode(chunk));
        },
        close() {
          res.end();
        },
        abort(err) {
          console.error('Stream error:', err);
          res.end();
        }
      })
    );
  } catch (error) {
    console.error('Gmail API error:', error);
    return res.status(error.response?.status || 500).json({
      ok: false,
      statusCode: error.response?.status || 500,
      error: 'Error generating email',
      data: null,
      message: 'Error generating email'
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
      ok: false,
      statusCode: error.response?.status || 500,
      error: 'Error sending email',
      data: null,
      message: 'Error sending email'
    });
  }
}

export {
  messages,
  sendEmail,
  getEmailDetails,
  generateMail
}