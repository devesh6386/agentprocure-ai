import os
from tavily import TavilyClient
from dotenv import load_dotenv,find_dotenv
load_dotenv(find_dotenv())
tavily=TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
def get_procurement_context(query:str)->str:
    try:
        response=tavily.search(query=f"B2B procurement pricing specifications {query}", search_depth="basic", max_results=3)
        return "\n".join([f"Source: {res['url']}\nSnippet: {res['content']}" for res in response['results']])
    except Exception as e:
        return "Search failed. Rely on internal knowledge."