# LifeLens - Interactive Biography Generator

## Overview
LifeLens is a web application that serves as a detailed biography generator for people, concepts, or companies. It allows users to progressively build a comprehensive biography by feeding in content from various sources, which is then processed by the Gemini API to extract meaningful timeline events and generate a cohesive biography.

## Core Requirements

### Functionality
- Text input area for pasting content (text or links)
- Process input through Gemini API to extract biographical information
- Display a timeline of events with dates, titles, and descriptions
- Display a comprehensive biography summary
- Support for progressive addition of new information
- Intelligent merging of new data with existing data (avoid duplicates, enhance with more details)
- Save and load functionality for biographies

### Technical Requirements
- Vite + React + TypeScript as the core tech stack
- TailwindCSS for styling with a modern dark mode theme
- Responsive design for mobile and desktop
- Local storage for saving biographies

## Components

### UI Components
1. **Header** - App title and navigation
2. **InputForm** - Text area for user input with submit button
3. **BiographySummary** - Display area for the generated biography text
4. **Timeline** - Visual representation of events in chronological order
5. **TimelineEvent** - Individual event card showing date, title, and description
6. **SaveLoadPanel** - Interface for saving and loading biographies

### Service Components
1. **GeminiService** - Handles communication with the Gemini API
2. **StorageService** - Manages local storage operations

## Data Models

```typescript
// Timeline Event
interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

// LLM Response
interface LLMResponse {
  bio: string;
  timeline: TimelineEvent[];
}

// Saved Biography
interface SavedBiography {
  id: string;
  name: string;
  bio: string;
  timeline: TimelineEvent[];
  lastUpdated: Date;
}
```

## Implementation Plan

### Phase 1: Setup
1. Configure Vite, React, TypeScript
2. Set up TailwindCSS with dark mode
3. Create basic project structure

### Phase 2: Core Components
1. Implement input form for text
2. Set up Gemini service integration
3. Build biography display area
4. Create timeline visualization

### Phase 3: Enhanced Features
1. Implement save/load functionality
2. Add support for progressive information addition
3. Develop intelligent content merging
4. Add URL parsing (if time permits)

### Phase 4: Refinement
1. Polish UI/UX
2. Add loading indicators
3. Implement error handling
4. Optimize performance

## UI/UX Design Notes
- Modern dark mode theme with subtle purple accents
- Clean, minimalist interface with ample white space
- Timeline visualization will be the central focus
- Subtle animations for state transitions
- Responsive layout that works well on mobile 