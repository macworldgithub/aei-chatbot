# AEI Payment Solutions — Chatbot Widget

A fully self-contained AI chatbot powered by OpenAI GPT and Express.js, with an embeddable frontend widget using plain IIFE JavaScript.

---

## 📁 Project Structure

```
aei-chatbot/
├── src/
│   └── server.js          ← Express backend + OpenAI integration
├── public/
│   ├── iife.js            ← Embeddable chatbot widget (IIFE)
│   ├── iife.css           ← Chatbot widget styles (IIFE)
│   └── demo.html          ← Demo page to test the widget
├── .env                   ← Environment variables (add your API key here)
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Add your OpenAI API key
Edit `.env`:
```
OPENAI_API_KEY=sk-your-actual-openai-key-here
PORT=3000
```

### 3. Start the server
```bash
npm start
```
For development with auto-restart:
```bash
npm run dev
```

### 4. Test the demo
Open your browser at:
```
http://localhost:3000/demo.html
```

---

## 🌐 Embed on Any Website

Add these two lines to any HTML page — that's it!

```html
<link  rel="stylesheet" href="https://your-server.com/iife.css" />
<script src="https://your-server.com/iife.js" data-api="https://your-server.com"></script>
```

### Script tag attributes

| Attribute       | Default                      | Description                         |
|-----------------|------------------------------|-------------------------------------|
| `data-api`      | *(same origin)*              | Your backend server URL             |
| `data-title`    | `AEI Support`                | Name shown in the chat header       |
| `data-subtitle` | `Typically replies instantly`| Status text in the chat header      |

---

## 🔧 Configuration

### Change the AI model
In `src/server.js`, find:
```js
model: "gpt-4o-mini",
```
Change to `gpt-4o` for the most capable model (higher cost).

### Restrict API access by origin
In `.env`:
```
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```
Leave blank to allow all origins.

### Adjust response length
In `src/server.js`:
```js
max_tokens: 400,   // increase for longer answers
temperature: 0.65, // 0=deterministic, 1=creative
```

---

## 📡 API Endpoint

### POST `/api/chat`
**Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "What does AEI do?" }
  ]
}
```

**Response:**
```json
{
  "reply": "AEI helps businesses accept payments in-store, online, over the phone, and on the go..."
}
```

### GET `/api/health`
Returns `{ "status": "ok", "service": "AEI Chatbot API" }`

---

## 🎨 Customization

### Colors
All colors are CSS variables in `iife.css`. Find the `:root`-like block under `#aei-chat-root` and change:
```css
--aei-primary:       #1a4fa0;  /* Main brand color */
--aei-accent:        #2e7df7;  /* Gradient accent  */
```

### Quick Reply Buttons
In `iife.js`, edit the `QUICK_REPLIES` array:
```js
const QUICK_REPLIES = [
  "Check my processing rates",
  "How to switch processors?",
  "Business funding options",
  "Request a free quote",
];
```

### Welcome Message
In `iife.js`, edit `WELCOME_MSG`:
```js
const WELCOME_MSG = "👋 Hi there! I'm the AEI virtual assistant...";
```

---

## 🔒 Security Notes

- Never expose your OpenAI API key on the frontend
- Set `ALLOWED_ORIGINS` in production to restrict API access
- The backend trims conversation history to the last 20 messages to prevent token abuse

---

## 📦 Deployment

### Deploy on any Node.js host (Railway, Render, Fly.io, VPS):

1. Upload the project (exclude `node_modules`)
2. Set environment variables via the host's dashboard
3. Run `npm install && npm start`
4. Update `data-api` in your embed script tag to the live URL

---

## 🛠️ Requirements

- Node.js 18+
- An OpenAI API key (GPT-4o-mini or GPT-4o)
