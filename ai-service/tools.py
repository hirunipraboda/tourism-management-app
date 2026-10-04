import os
import json
import urllib.request
import urllib.error
from langchain_core.tools import tool

BACKEND_BASE_URL = os.getenv("BACKEND_URL", "http://localhost:5158/api/v1")

# Mock Data Dictionaries for Guide and Tour Operations (Fallback when API is offline)
MOCK_GUIDES = [
    {
        "id": "G-101",
        "name": "Sunil Fernando",
        "languages": ["English", "German", "Sinhala"],
        "rating": 4.9,
        "specialty": "Cultural Heritage & History",
        "status": "Available",
    },
    {
        "id": "G-102",
        "name": "Ranjith Gamage",
        "languages": ["English", "French", "Sinhala"],
        "rating": 4.8,
        "specialty": "Wildlife & Safari Expeditions",
        "status": "Available",
    },
    {
        "id": "G-103",
        "name": "Nadeepa Perera",
        "languages": ["English", "Japanese", "Sinhala"],
        "rating": 4.95,
        "specialty": "Hill Country Treks & Tea Estates",
        "status": "Available",
    },
    {
        "id": "G-104",
        "name": "Amaya Silva",
        "languages": ["English", "Spanish", "German"],
        "rating": 4.7,
        "specialty": "Southern Coast & Galle Fort",
        "status": "Available",
    },
    {
        "id": "G-105",
        "name": "Kasun Wickramasinghe",
        "languages": ["English", "Mandarin", "Sinhala"],
        "rating": 4.85,
        "specialty": "Adventure & Water Sports",
        "status": "Available",
    },
]

MOCK_TOURS = {
    "TOUR-SL-001": {
        "name": "Sri Lanka Highlights",
        "duration": "7 Days / 6 Nights",
        "destination": "Colombo -> Kandy -> Ella -> Galle",
        "status": "Available",
        "seats_left": 8,
        "cost_per_person": 480.0,
    },
    "TOUR-HILL-02": {
        "name": "Hill Country Escape",
        "duration": "4 Days / 3 Nights",
        "destination": "Kandy -> Nuwara Eliya -> Ella",
        "status": "Available",
        "seats_left": 4,
        "cost_per_person": 260.0,
    },
    "TOUR-SOUTH-03": {
        "name": "Southern Coast Journey",
        "duration": "5 Days / 4 Nights",
        "destination": "Galle -> Mirissa -> Unawatuna",
        "status": "Available",
        "seats_left": 12,
        "cost_per_person": 310.0,
    },
    "TOUR-CULTURE-04": {
        "name": "Kandy Cultural Trail",
        "duration": "3 Days / 2 Nights",
        "destination": "Kandy & Surrounding Heritage Sites",
        "status": "Fully Booked",
        "seats_left": 0,
        "cost_per_person": 150.0,
    },
    "TOUR-SAFARI-05": {
        "name": "Yala Wildlife Expedition",
        "duration": "2 Days / 1 Night",
        "destination": "Yala National Park",
        "status": "Available",
        "seats_left": 6,
        "cost_per_person": 220.0,
    },
}


def _fetch_backend(endpoint: str):
    """Helper to try fetching JSON from backend endpoints with fallback URL retry."""
    urls_to_try = [
        f"{BACKEND_BASE_URL}{endpoint}",
        f"http://localhost:5157/api/v1{endpoint}",
        f"http://localhost:5000/api/v1{endpoint}"
    ]
    for url in urls_to_try:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "NOVA-AI-Agent/1.0"})
            with urllib.request.urlopen(req, timeout=3) as resp:
                if resp.status == 200:
                    data = resp.read()
                    return json.loads(data.decode('utf-8'))
        except Exception:
            continue
    return None


@tool
def get_available_guides(language: str) -> str:
    """Finds and lists available tour guides based on the specified language requirement.
    
    Args:
        language (str): The preferred spoken language (e.g. 'English', 'German', 'French', 'Japanese', 'Spanish', 'Mandarin').
        
    Returns:
        str: Detailed list of matching available tour guides with their names, ratings, and specialties.
    """
    if not language:
        language = "English"

    lang_clean = language.strip().lower()

    # Try live backend API first
    api_guides = _fetch_backend(f"/guides?language={urllib.parse.quote(language)}&isActive=true")
    if api_guides is not None and isinstance(api_guides, list):
        if not api_guides:
            return f"[Live Data] No available guides currently found speaking '{language}'. Default English-speaking guides are available on request."
        
        result_lines = [f"[Live Backend] Found {len(api_guides)} available guide(s) speaking '{language}':"]
        for g in api_guides:
            langs = ", ".join(g.get("languages") or ["English"])
            specs = ", ".join(g.get("specialties") or ["General Operations"])
            rating = g.get("rating", 4.9)
            result_lines.append(
                f"• {g.get('name')} (Rating: ⭐{rating}) - Specialties: {specs} | Spoken: {langs} | Status: {g.get('status', 'Available')}"
            )
        return "\n".join(result_lines)

    # Fallback to mock data if backend API is unavailable
    matching_guides = [
        g for g in MOCK_GUIDES 
        if any(l.lower() == lang_clean for l in g["languages"]) and g["status"] == "Available"
    ]

    if not matching_guides:
        return f"No available guides currently found speaking '{language}'. Default English-speaking guides are available on request."

    result_lines = [f"Found {len(matching_guides)} available guide(s) speaking '{language}':"]
    for guide in matching_guides:
        langs = ", ".join(guide["languages"])
        result_lines.append(
            f"• [{guide['id']}] {guide['name']} (Rating: ⭐{guide['rating']}) - Specialty: {guide['specialty']} | Spoken: {langs}"
        )
    return "\n".join(result_lines)


