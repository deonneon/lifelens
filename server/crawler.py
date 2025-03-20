import crawl4ai
from typing import Dict, List, Any, Optional

async def crawl_website(url: str, max_pages: int = 10, follow_links: bool = True) -> Dict[str, Any]:
    """
    Crawl a website using crawl4ai and extract text content
    
    Args:
        url: The URL to crawl
        max_pages: Maximum number of pages to crawl
        follow_links: Whether to follow links on the page
        
    Returns:
        Dict containing extracted content and metadata
    """
    try:
        crawler = crawl4ai.Crawler(
            urls=[url],
            max_pages=max_pages,
            follow_links=follow_links
        )
        
        result = await crawler.crawl()
        return process_crawl_result(result)
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "extracted_text": ""
        }

def process_crawl_result(result: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Process the result of the crawl to extract text content
    
    Args:
        result: The crawl result from crawl4ai
        
    Returns:
        Dict containing processed text and metadata
    """
    if not result or len(result) == 0:
        return {
            "success": False,
            "error": "No pages were crawled",
            "extracted_text": ""
        }
    
    # Combine all crawled text
    all_text = ""
    crawled_urls = []
    
    for page in result:
        if "text" in page and page["text"]:
            all_text += f"\n\n{page['text']}"
        
        if "url" in page:
            crawled_urls.append(page["url"])
    
    return {
        "success": True,
        "extracted_text": all_text.strip(),
        "crawled_urls": crawled_urls,
        "page_count": len(result)
    } 