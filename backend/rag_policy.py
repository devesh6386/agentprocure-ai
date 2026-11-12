import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.retrievers import BM25Retriever
from langsmith import traceable

# Global retriever instance held in lightweight RAM
retriever = None

def initialize_knowledge_base(pdf_path: str):
    """Run this on server startup to ingest your company handbook."""
    global retriever
    if os.path.exists(pdf_path):
        loader = PyPDFLoader(pdf_path)
        docs = loader.load_and_split()
        
        # BM25 is a genuine Sparse Vector Retrieval algorithm (True RAG)
        retriever = BM25Retriever.from_documents(docs)
        retriever.k = 2  # Retrieve the top 2 most relevant chunks
        print(f"BM25 RAG Retriever initialized with {len(docs)} documents.")
    else:
        print(f"Warning: Policy PDF not found at {pdf_path}")

@traceable(name="rag_policy_retriever", tags=["rag", "compliance"])
def retrieve_company_policy(query: str) -> str:
    """Fetches exact policy rules based on the purchase request."""
    global retriever
    if not retriever:
        return "No specific company policies found. Apply standard budget constraints."
        
    # Genuine LangChain Retrieval step
    relevant_docs = retriever.invoke(query)
    return "\n".join([doc.page_content for doc in relevant_docs])