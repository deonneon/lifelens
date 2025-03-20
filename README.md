# LifeLens - Interactive Biography Generator

LifeLens is a modern web application that allows you to build comprehensive biographies by progressively adding information. Using the power of Gemini AI, it extracts key dates, events, and biographical information from your text input and presents it in a beautiful timeline format.

## Features

- **Intelligent Data Extraction**: Automatically extracts dates, events, and biographical details from your text
- **Progressive Enhancement**: Add more information over time to build a complete biography
- **Smart Merging**: Avoids duplicate events while enhancing existing entries with more detailed information
- **Modern UI**: Clean, responsive design with a dark mode interface
- **Local Storage**: Save and load multiple biographies
- **Timeline Visualization**: Chronological display of key life events

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lifelens.git
cd lifelens
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Create a `.env` file in the root directory and add your Gemini API key:
```
VITE_GEMINI_API_KEY=your-api-key-here
VITE_GEMINI_MODEL=gemini-pro
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:5173`

## How to Use

1. Enter text about a person, company, or concept in the input area
2. Click "Extract Information" to process the text
3. View the generated biography and timeline
4. Add more information progressively to build a comprehensive biography
5. Save your work using the "Save Current Biography" option

## Technologies Used

- **Vite**: Next generation frontend tooling
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **Google Gemini AI**: Large language model for intelligent text processing

## License

MIT