@tool
def check_tour_availability(tour_code: str) -> str:
    """Checks live availability, remaining seats, destination, and cost for a given tour code.
    
    Args:
        tour_code (str): The unique code or name of the tour package (e.g. 'TOUR-SL-001', 'Sri Lanka Highlights', 'Hill Country Escape').
        
    Returns:
        str: Status details including seats left, price per person, and tour itinerary route.
    """
    tour_clean = tour_code.strip().upper()
    
    # Try live backend API first
    api_packages = _fetch_backend("/tour-packages?isActive=true")
    if api_packages is not None and isinstance(api_packages, list):
        matching_pkg = None
        for pkg in api_packages:
            pkg_name = str(pkg.get("packageName", "")).upper()
            pkg_dest = str(pkg.get("destination", "")).upper()
            pkg_id = str(pkg.get("tourPackageId", ""))
            if tour_clean in pkg_name or tour_clean in pkg_dest or tour_clean == pkg_id or tour_clean in f"TOUR-{pkg_id}":
                matching_pkg = pkg
                break

        if matching_pkg:
            is_active = matching_pkg.get("isActive", True)
            if not is_active:
                return f"⚠️ Tour '{matching_pkg.get('packageName')}' is currently INACTIVE or FULLY BOOKED."

            return (
                f"✅ [Live Backend] Tour Package '{matching_pkg.get('packageName')}' is AVAILABLE!\n"
                f"• Destination: {matching_pkg.get('destination')}\n"
                f"• Duration: {matching_pkg.get('durationDays')} Days\n"
                f"• Max Group Size: {matching_pkg.get('maxGroupSize')} travelers\n"
                f"• Rate: ${matching_pkg.get('price')} per person\n"
                f"• Guide: {matching_pkg.get('guideName', 'Assigned Certified Guide')}\n"
                f"• Details: {matching_pkg.get('description', '')}"
            )

    # Fallback to mock data
    tour_data = MOCK_TOURS.get(tour_clean)
    if not tour_data:
        for code, data in MOCK_TOURS.items():
            if tour_clean in code or tour_clean in data["name"].upper():
                tour_clean = code
                tour_data = data
                break

    if not tour_data:
        available_codes = ", ".join(MOCK_TOURS.keys())
        return f"Tour code/name '{tour_code}' not recognized. Available valid tour codes are: {available_codes}."

    if tour_data["status"] == "Fully Booked" or tour_data["seats_left"] <= 0:
        return f"⚠️ Tour [{tour_clean}] '{tour_data['name']}' is currently FULLY BOOKED (0 seats available). Route: {tour_data['destination']}."

    return (
        f"✅ Tour [{tour_clean}] '{tour_data['name']}' is AVAILABLE!\n"
        f"• Duration: {tour_data['duration']}\n"
        f"• Route: {tour_data['destination']}\n"
        f"• Remaining Seats: {tour_data['seats_left']} travelers\n"
        f"• Rate: ${tour_data['cost_per_person']} per person"
    )


@tool
def calculate_tour_estimate(num_people: int, cost_per_person: float) -> str:
    """Calculates an itemized financial cost estimate for a group booking, including taxes and service fees.
    
    Args:
        num_people (int): Total number of travelers/participants in the group.
        cost_per_person (float): Base price rate per individual person in USD ($).
        
    Returns:
        str: Itemized cost calculation breakdown showing subtotal, 10% taxes/service fee, and total estimate.
    """
    if num_people <= 0:
        return "Error: Number of travelers must be at least 1."
    if cost_per_person <= 0:
        return "Error: Cost per person must be greater than 0."

    subtotal = num_people * cost_per_person
    service_fee_tax = round(subtotal * 0.10, 2)  # 10% tourism service tax & fees
    total_estimate = round(subtotal + service_fee_tax, 2)

    discount_applied = ""
    if num_people >= 5:
        group_discount = round(subtotal * 0.05, 2)
        total_estimate -= group_discount
        discount_applied = f"\n• Group Discount (5% for {num_people} pax): -${group_discount}"

    return (
        f"💵 Financial Tour Cost Estimate for {num_people} Traveler(s):\n"
        f"• Base Rate: ${cost_per_person:.2f} × {num_people} = ${subtotal:.2f}\n"
        f"• Tourism & Service Tax (10%): ${service_fee_tax:.2f}"
        f"{discount_applied}\n"
        f"----------------------------------------\n"
        f"• Final Total Estimated Amount: ${total_estimate:.2f} USD"
    )
