# Voice Arena — Multi-Provider AI Voiceover Comparison Platform

## Overview

**Voice Arena** is a one-stop AI voiceover platform that aggregates 200+ voices from multiple TTS providers, letting users compare the same text across different voices side-by-side.

**Key Differentiator**: Unlike single-provider TTS tools (Murf, ElevenLabs), Voice Arena focuses on **comparison and discovery** — hear how the same script sounds across Edge TTS (Microsoft), OpenAI TTS, and more.

## Target Users

- Content creators needing the perfect voice for videos
- Developers evaluating TTS options for their apps
- Marketers comparing voiceover styles for ads
- Anyone curious about AI voice technology

## Core Features (MVP)

### 1. Multi-Voice Comparison
- Input text once → generate audio with multiple selected voices
- Side-by-side audio players for A/B comparison
- Quick-compare mode: pick 2-4 voices, hear them back-to-back

### 2. Voice Discovery & Filtering
- Filter by: Language, Gender, Style (news, conversational, etc.)
- Search by voice name or characteristics
- Preview sample audio before full generation
- Provider badge (Edge/OpenAI) on each voice card

### 3. Audio Generation & Download
- Generate voiceover from selected voices
- Download individual audio files (MP3)
- Batch download as ZIP (paid feature)

### 4. Provider Integration
| Provider | Voices | Cost | Status |
|----------|--------|------|--------|
| Edge TTS | 200+ | Free | ✅ Primary |
| OpenAI TTS | 6 | Via llm-proxy | ✅ Secondary |

## Technical Architecture

### Frontend (React + Vite + TypeScript)
- Voice browser with advanced filters
- Multi-select voice comparison UI
- Audio player with waveform visualization
- Responsive design for mobile

### Backend (Python FastAPI)
- `/api/voices` - List all available voices with metadata
- `/api/generate` - Generate audio for text + voice
- `/api/batch` - Generate multiple voices (paid)
- Edge TTS via `edge-tts` Python library
- OpenAI TTS via llm-proxy

### Database
- SQLite for user tokens and payment tracking
- Voice metadata cached in memory (static)

## Pricing Strategy

### Free Tier
- 3 generations per day per device
- Single voice generation only
- Standard quality (MP3 128kbps)

### Paid Tiers
| Tier | Price | Generations | Features |
|------|-------|-------------|----------|
| Starter | $3 | 50 | Multi-voice comparison, HD quality |
| Pro | $8 | 200 | + Batch download, Priority processing |
| Unlimited | $12/mo | Unlimited | + API access |

## Differentiation from Existing Tools

| Feature | Voice Arena | Murf TTS | Voice Gen |
|---------|-------------|----------|-----------|
| Multi-provider | ✅ Edge + OpenAI | ❌ Single | ❌ Single |
| Side-by-side compare | ✅ Core feature | ❌ | ❌ |
| Voice count | 200+ | 120+ | 6 |
| Free tier | ✅ 3/day | ❌ | ✅ Limited |
| Instant preview | ✅ | Slow | ✅ |

## SEO Keywords

### Primary (Homepage)
- `murf ai alternative`
- `elevenlabs alternative free`
- `best text to speech comparison`

### Secondary
- `compare ai voices`
- `edge tts vs openai tts`
- `free ai voiceover generator`

### Long-tail (Programmatic)
- `best ai voice for [use case]`
- `[language] text to speech comparison`
- `[voice name] alternative`

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS
- **Backend**: Python 3.12 + FastAPI + edge-tts + httpx
- **Deployment**: Docker → langsheng (39.109.116.180)
- **Domain**: voice-arena.demo.densematrix.ai
- **Ports**: Frontend 30160, Backend 30161

## Success Metrics

- Daily active users comparing voices
- Conversion rate: free → paid
- Average voices compared per session
- SEO ranking for "elevenlabs alternative"
