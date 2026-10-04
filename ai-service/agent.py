import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from tools import get_available_guides, check_tour_availability, calculate_tour_estimate

load_dotenv()

# System Prompt for NOVA Guide Agent
SYSTEM_PROMPT = """You are "NOVA", a helpful, friendly, and professional AI Tour Operations Assistant for Travel Link in Sri Lanka.

Your primary responsibilities:
1. Always maintain a polite, welcoming, and expert tone as an AI Tour Operations Assistant.
2. ALWAYS check live tour availability using the `check_tour_availability` tool BEFORE quoting prices, confirming availability, or giving booking details to users.
3. Use the `get_available_guides` tool whenever a user inquires about guide availability, guide ratings, or specific spoken language capabilities (e.g., German, French, Japanese, Spanish, Mandarin).
4. Use the `calculate_tour_estimate` tool to compute accurate total prices whenever a user provides group size and cost per person rate.
5. Present responses using clear, well-structured markdown formatting with bullet points and friendly emojis.
6. If a tour is fully booked, suggest available alternative tours or available guides.
"""


def create_nova_agent():
    """Initializes and returns the NOVA Guide LangChain agent."""
    google_api_key = os.getenv("GOOGLE_API_KEY")
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    try:
        llm = ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=google_api_key,
            temperature=0.3,
        )
    except Exception as e:
        print(f"Notice: Initializing model {model_name} failed: {e}. Falling back to gemini-1.5-flash...")
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=google_api_key,
            temperature=0.3,
        )

    tools = [get_available_guides, check_tour_availability, calculate_tour_estimate]

    # Create LangGraph ReAct tool-calling agent
    agent = create_react_agent(
        model=llm,
        tools=tools,
        prompt=SYSTEM_PROMPT,
    )
    
    return agent


