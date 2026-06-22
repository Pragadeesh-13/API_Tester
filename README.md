# API Tester

A high-performance, premium, and beautiful web-based API client built for developers. API Tester offers a fast and intuitive workspace for testing REST APIs, simulating workflows, and managing endpoints directly from your browser.

🌐 **Live Application:** [api-tester-green-alpha.vercel.app](https://api-tester-green-alpha.vercel.app)

---

## Detailed Functional Overview

### 1. Next.js Server-Side CORS Proxy (`/api/proxy`)
Web browsers enforce the Same-Origin Policy, which restricts web pages from making requests to a different domain than the one that served the page. When building a browser-based API client, this leads to frequent CORS (Cross-Origin Resource Sharing) blockages.

* **How it works:** API Tester resolves this by routing external requests through a serverless Next.js API route (`/api/proxy`). 
* **The Flow:**
  1. The client constructs the request options (URL, Method, Headers, Body).
  2. Instead of making a direct `fetch` to the destination API, the client POSTs the request details to the internal `/api/proxy` endpoint.
  3. The serverless API handler receives the request on the backend, executes the HTTP request to the external server, retrieves the response, headers, and status code, and forwards it back to the client.
  4. This eliminates browser CORS issues, allowing you to test any API (local or public) seamlessly.

### 2. Environment Variables & String Interpolation
Dynamic environments let you switch base URLs, authentication tokens, and headers between local development, staging, and production environments without changing the requests themselves.

* **How it works:** Define key-value pairs in the environment manager panel. In any text input within the application (including the URL bar, Header keys/values, and the JSON raw request body), you can reference these variables using the double-curly braces syntax: `{{variable_name}}`.
* **Interpolation Engine:** Right before a request is built and sent (either directly or via the proxy), the application parses all input fields and replaces any occurrence of `{{variable_name}}` with the current active environment's value.

### 3. Comprehensive Authentication Controls
API Tester includes dedicated authentication panels to handle standard API security schemas automatically.

* **No Auth:** Sends the request without modifying credentials or adding authorization headers.
* **Bearer Token:** Accepts a token value and automatically injects an `Authorization: Bearer <token>` header into the request metadata.
* **Basic Auth:** Accepts a username and password, base64-encodes them, and injects an `Authorization: Basic <base64-string>` header automatically.

### 4. Interactive Request Builder & Response Viewer
The workspace is split into two panels for developer efficiency:
* **Request Builder:**
  * **HTTP Method Selector:** Supports standard REST methods (GET, POST, PUT, DELETE, PATCH).
  * **Headers & Body Tabs:** Add custom HTTP headers using a clean key-value grid. For write operations (POST/PUT/PATCH), customize request bodies with JSON raw inputs.
* **Response Viewer:**
  * Displays HTTP Status Code (color-coded for quick identification: green for `2xx`, yellow for `3xx`, red for `4xx/5xx`).
  * Displays response latency/duration in milliseconds and response payload size.
  * Pretty-prints JSON responses automatically, with support for viewing raw headers returned by the server.

### 5. Automated Code Snippet Generation
To easily transition from testing APIs to implementing them in your codebase, API Tester translates your active request state into native code blocks in real-time.

* **Snippets Supported:** cURL commands, modern JavaScript (`fetch`), Python (`requests`), and Go (`net/http`).
* **Implementation:** The UI listens to changes in the URL, method, headers, auth, and body, and dynamically generates syntactically correct code blocks that can be copied with a single click.

### 6. Local Request History & Latency Tracking
Track your testing history over time directly in the client workspace.

* **State Management:** All sent requests are saved locally in the browser's storage.
* **Quick Restore:** Clicking a historical request entry instantly restores the method, URL, headers, authentication settings, and request body into the active workspace, letting you re-run tests with one click.

---

## Tech Stack & Architecture

* **Framework:** Next.js 15 (App Router) for hybrid static/dynamic page generation and serverless API endpoints.
* **Styling:** Tailwind CSS v4 featuring premium glassmorphism effects, custom focus styles, and a cohesive light/dark color scheme.
* **Icons:** Lucide React for consistent and crisp vector icons.
* **Development Language:** TypeScript for type safety and clean modular code.
