import os
import asyncio
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from crawler import crawl_website

# Load environment variables
load_dotenv(dotenv_path="../.env")

app = Flask(__name__)
CORS(app)

@app.route('/api/crawl', methods=['POST'])
def crawl_api():
    """API endpoint to crawl a website and extract text"""
    data = request.json
    
    if not data or 'url' not in data:
        return jsonify({
            'success': False,
            'error': 'URL is required'
        }), 400
    
    url = data['url']
    max_pages = data.get('max_pages', 10)
    follow_links = data.get('follow_links', True)
    
    try:
        # Run async crawl_website in a synchronous context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(crawl_website(url, max_pages, follow_links))
        loop.close()
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Server is running'
    })

if __name__ == '__main__':
    # Get port from environment variable or use default 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Start the Flask server
    app.run(host='0.0.0.0', port=port, debug=True) 