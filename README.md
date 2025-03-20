# LifeLens

## Overview
LifeLens is a dynamic, web-based autobiography platform built with Vite and React using TypeScript, designed to transform a user's freeform text into a structured, visually engaging life story. Powered by an LLM (like Grok from xAI), the app takes a single body of text as input—such as "Born in 1990 in Chicago. Moved to Paris in 2015 and started a bakery."—and processes it to generate a polished bio summary and an interactive timeline of key events.

## Key Features

### Input Experience
- **Simple Input**: Users paste a narrative text into a textarea within a modal, eliminating the need for structured fields like dates or titles.
- **LLM-Driven Processing**: The LLM parses the input, extracting milestones and crafting a cohesive bio and timeline (e.g., a bio like "A journey from Chicago to Paris, marked by a bakery's rise" and events like "1990 - Born" and "2015 - Moved to Paris").

### User Interface
- **Timeline View**: A scrollable, card-based timeline with hover animations, displaying events with dates, titles, and descriptions.
- **Bio Summary**: A dynamic paragraph above the timeline, reflecting the LLM-generated narrative.
- **Aesthetic Design**: Features a gradient background (blue to purple), typewriter-style fonts, and a nostalgic yet modern feel.
- **Navigation**: Built with react-router-dom, offering "Home" (input page) and "Timeline" (output page) routes.
- **State Handling**: Uses localStorage to temporarily store the LLM's output, with potential for expansion to Context or Redux.

## Technical Details
- **Framework**: Vite with React and TypeScript for fast development and type safety.
- **Dependencies**: axios for API calls, react-router-dom for routing.
- **Structure**: Modular components (Header, Home, Modal, Timeline) with typed props and state.
- **LLM Integration**: Designed to connect to an LLM API (OpenAI by default), with a properly structured prompt to generate a bio and timeline events.

## Workflow
1. On the "Home" page, users click "Start Your Story" to open a modal.
2. They paste their life story into a textarea and click "Generate with AI."
3. The LLM processes the text, producing a bio and timeline, which are stored and displayed on the "Timeline" page after redirection.
4. Users view their story as a summary and interactive timeline cards.

## Setup Instructions

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- An API key from an LLM provider (OpenAI by default)

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/your-username/lifelens.git
   cd lifelens
   ```
2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```
3. Set up environment variables
   - Copy `.env.example` to `.env`
   - Add your LLM API key to the `.env` file:
     ```
     VITE_LLM_API_KEY=your_api_key_here
     ```
   - Optionally, change the LLM API URL if using a different provider
4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## LLM API Configuration
- The application uses Google's Gemini AI by default, with fallback to OpenAI if Gemini is not available
- To use Gemini AI:
  - Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
  - Add it to the `.env` file as `VITE_GEMINI_API_KEY`
  - Optionally, specify a different model with `VITE_GEMINI_MODEL` (defaults to gemini-pro)
- To use OpenAI as a fallback:
  - Get an API key from [OpenAI](https://platform.openai.com/api-keys)
  - Add it to the `.env` file as `VITE_LLM_API_KEY`
  - The default model is gpt-3.5-turbo, which is suitable for this application
- The application will gracefully fall back between providers or use mock data for development

## Future Potential
- Add loading/error states, markdown support, or image uploads (analyzed by the LLM).
- Enhance with theme toggles (e.g., vintage vs. modern) or export options (e.g., PDF).
- Replace localStorage with robust state management for persistence.

---

LifeLens offers a seamless, creative way to document and visualize a life story, leveraging AI to turn raw text into a compelling narrative, all wrapped in an elegant, user-friendly interface.