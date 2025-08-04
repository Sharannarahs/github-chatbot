# 🔍 GitHub AI Analyzer – Powered by T3 Stack

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app` and extended with powerful AI features to help developers interact with their GitHub repositories more intelligently.

---

## 🚀 What does this app do?

This application allows users to:

- 🔗 **Connect GitHub repositories** using a personal access token
- 🧠 **Summarize commit history** using **Gemini AI**
- 💬 **Ask natural language questions** about repository files with answers generated via **LangChain RAG (Retrieval-Augmented Generation)**
- 💳 **Purchase credits via Stripe** to:
  - Add multiple repositories
  - Unlock premium AI analysis features

---

## 🛠️ Tech Stack

| Feature              | Tech Used                                                                 |
|----------------------|---------------------------------------------------------------------------|
| Framework            | [Next.js](https://nextjs.org)                                             |
| Auth & AuthZ         | [Clerk](https://clerk.dev)                                                |
| AI + RAG             | [Gemini AI](https://ai.google.dev) + [LangChain](https://www.langchain.com) |
| Database             | [Neon](https://neon.tech) (PostgreSQL)                                    |
| ORM                  | [Prisma](https://prisma.io)                                               |
| API Layer            | [tRPC](https://trpc.io)                                                   |
| Styling              | [Tailwind CSS](https://tailwindcss.com)                                   |
| Payments             | [Stripe](https://stripe.com)                                              |

---

## 🔐 Authentication & Authorization

This app uses **Clerk** for user authentication and authorization, supporting:

- Email/password login
- OAuth Google
- Session and role-based access control (RBAC)

Users must be signed in to:

- Link GitHub repositories
- Generate commit summaries
- Ask questions about their repo files
- Purchase and use credits

---

## 💡 Example AI Prompts You Can Ask

Here are some sample natural language prompts users can ask the AI:

```bash
# 🔍 General Code Understanding
"What does this file do?"
"Explain the purpose of utils/helpers.ts"
"Summarize the functionality of this module."

# 📂 File Location & Structure
"Where is my file uploaded?"
"In which folder is config.json located?"
"List all files related to authentication."

# 🧠 AI-Powered Code Review
"Are there any security issues in my code?"
"Which parts of my app need refactoring?"
"Suggest improvements for my API routes."

# 🔄 Commit Insights
"Summarize the latest commits in this repo."
"What has changed in the last 5 commits?"
"Show me a summary of changes made by [username]."

# 🤖 Developer Assistance
"Generate documentation for this file."
"Can you explain the logic in login.tsx?"
"Which function handles user signup?"

# 📊 Project Overview
"Give me an overview of this project."
"List all third-party packages used in this project."
"What are the main components of this app?"
```

---

## 💳 Stripe-Based Credit System

- Each action (e.g., commit summarization, question answering) consumes credits
- Users can purchase more credits via **Stripe**
- Flexible plans allow individuals to scale usage based on their project needs

---

## 📦 Deployment

The app is deployed on Vercel





Made with ❤️ using the T3 Stack + AI to make working with GitHub smarter and easier.
