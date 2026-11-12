import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langsmith import traceable

# Use a lightweight local embedding model to keep it free
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
VECTOR_DB_DIR = "./chroma_policy_db"

def initialize_knowledge_base(pdf_path: str):
    """Run this once to ingest your company handbook."""
    loader = PyPDFLoader(pdf_path)
    docs = loader.load_and_split()
    Chroma.from_documents(docs, embeddings, persist_directory=VECTOR_DB_DIR)

@traceable(name="rag_policy_retriever", tags=["rag", "compliance"])
def retrieve_company_policy(query: str) -> str:
    """Fetches exact policy rules based on the purchase request."""
    if not os.path.exists(VECTOR_DB_DIR):
        return "No specific company policies found. Apply standard budget constraints."
        
    vectorstore = Chroma(persist_directory=VECTOR_DB_DIR, embedding_function=embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 2})
    
    relevant_docs = retriever.invoke(query)
    return "\n".join([doc.page_content for doc in relevant_docs])