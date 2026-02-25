# Voice Arena 🎙️

> Compare 200+ AI voices from multiple providers side by side

Voice Arena is a multi-provider AI voiceover comparison platform that lets you hear the same text spoken by different AI voices. Unlike single-provider TTS tools, Voice Arena focuses on **comparison and discovery**.

## Features

- 🎯 **Multi-Voice Comparison** - Select up to 4 voices and compare them side by side
- 🔍 **Voice Discovery** - Filter by language, gender, style, and provider
- 🌍 **200+ Voices** - Edge TTS (Microsoft) + OpenAI TTS
- 💾 **Download Audio** - Save your favorite generations as MP3
- 🌐 **7 Languages** - Full i18n support (EN, ZH, JA, DE, FR, KO, ES)

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS
- **Backend**: Python 3.12 + FastAPI + edge-tts
- **Deployment**: Docker + Nginx

## Quick Start

```bash
# Clone
git clone https://github.com/densematrix-labs/voice-arena.git
cd voice-arena

# Run with Docker
docker compose up -d

# Access at http://localhost:30160
```

## Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 30161
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Tests
```bash
# Backend
cd backend && pytest --cov=app

# Frontend
cd frontend && npm test
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `LLM_PROXY_URL` | LLM Proxy URL for OpenAI TTS |
| `LLM_PROXY_KEY` | LLM Proxy API key |
| `CREEM_API_KEY` | Creem payment API key |
| `CREEM_WEBHOOK_SECRET` | Creem webhook secret |
| `CREEM_PRODUCT_IDS` | JSON map of product SKUs to Creem IDs |

## License

MIT © DenseMatrix Labs
