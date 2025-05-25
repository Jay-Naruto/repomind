# RepoMind

**RepoMind** is an AI-powered tool that lets users query and understand GitHub repositories using natural language. It leverages Retrieval-Augmented Generation (RAG), OpenAI models, and vector embeddings to deliver context-aware responses grounded in source code.

## 🌐 Live Demo
[Link](https://repomind.vercel.app/)

## 🚀 Features
- Fetches GitHub commits and stores relevant data in PostgreSQL
- Uses LangChain, OpenAI, and Gemini to generate summaries and answer queries
- Embeds files with vector representations for accurate retrieval
- Implements RAG workflows for deep understanding of repository context
- Real-time, fully typesafe communication between frontend and backend using tRPC
- Built with Vite for a lightning-fast frontend dev experience

## 🛠 Tech Stack
- **Frontend**: Vite, Next.js, TypeScript, Tailwind CSS
- **Backend**: tRPC, Prisma, PostgreSQL
- **AI/ML**: OpenAI API, Gemini API, LangChain, custom RAG pipeline
- **Deployment**: Vercel

## Prerequisites
- Node.js (v14+)
- Python 3.8+
- PostgreSQL
- OpenAI API Key

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Environment variables
- DATABASE_URL="postgresql://<username>:<password>@<host>/<database>?sslmode=require"
- GITHUB_TOKEN=<your_github_token>
- GEMINI_API_KEY=<your_gemini_api_key>
- OPENAI_API_KEY=<your_openai_api_key>

