import requests
from datetime import datetime

appID = "17E0E90C886514E4D79667C18"
url = "https://developer.trimet.org/ws/V1/arrivals"

def get_arrivals(stopID, limit=2):
    parameters = {
        "appID": appID,
        "locIDs": stopID,
        "arrivals": limit,
        "minutes": 30,
        "json": "true"
    }
    response = requests.get(url, params=parameters)
    data = response.json()
    
    arrivals = data.get("resultSet", {}).get("arrival", [])
    
    # take only the first `limit` arrivals
    trimmed = []
    for a in arrivals[:limit]:
        trimmed.append({
            "route": a.get("route"),
            "scheduled": format_time(a.get("scheduled")),
            "estimated": format_time(a.get("estimated")),
            "status": a.get("status")
        })
    return trimmed

def format_time(timestamp):
    """Convert TriMet epoch ms into HH:MM format"""
    if not timestamp:
        return None
    return datetime.fromtimestamp(timestamp / 1000).strftime("%I:%M %p")

if __name__ == "__main__":
    stopID = "6850"  # Example stop ID
    arrivals = get_arrivals(stopID)
    for a in arrivals:
        print(a)
