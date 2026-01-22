# Chat Integration Testing Guide

## 🧪 How to Test the Chat Features We Built

### Prerequisites

1. **Environment Setup**
   ```bash
   # Check if API key exists
   cat .env | grep OPENAI
   
   # If missing or placeholder, add your real key:
   echo "VITE_OPENAI_API_KEY=sk-your-actual-key-here" >> .env
   ```

2. **Start Dev Server**
   ```bash
   pnpm dev
   ```
   
   Server will start at `http://localhost:5173`

---

## ✅ Test Checklist

### 1. **Basic Chat Widget** ✅

**Test**: Chat widget appears and opens
- [ ] Chat widget button visible in bottom-right corner
- [ ] Click button opens chat window
- [ ] Chat window shows properly styled UI
- [ ] Header shows "HUMMBL AI Assistant"
- [ ] Initial prompt suggests example questions

**Expected**: Widget is accessible and opens without errors

**Notes**: If API key is not set, widget won't appear at all (by design)

---

### 2. **Model Suggestions** 💡

**Test**: Model suggestions appear based on conversation

**Steps**:
1. Open chat
2. Type a message about "decision making"
3. Send the message
4. Check if models appear in suggestions section

**Expected**:
- [ ] Purple gradient card with "Suggested Mental Models"
- [ ] Shows 1-5 relevant models
- [ ] Each shows model name, code, and relevance score
- [ ] Clicking a model inserts it into conversation

**Key Points**:
- Suggestions update after each AI response
- Relevance is based on conversation topics
- Models match what you're discussing

**What to Look For**:
- Models like "Bayesian Thinking", "Decision Trees" for decision topics
- Models like "First Principles" for problem-solving topics

---

### 3. **Error Handling** ⚠️

**Test**: Errors display with helpful guidance

**Steps**:
1. Try chatting without valid API key
2. Or trigger a network error
3. Check error display

**Expected**:
- [ ] Error card appears (red background)
- [ ] Shows specific error message
- [ ] Provides guidance (e.g., "Check your API key")
- [ ] Has "Dismiss" button
- [ ] Optionally has "Retry" button

**Error Types to Test**:
- Missing API key
- Invalid API key  
- Network failure
- Rate limiting
- Timeout errors

---

### 4. **Conversation Export** 📥

**Test**: Export conversations to various formats

**Steps**:
1. Have a conversation with a few messages
2. Open chat settings (⚙️ button)
3. Look for "Export Current Conversation" section
4. Try different export formats

**Expected**:
- [ ] Export section appears if conversation has messages
- [ ] Three download buttons: Markdown, Text, JSON
- [ ] Two copy buttons: Copy Markdown, Copy Text
- [ ] Downloads work
- [ ] Clipboard copy works (shows "Copied!" message)

**Formats to Test**:
- **Markdown**: Should have nice formatting with headers
- **Text**: Should be plain readable text
- **JSON**: Should be valid JSON structure

**Verify**:
- File downloads with meaningful name
- Content includes messages with timestamps
- Formatting is correct for each type

---

### 5. **Conversation Context** 🎯

**Test**: AI receives proper context

**Steps**:
1. Open a mental model detail modal (click any model card)
2. Then open chat
3. Check if chat knows what you're viewing

**Expected**:
- [ ] Chat responses reference the model you're viewing
- [ ] AI can answer questions about that specific model
- [ ] Context is passed from App to ChatWidget

**How to Test**:
1. Click a model card (e.g., "First Principles")
2. Open chat
3. Ask "What is this model about?"
4. AI should reference the model you're viewing

---

### 6. **Real-Time Analysis** 🔄

**Test**: Conversation analysis updates dynamically

**Steps**:
1. Start a conversation about "problem solving"
2. Send a few messages
3. Observe model suggestions change as conversation evolves
4. Send message about "strategic thinking"
5. Check if suggestions update to match new topic

**Expected**:
- [ ] Suggestions update after each exchange
- [ ] New models appear for new topics
- [ ] Old models disappear if no longer relevant
- [ ] Loading state shows when analyzing

