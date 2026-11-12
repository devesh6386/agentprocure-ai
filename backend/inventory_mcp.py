from fastmcp import FastMCP

mcp = FastMCP("AgentProcure-Inventory")

COMPANY_INVENTORY = {
    "dell 4k monitor": {"qty": 1, "location": "IT Storage Room A"},
    "ergonomic chair": {"qty": 0, "location": "N/A"}
}

@mcp.tool()
def check_internal_stock(item_name: str) -> str:
    """Always use this tool first to check if the company already owns the requested item."""
    item_key = item_name.lower()
    for key, data in COMPANY_INVENTORY.items():
        if key in item_key and data["qty"] > 0:
            return f"Found {data['qty']}x '{key}' in {data['location']}. Deduct this from the purchase order."
    
    return f"No stock found for {item_name}. Proceed with external purchase."

if __name__ == "__main__":
    mcp.run()