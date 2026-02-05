# HUMMBL Chat Widget - Setup Guide

## Overview

The HUMMBL Chat Widget provides AI-powered assistance using OpenAI's GPT-4o-mini model. Users can ask questions about mental models and narratives and receive contextual responses.

## Features

- 💬 **Floating chat button** (bottom-right corner)
- 🤖 **GPT-4o-mini integration** (fast and cost-effective)
- 📚 **Context-aware** (has access to mental models and narratives data)
- 💾 **localStorage persistence** (chat history saved locally)
- 🎨 **HUMMBL design system** (matches existing UI)
- 🌓 **Dark mode support**
- 📱 **Mobile responsive**

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the API key (you won't be able to see it again!)

### 2. Configure Environment Variable

**Local Development:**

```bash
# Create .env file in project root
cp .env.example .env

# Edit .env and add your key
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Vercel Deployment:**

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add: `VITE_OPENAI_API_KEY` with your API key
4. Redeploy the application

### 3. Test the Chat

1. Start the dev server: `npm run dev`
2. Look for the chat button (💬) in the bottom-right corner
3. Click to open the chat window
4. Try a suggested prompt or ask a question

## Architecture

### Components

```
src/components/chat/
├── ChatWidget.tsx       # Main widget with floating button
├── ChatWindow.tsx       # Chat modal interface
├── ChatMessage.tsx      # Individual message display
├── ChatInput.tsx        # Message input field
└── *.css               # Styles matching HUMMBL design
```

### Services

```
src/services/
├── openaiService.ts          # OpenAI API integration
└── chatStorageService.ts     # localStorage persistence
```

### Types

```
src/types/
└── chat.ts                   # TypeScript interfaces
```

## Usage

The chat widget appears automatically when:

- OpenAI API key is configured
- User is on any page (Narratives or Mental Models)

### Context Provided to AI

The AI assistant receives:

- All available mental models (name, description, category, etc.)
- All available narratives (title, summary, category, etc.)
- Current user view (models or narratives)

### Suggested Prompts

- "What mental models are available?"
- "Explain first principles thinking"
- "How do narratives work?"
- "Show me mental models for decision making"
- "What's the difference between inversion and second-order thinking?"

## Storage

### localStorage Keys

- `hummbl_chat_conversations`: Array of all conversations
- `hummbl_current_conversation`: ID of active conversation

### Data Structure

```typescript
{
  id: "conv_1234567890_abc123",
  messages: [
    {
      id: "msg_1234567890_xyz789",
      role: "user",
      content: "What is first principles thinking?",
      timestamp: 1634567890000
    },
    {
      id: "msg_1234567891_abc456",
      role: "assistant",
      content: "First principles thinking is...",
      timestamp: 1634567891000
    }
  ],
  createdAt: 1634567890000,
  updatedAt: 1634567891000
}
```

## Cost Considerations

### GPT-4o-mini Pricing (as of 2024)

- **Input:** ~$0.15 per 1M tokens
- **Output:** ~$0.60 per 1M tokens

### Estimated Usage

- Average question: ~100 tokens input
- Average response: ~300 tokens output
- **Cost per interaction:** ~$0.0002 (2/100th of a cent)
- **100 questions:** ~$0.02

### Cost Control

- Model: GPT-4o-mini (most cost-effective)
- max_tokens: 1000 (limits response length)
- Context: Only first 10 mental models/narratives sent

## Troubleshooting

### Chat button doesn't appear

- Check if `VITE_OPENAI_API_KEY` is set in `.env`
- Restart dev server after adding environment variable
- Check browser console for errors

### "API key not configured" error

- Verify API key is correct
- Ensure `.env` file is in project root
- API key must start with `sk-`

### Chat responses fail

- Check OpenAI API key is valid
- Verify you have API credits
- Check network/CORS issues in console
- Ensure API endpoint is correct

### Chat history not persisting

- Check browser localStorage is enabled
- Clear localStorage: `localStorage.clear()`
- Check browser's storage quota

## Security Notes

⚠️ **IMPORTANT:**

- Never commit `.env` file with real API keys
- Use GitHub Secrets for CI/CD
- API key is exposed in browser (client-side)
- For production, consider backend proxy
- Monitor API usage in OpenAI dashboard

## Future Enhancements

Potential improvements:

- [ ] Backend API proxy (hide API key)
- [ ] Multiple conversation management
- [ ] Export chat transcripts
- [ ] Streaming responses (real-time)
- [ ] Voice input/output
- [ ] Model selection (GPT-4, Claude, etc.)
- [ ] Rate limiting
- [ ] User authentication
- [ ] Chat analytics

## Support

For issues or questions:

1. Check OpenAI status: https://status.openai.com
2. Review OpenAI docs: https://platform.openai.com/docs
3. Check browser console for errors
4. Verify environment configuration

---

**Chat widget is production-ready and follows HUMMBL design standards!** 🚀
