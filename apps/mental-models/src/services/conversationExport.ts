// Conversation Export Service - Export chat conversations to various formats

import type { ChatConversation } from '../../cascade/types/chat';

export interface ExportOptions {
  format: 'markdown' | 'text' | 'json';
  includeTimestamp?: boolean;
  includeMetadata?: boolean;
}

export class ConversationExportService {
  /**
   * Export a conversation to the selected format
   */
  async exportConversation(
    conversation: ChatConversation,
    options: ExportOptions = { format: 'markdown', includeTimestamp: true, includeMetadata: true }
  ): Promise<string> {
    switch (options.format) {
      case 'markdown':
        return this.exportToMarkdown(conversation, options);
      case 'text':
        return this.exportToText(conversation, options);
      case 'json':
        return this.exportToJSON(conversation, options);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  /**
   * Export to Markdown format
   */
  private exportToMarkdown(conversation: ChatConversation, options: ExportOptions): string {
    let md = '# Chat Conversation\n\n';

    if (options.includeMetadata) {
      md += `**Title:** ${conversation.title || 'Untitled'}\n`;
      md += `**Created:** ${new Date(conversation.createdAt).toLocaleString()}\n`;
      md += `**Updated:** ${new Date(conversation.updatedAt).toLocaleString()}\n\n`;
    }

    md += '---\n\n';

    conversation.messages.forEach((message, index) => {
      const role = message.role === 'user' ? '👤 User' : '🤖 Assistant';
      const timestamp = options.includeTimestamp
        ? ` *(${new Date(message.timestamp).toLocaleTimeString()})*`
        : '';

      md += `## ${role}${timestamp}\n\n`;
      md += `${message.content}\n\n`;

      if (index < conversation.messages.length - 1) {
        md += '---\n\n';
      }
    });

    return md;
  }

  /**
   * Export to Plain Text format
   */
  private exportToText(conversation: ChatConversation, options: ExportOptions): string {
    let text = conversation.title || 'Chat Conversation';
    text += '\n' + '='.repeat(text.length) + '\n\n';

    if (options.includeMetadata) {
      text += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n`;
      text += `Updated: ${new Date(conversation.updatedAt).toLocaleString()}\n\n`;
      text += '-'.repeat(50) + '\n\n';
    }

    conversation.messages.forEach((message, index) => {
      const role = message.role === 'user' ? 'USER' : 'ASSISTANT';
      const timestamp = options.includeTimestamp
        ? ` [${new Date(message.timestamp).toLocaleTimeString()}]`
        : '';

      text += `${role}${timestamp}:\n`;
      text += `${message.content}\n\n`;
    });

    return text;
  }

  /**
   * Export to JSON format
   */
  private exportToJSON(conversation: ChatConversation, options: ExportOptions): string {
    const data = options.includeMetadata ? conversation : { messages: conversation.messages };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Download exported conversation
   */
  async downloadConversation(
    conversation: ChatConversation,
    options: ExportOptions
  ): Promise<void> {
    const content = await this.exportConversation(conversation, options);
    const blob = new Blob([content], { type: this.getMimeType(options.format) });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = this.getFilename(conversation, options.format);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }

  /**
   * Get MIME type for format
   */
  private getMimeType(format: string): string {
    const types: Record<string, string> = {
      markdown: 'text/markdown',
      text: 'text/plain',
      json: 'application/json',
    };
    return types[format] || 'text/plain';
  }

  /**
   * Generate filename for export
   */
  private getFilename(conversation: ChatConversation, format: string): string {
    const title = conversation.title || 'conversation';
    const sanitized = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const ext = format === 'markdown' ? 'md' : format === 'json' ? 'json' : 'txt';
    const timestamp = new Date().toISOString().split('T')[0];

    return `hummbl-chat-${sanitized}-${timestamp}.${ext}`;
  }

  /**
   * Copy to clipboard
   */
  async copyToClipboard(conversation: ChatConversation, format: string): Promise<void> {
    const content = await this.exportConversation(conversation, { format: format as any });
    await navigator.clipboard.writeText(content);
  }
}

// Export singleton instance
export const conversationExport = new ConversationExportService();
