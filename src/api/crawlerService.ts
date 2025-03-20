import axios from 'axios';

// Configuration for the crawler API
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export interface CrawlRequest {
  url: string;
  max_pages?: number;
  follow_links?: boolean;
}

export interface CrawlResponse {
  success: boolean;
  extracted_text: string;
  crawled_urls?: string[];
  page_count?: number;
  error?: string;
}

/**
 * Crawls a website and extracts text content
 * @param request The crawl request parameters
 * @returns Promise with the crawl response
 */
export const crawlWebsite = async (request: CrawlRequest): Promise<CrawlResponse> => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/crawl`,
      request,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error calling crawler API:', error);
    
    // Return error response
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as CrawlResponse;
    }
    
    return {
      success: false,
      extracted_text: '',
      error: 'Failed to connect to crawler service. Please try again.'
    };
  }
};

/**
 * Checks if the crawler backend is available
 * @returns Promise that resolves to boolean indicating if the backend is available
 */
export const isCrawlerBackendAvailable = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 3000 // 3 second timeout
    });
    return response.status === 200;
  } catch (error) {
    console.warn('Crawler backend is not available:', error);
    return false;
  }
}; 