# LifeLens Web Crawler Backend

This is a Flask-based backend server for the LifeLens application that provides web crawling capabilities using crawl4ai.

## Features

- Web crawling with crawl4ai
- REST API for crawling websites
- Integration with the LifeLens frontend

## Requirements

- Python 3.8+
- Dependencies listed in requirements.txt

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Configure environment variables by creating a `.env` file in the project root or setting them in your environment.

3. Start the server:
   ```
   python app.py
   ```

## API Endpoints

### Crawl Website
- **URL**: `/api/crawl`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "url": "https://example.com",
    "max_pages": 10,
    "follow_links": true
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "extracted_text": "...",
    "crawled_urls": ["..."],
    "page_count": 5
  }
  ```

### Health Check
- **URL**: `/api/health`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "ok",
    "message": "Server is running"
  }
  ```

## Integration with Frontend

The server is designed to work with the LifeLens React frontend. The frontend makes API calls to this server to crawl websites and then uses the extracted text with Gemini AI to generate biographies. 