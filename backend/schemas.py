from pydantic import BaseModel, Field
from typing import List

class VendorItem(BaseModel):
    vendor: str
    item_name: str
    price: float
    delivery_days: int
    rating: float
    is_estimated: bool = Field(description="True if exact price wasn't in search context and is an LLM estimate")
    url: str = Field(description="Direct URL link to the product from the search context")  # <-- Added for the website link

class ProcurementAnalysis(BaseModel):
    summary: str
    options: List[VendorItem]