# ⚡ TrendForge — RAG-Powered Content Automation Engine

TrendForge is a real-time, RAG-driven content automation platform designed for modern content creators, developer advocates, and marketing teams. It continuously monitors live web and technology trends, extracts and vector-indexes source evidence, synthesizes citation-grounded multi-channel content via Google Gemini, adapts to target audiences and tones, enforces API tool execution guardrails via **Swytchcode**, and manages an autonomous simulated publishing queue with analytics.

---

## 🌟 Key Features

1. **🔥 Live Trend Ingestion:**
   - Real-time RSS parsers polling Hacker News, TechCrunch, and curated tech research digests.
   - Categorization across AI & ML, Tech & Dev, Cloud & Infra, and Startups.
   - Viral momentum and relevance scoring.

2. **🧠 In-Memory Vector RAG Engine:**
   - Text chunking with semantic overlap and key statistics extraction.
   - Vector term-frequency indexing with Cosine Similarity ranking.
   - Verifiable source citations and real-time Grounding Confidence Scoring (0–100%).

3. **✍️ Multi-Platform Content Studio:**
   - **Twitter / X Threads:** High-retention hooks, evidence tweets, takeaways, and hashtags.
   - **LinkedIn Posts:** Executive thought leadership with strategic takeaways for technical leaders.
   - **Newsletters / Blogs:** Markdown briefs with formatted blockquotes and source links.
   - Dynamic tone (*Insightful*, *Viral*, *Authoritative*, *Provocative*) and audience adaptation.

4. **🛡️ Swytchcode Execution Authority:**
   - All tool calls (trend ingestion, RAG search, LLM generation, publishing) are routed through the Swytchcode execution layer.
   - Complete audit trail with unique execution IDs (`exec_swy_*`), timing metrics, and policy validation.

5. **📅 Scheduling & Publishing Queue:**
   - Time-slot scheduler with an active state runner (`SCHEDULED` ➔ `PUBLISHING` ➔ `PUBLISHED`).
   - Simulated live post URLs and instant dispatch simulation.

6. **📊 Performance Analytics:**
   - Tracks cross-platform impressions, engagement rates, and fact-grounding correlations.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (Tested on Node.js v22)
- [npm](https://www.npmjs.com/)

### 1. Installation
```bash
git clone https://github.com/<your-username>/trendforge.git
cd trendforge
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Swytchcode Mode (development | production)
SWYTCHCODE_MODE=development
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🏗️ Architecture

```
[ Hacker News / TechCrunch RSS ]
               ↓
[ Swytchcode Tool Dispatch: rss.trends.fetch ]
               ↓
[ In-Memory Vector RAG Chunking & Cosine Indexing ]
               ↓
[ Grounded Synthesis via Google Gemini LLM ]
               ↓
[ Human Review, Platform Editing & Tone Adaptation ]
               ↓
[ Swytchcode Tool Dispatch: platform.publish.post ]
               ↓
[ Active Queue Runner & Analytics Dashboard ]
```

---

## 📜 License
MIT License
