# LifeLens

LifeLens is a web application that uses AI to transform text input or website content into structured biographies.

## Features

- Extract biographical information from raw text input
- Crawl websites to extract content and generate biographies
- Save and load multiple biographies
- Modern and responsive UI

## Setup and Installation

### Prerequisites

- Node.js 16+ for the frontend
- Python 3.8+ for the backend crawler
- npm or yarn

### Frontend Setup

1. Clone the repository
2. Install dependencies:
```
npm install
```
3. Create a `.env` file based on `.env.example` and add your API keys
4. Start the development server:
```
npm run dev
```

### Backend Crawler Setup

1. Install Python dependencies:
```
cd server
pip install -r requirements.txt
```
2. Start the backend server:
```
python app.py
```

### Running both together

For convenience, you can use the start script to run both the frontend and backend:

#### On Linux/Mac:
```
chmod +x start.sh
./start.sh
```

#### On Windows:
```
start.bat
```

## Usage

1. Enter text directly in the input box or paste a URL to crawl
2. Click "Extract Information" or "Crawl & Extract Information" to generate a biography
3. Save biographies with custom names for later reference
4. Load or clear saved biographies as needed

## Technologies

- Frontend: React, TypeScript, Vite, TailwindCSS
- Backend: Flask, crawl4ai
- AI: Google Gemini API, OpenAI API (fallback)

## Configuration

The application can be configured via environment variables:

- `VITE_LLM_API_KEY`: OpenAI API key (optional, used as fallback)
- `VITE_GEMINI_API_KEY`: Google Gemini API key
- `VITE_GEMINI_MODEL`: Gemini model to use (defaults to gemini-pro)
- `VITE_BACKEND_URL`: URL for the crawler backend (defaults to http://localhost:5000)

## Notes

- The crawler backend must be running for website crawling functionality to work
- For optimal results when crawling, ensure the website contains relevant biographical information