**What's Happening**:
- System analyzes conversation after each message
- Extracts topics, complexity, intent
- Scores models for relevance
- Shows top 5 matches

---

### 7. **Enhanced System Prompt** 🧠

**Test**: AI has better context about mental models

**Steps**:
1. Ask about specific models by name
2. Ask for comparisons between models
3. Ask for practical applications

**Expected**:
- [ ] AI knows about 20+ mental models (not just 10)
- [ ] Can reference models by code (P1, IN5, etc.)
- [ ] Gives examples from available models
- [ ] Suggests related models

**Test Questions**:
- "What is Bayesian thinking?" (should know about it)
- "Compare first principles and second-order thinking"
- "Which model applies to making business decisions?"
- "Tell me about P5, IN3, and CO12"

---

## 🐛 Troubleshooting

### Issue: Chat widget doesn't appear

**Possible causes**:
- No API key in `.env` file
- API key format is wrong
- Server not started

**Fix**:
```bash
# Check API key
cat .env | grep OPENAI

# Should show: VITE_OPENAI_API_KEY=sk-...

# If placeholder, replace with real key
nano .env  # Edit the file

# Restart dev server
pnpm dev
```

---

### Issue: "OpenAI API key not configured"

**Problem**: API key exists but chat still shows error

**Fix**:
1. Verify key format: `sk-proj-...` or similar
2. Make sure it starts with `VITE_` prefix
3. Restart dev server after changing `.env`
4. Check browser console for more details

---

### Issue: Model suggestions don't appear

**Possible causes**:
- No mental models loaded
- API key not working
- Conversation too short

**Fix**:
1. Make sure mental models page loads (check main page)
2. Have a longer conversation (3+ messages)
3. Check browser console for errors
4. Try asking explicit questions about models

---

### Issue: Export doesn't work

**Problem**: Clicking export does nothing

**Check**:
- Browser download permissions
- Browser console for errors
- Make sure conversation has messages
- Try different format

**Fix**:
- Check browser download settings
- Look for popup blocker
- Try copy to clipboard instead

---

## 📊 Success Criteria

### ✅ All tests pass if:
1. Chat widget appears and opens
2. Model suggestions show relevant models
3. Errors show helpful messages
4. Export downloads files correctly
5. AI responses reference specific models
6. Conversation analysis updates dynamically
7. System prompt includes 20 models

### 🎉 Full integration works if:
- No console errors
- All UI components render
- Interactions are responsive
- Data persists in localStorage
- Export files are valid

---

## 🚀 Quick Test Script

Run this in browser console after opening chat:

```javascript
// Test 1: Check if widget exists
document.querySelector('.chat-widget-button')

// Test 2: Open chat
document.querySelector('.chat-widget-button')?.click()

// Test 3: Send a test message
// (do this manually - type and send)

// Test 4: Check for suggestions
document.querySelector('.model-suggestions-container')

// Test 5: Check localStorage
localStorage.getItem('hummbl:chat:conversations')
```

---

## 📝 Testing Notes Template

### Date: ___________

**Environment**:
- Node: `node --version`
- Browser: ___________________
- API Key: Set / Not Set

**Tests Run**:
- [ ] Basic chat widget
- [ ] Model suggestions
- [ ] Error handling
- [ ] Export functionality
- [ ] Conversation context
- [ ] Real-time analysis
- [ ] Enhanced prompts

**Issues Found**:
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

**Performance**:
- Initial load: _______ ms
- Chat opens in: _______ ms
- Suggestions appear in: _______ ms

**Notes**:
_________________________________________________
_________________________________________________

---

## 🎯 Next Steps After Testing

Once tests pass:

1. **If tests fail**: Fix issues found
2. **If tests pass**: Move to next feature (Narrative Modal)
3. **If partially pass**: Create issues for remaining problems

**Questions to Answer**:
- Are suggestions relevant?
- Is export working smoothly?
- Is error handling helpful?
- Is the UX intuitive?

Then we know what to improve next! 🚀

