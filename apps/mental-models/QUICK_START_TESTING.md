# Quick Start: Testing Chat Integration

## 🚀 3-Minute Test

### Step 1: Open the App
```
✓ Dev server should be running at http://localhost:5173
```

### Step 2: Check for Chat Widget
```
✓ Look for chat icon in bottom-right corner
✓ Click to open
```

### Step 3: Observe What You Built
```
✓ See the chat interface
✓ Note: Without API key, widget won't appear (by design)
```

---

## 🔑 Add API Key (Optional)

To test full functionality:

1. Get OpenAI API key from https://platform.openai.com/api-keys
2. Edit `.env` file:
   ```bash
   nano .env
   ```
3. Replace the placeholder:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-key-here
   ```
4. Save and refresh browser

---

## 🧪 What to Test

### Basic Checklist:
- [ ] Chat widget appears (if API key set)
- [ ] Chat opens when clicked
- [ ] Interface looks good
- [ ] No console errors

### If API Key is Set:
- [ ] Can send messages
- [ ] AI responds
- [ ] Model suggestions appear
- [ ] Can export conversations
- [ ] Errors handle gracefully

---

## 📋 What We Built (Reminder)

✅ **Intelligent Model Suggestions**: Analyzes conversation and suggests relevant models  
✅ **Enhanced Error Handling**: Contextual error messages with retry  
✅ **Export Functionality**: Download/copy conversations in multiple formats  
✅ **Better Context**: AI sees 20 models instead of 10  
✅ **Real-time Analysis**: Suggestions update as conversation evolves  

---

## 🐛 Common Issues

**Chat doesn't appear?**
→ Need valid API key in `.env`

**Console errors?**
→ Check browser console, share errors

**Suggestions don't show?**
→ Need to have a conversation first

---

## 🎯 Expected Behavior

1. **Without API Key**: Chat widget hidden (clean UX)
2. **With API Key**: Full chat functionality available
3. **During Conversation**: Model suggestions appear after each exchange
4. **On Error**: Helpful error message with guidance
5. **In Settings**: Export buttons appear for current conversation

---

## ✅ Success!

If you see the chat interface (with or without API key):
- 🎉 Chat widget renders correctly
- 🎉 Integration is successful
- 🎉 Ready to test with real API key

**Next**: Test with API key → Build Narrative Modal

