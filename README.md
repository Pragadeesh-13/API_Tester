# API Tester

A high-performance, beautiful API client built for developers. API Tester offers a fast and intuitive workspace for testing REST APIs, simulating workflows, and managing endpoints.

## Features

- **Beautiful UI:** A vibrant, light-themed workspace designed for high contrast and readability, featuring warm cream backgrounds and rich red accents.
- **Environment Variables:** Easily manage dynamic variables using `{{variableName}}` syntax across URLs, headers, and request bodies.
- **Request History:** Automatically save and review your past requests with latency tracking and status color coding.
- **CORS Proxy:** A built-in server-side proxy route to bypass browser CORS restrictions when testing third-party APIs.
- **Code Generation:** Instantly convert your API requests into code snippets (cURL, Fetch, Python, Go) for quick integration.
- **Advanced Auth:** Support for Bearer Tokens, Basic Auth, and custom headers.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 15 (App Router)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Language:** TypeScript

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or whichever port Next.js assigns, e.g., 3333) with your browser to see the result.

## Deployment

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new). Since the application relies on Next.js API Routes (`/api/proxy`) to bypass CORS restrictions during testing, deploying to Vercel will automatically provision the serverless functions required for the proxy to work seamlessly in production.