def _fallback_tool_executor(user_message: str) -> str:
    """Executes tools or comprehensive intelligent fallback answers for all query types."""
    msg_lower = user_message.lower()

    # 1. Guide availability & spoken languages
    if "guide" in msg_lower or "language" in msg_lower or "german" in msg_lower or "french" in msg_lower or "japanese" in msg_lower or "spanish" in msg_lower or "mandarin" in msg_lower:
        lang = "German" if "german" in msg_lower else (
            "french" if "french" in msg_lower else (
                "japanese" if "japanese" in msg_lower else (
                    "spanish" if "spanish" in msg_lower else (
                        "mandarin" if "mandarin" in msg_lower else "English"
                    )
                )
            )
        )
        res = get_available_guides.invoke({"language": lang})
        return f"🤖 **[NOVA Guide Assistant]**:\n\n{res}"

    # 2. Tour Availability & Packages
    elif "availability" in msg_lower or "tour" in msg_lower or "code" in msg_lower or "check" in msg_lower or "package" in msg_lower:
        clean_search = user_message
        for word in ["check", "tour", "availability", "for", "the", "package", "please", "is", "available", "show"]:
            clean_search = clean_search.replace(word, "").replace(word.title(), "")
        clean_search = clean_search.strip() or "Sri Lanka Highlights"
        res = check_tour_availability.invoke({"tour_code": clean_search})
        return f"🤖 **[NOVA Guide Assistant]**:\n\n{res}"

    # 3. Cost Estimate & Calculations
    elif "estimate" in msg_lower or "cost" in msg_lower or "price" in msg_lower or "calculate" in msg_lower or "$" in msg_lower:
        # Extract number of people if mentioned
        import re
        num_match = re.search(r'(\d+)\s*(people|person|travelers|pax)', msg_lower)
        cost_match = re.search(r'(\d+)\s*(dollars|usd|\$|per person)', msg_lower)
        
        num_people = int(num_match.group(1)) if num_match else 2
        cost_per_person = float(cost_match.group(1)) if cost_match else 260.0

        res = calculate_tour_estimate.invoke({"num_people": num_people, "cost_per_person": cost_per_person})
        return f"🤖 **[NOVA Guide Assistant]**:\n\n{res}"

    # 4. Transport & PickMe Partnership
    elif any(k in msg_lower for k in ["pickme", "ride", "transport", "taxi", "cab", "colombo", "galle", "train", "get around", "airport"]):
        return (
            "🚗 **Transportation & Travel Options in Sri Lanka:**\n\n"
            "• **PickMe Partner Discount:** Enjoy **10% OFF** eligible private rides, tuk-tuks, and airport cabs across Sri Lanka with our partner **PickMe**.\n"
            "• **Scenic Train Journey:** The famous Kandy to Ella blue train takes ~6.5 hours through tea fields. (Reserve 1st Class observation seats in advance!).\n"
            "• **Express Highway:** Travel from Colombo to Galle in under 2 hours via Southern Expressway."
        )

    # 5. Weather & Season
    elif any(k in msg_lower for k in ["weather", "rain", "season", "monsoon", "month", "when to visit", "best time"]):
        return (
            "☀️ **Sri Lanka Climate & Best Travel Seasons:**\n\n"
            "• **South & West Coasts (Galle, Mirissa, Colombo):** Best from December to April (sunny, calm ocean waters).\n"
            "• **Cultural Triangle & Hill Country (Kandy, Ella, Sigiriya):** Great year-round, ideal from January to April.\n"
            "• **East Coast (Trincomalee, Arugam Bay):** Best from May to September."
        )

    # 6. Culture, History & Temple Etiquette
    elif any(k in msg_lower for k in ["history", "culture", "temple", "wear", "dress", "unesco", "sigiriya"]):
        return (
            "🏛️ **Sri Lanka Cultural Heritage & Temple Guidelines:**\n\n"
            "• **Ancient Royal History:** Over 2,500 years of recorded history with 8 UNESCO World Heritage Sites (Sigiriya, Kandy, Anuradhapura, Polonnaruwa, Galle Fort).\n"
            "• **Temple Dress Code:** Modest attire covering shoulders and knees is mandatory. Remove shoes and hats before entering sacred stupas & shrines.\n"
            "• **Sigiriya Rock Fortress:** 5th-century citadel with 1,200 steps, ancient water gardens, and lion gate paws."
        )

    # 7. Day Itinerary Planning
    elif any(k in msg_lower for k in ["plan", "itinerary", "day", "visit", "recommend", "attractions"]):
        return (
            "🗺️ **Recommended 1-Day Cultural Itinerary:**\n\n"
            "• **07:30 AM:** Early morning climb of Sigiriya Lion Rock Fortress before peak heat.\n"
            "• **12:30 PM:** Authentic Sri Lankan Rice & Curry lunch at a local village farm.\n"
            "• **03:30 PM:** Afternoon Jeep Safari at Minneriya National Park to observe wild elephants.\n"
            "• **07:00 PM:** Evening relaxation & Ceylon herbal tea session."
        )

    # 8. Budget Matching
    elif any(k in msg_lower for k in ["budget", "cheap", "custom", "days"]):
        return (
            "🎒 **Trip Planning & Budget Matching:**\n\n"
            "Our most popular **Sri Lanka Highlights** package covers Colombo, Kandy, Ella, and Galle over 7 days starting at **$480/person** including private transport, boutique stays, and certified local guides!"
        )

    # 9. Default Welcome & Capability Overview
    return (
        "🤖 Hello! I am **NOVA Guide**, your AI Travel Companion for Sri Lanka! 🇱🇰\n\n"
        "Here are all the ways I can help you today:\n"
        "1. 👤 **Guide Inquiries:** Ask for available guides speaking German, French, Japanese, etc.\n"
        "2. 🗺️ **Tour Availability:** Check live remaining seats and routes for tour packages.\n"
        "3. 💵 **Financial Estimates:** Calculate group tour costs including taxes & discounts.\n"
        "4. 🚗 **Transportation:** Get 10% PickMe ride discounts & travel routes.\n"
        "5. ☀️ **Weather & Best Season:** Find out the best months to visit.\n"
        "6. 🏛️ **Culture & Temples:** Learn about UNESCO heritage sites and temple dress codes."
    )


def run_agent(user_message: str) -> str:
    """Executes user query through NOVA Agent or fallback solver if API key is missing/unconfigured."""
    google_api_key = os.getenv("GOOGLE_API_KEY")
    
    # Check if Google API Key is unconfigured or placeholder
    if not google_api_key or "YOUR_GOOGLE_API_KEY" in google_api_key:
        return _fallback_tool_executor(user_message)

    try:
        agent = create_nova_agent()
        result = agent.invoke({"messages": [("user", user_message)]})
        
        # Extract output string from agent execution graph
        if isinstance(result, dict) and "messages" in result:
            messages = result["messages"]
            last_message = messages[-1]
            return getattr(last_message, "content", str(last_message))
        return str(result)
    except Exception as e:
        print(f"NOVA Agent execution error: {e}")
        # Try fallback model if default failed
        try:
            llm_fallback = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=google_api_key,
                temperature=0.3,
            )
            fallback_agent = create_react_agent(
                model=llm_fallback,
                tools=[get_available_guides, check_tour_availability, calculate_tour_estimate],
                prompt=SYSTEM_PROMPT,
            )
            result = fallback_agent.invoke({"messages": [("user", user_message)]})
            if isinstance(result, dict) and "messages" in result:
                messages = result["messages"]
                last_message = messages[-1]
                return getattr(last_message, "content", str(last_message))
        except Exception as fb_err:
            print(f"NOVA Fallback model error: {fb_err}")
            
        return _fallback_tool_executor(user_message)

