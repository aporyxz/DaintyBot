const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'transcripts');

// Ensure transcripts directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const transcript = {
  async generateTranscript(ticketChannel, reason = 'No reason provided') {
    try {
      const messages = await ticketChannel.messages.fetch({ limit: 100 });
      const sortedMessages = messages.reverse();

      let content = `╔════════════════════════════════╗\n`;
      content += `║        TICKET TRANSCRIPT        ║\n`;
      content += `╚════════════════════════════════╝\n\n`;
      content += `Ticket Channel: ${ticketChannel.name}\n`;
      content += `Channel ID: ${ticketChannel.id}\n`;
      content += `Created At: ${new Date(ticketChannel.createdTimestamp).toISOString()}\n`;
      content += `Closed At: ${new Date().toISOString()}\n`;
      content += `Close Reason: ${reason}\n\n`;
      content += `────────────────────────────────\n\n`;

      sortedMessages.forEach(msg => {
        const timestamp = new Date(msg.createdTimestamp).toISOString();
        content += `[${timestamp}] ${msg.author.username}#${msg.author.discriminator}:\n`;
        content += `${msg.content || '(no text content)'}\n`;
        if (msg.attachments.size > 0) {
          content += `📎 Attachments: ${msg.attachments.map(a => a.url).join(', ')}\n`;
        }
        content += `\n`;
      });

      const filename = `ticket-${ticketChannel.id}-${Date.now()}.txt`;
      const filepath = path.join(DATA_DIR, filename);

      fs.writeFileSync(filepath, content, 'utf8');

      return {
        success: true,
        filepath,
        filename,
        content
      };
    } catch (error) {
      console.error('Error generating transcript:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  readTranscript(filename) {
    try {
      const filepath = path.join(DATA_DIR, filename);
      return fs.readFileSync(filepath, 'utf8');
    } catch (error) {
      console.error('Error reading transcript:', error);
      return null;
    }
  },

  listTranscripts() {
    try {
      return fs.readdirSync(DATA_DIR);
    } catch (error) {
      console.error('Error listing transcripts:', error);
      return [];
    }
  }
};

module.exports = transcript;
