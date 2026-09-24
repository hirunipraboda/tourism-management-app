"""
seed_data.py
Realistic dataset generator for Sri Lankan Tourism attractions and synthetic reviews.
Provides 32 iconic Sri Lankan attractions across 7 key categories and ~320 realistic reviews.
"""

import json
import random
from pathlib import Path
from typing import Dict, List, Tuple
import pandas as pd
from datetime import datetime, timedelta

DATA_DIR = Path(__file__).parent / "data"

ATTRACTIONS_RAW = [
    {
        "attractionId": 1,
        "name": "Sigiriya Ancient Rock Fortress",
        "category": "History",
        "activityType": "Sightseeing/Attractions",
        "lat": 7.9570,
        "lng": 80.7603,
        "estimatedCostPerDay": 36.0,
        "description": "5th-century ancient citadel perched on a 200m granite rock column with world-renowned frescoes and lion paw gate.",
        "location": "Matale District, Central Province",
        "imageUrl": "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800"
    },
    {
        "attractionId": 2,
        "name": "Galle Dutch Fort & Lighthouse",
        "category": "Culture",
        "activityType": "Sightseeing/Attractions",
        "lat": 6.0305,
        "lng": 80.2168,
        "estimatedCostPerDay": 25.0,
        "description": "UNESCO World Heritage 17th-century fortified city built by the Portuguese and Dutch, featuring cobblestone streets, boutiques, and ocean views.",
        "location": "Galle, Southern Province",
        "imageUrl": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800"
    },
    {
        "attractionId": 3,
        "name": "Yala National Park Safari",
        "category": "Wildlife",
        "activityType": "Guided Tours",
        "lat": 6.3688,
        "lng": 81.5204,
        "estimatedCostPerDay": 90.0,
        "description": "Sri Lanka's premier wildlife park boasting the highest leopard density in the world, along with elephants, sloth bears, and crocodiles.",
        "location": "Hambantota, Southern Province",
        "imageUrl": "https://images.unsplash.com/photo-1547970810-dc1eac8161a7?w=800"
    },
    {
        "attractionId": 4,
        "name": "Ella Nine Arch Bridge & Little Adam's Peak",
        "category": "Nature",
        "activityType": "Sightseeing/Attractions",
        "lat": 6.8768,
        "lng": 81.0608,
        "estimatedCostPerDay": 30.0,
        "description": "Iconic viaduct bridge built entirely of brick and rock amidst lush green tea estates and mountain hiking trails in Ella.",
        "location": "Ella, Badulla District, Uva Province",
        "imageUrl": "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800"
    },
    {
        "attractionId": 5,
        "name": "Mirissa Blue Whale Watching & Coconut Tree Hill",
        "category": "Beaches",
        "activityType": "Guided Tours",
        "lat": 5.9483,
        "lng": 80.4578,
        "estimatedCostPerDay": 55.0,
        "description": "Golden crescent beach famous for boat excursions to spot Blue Whales and sunset views from Coconut Tree Hill.",
        "location": "Mirissa, Matara District, Southern Province",
        "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
    },
    {
        "attractionId": 6,
        "name": "Temple of the Sacred Tooth Relic (Sri Dalada Maligawa)",
        "category": "Culture",
        "activityType": "Sightseeing/Attractions",
        "lat": 7.2936,
        "lng": 80.6413,
        "estimatedCostPerDay": 20.0,
        "description": "Venerated Buddhist temple complex located in the royal palace complex of the former Kingdom of Kandy, housing the relic of the tooth of Buddha.",
        "location": "Kandy, Central Province",
        "imageUrl": "https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=800"
    },
    {
        "attractionId": 7,
        "name": "Kitulgala White Water Rafting",
        "category": "Adventure",
        "activityType": "Guided Tours",
        "lat": 6.9897,
        "lng": 80.4144,
        "estimatedCostPerDay": 48.0,
        "description": "Thrilling Grade 3 & 4 rapid rafting through the Kelani River rainforest canyon, canyoning, and waterfall abseiling.",
        "location": "Kitulgala, Sabaragamuwa Province",
        "imageUrl": "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800"
    },
    {
        "attractionId": 8,
        "name": "Colombo Street Food & Pettah Market Tour",
        "category": "Food",
        "activityType": "Guided Tours",
        "lat": 6.9360,
        "lng": 79.8540,
        "estimatedCostPerDay": 28.0,
        "description": "Culinary discovery walking tour sampling spicy kottu roti, isso wade on Galle Face Green, hoppers, and tropical fruit markets.",
        "location": "Colombo, Western Province",
        "imageUrl": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
    },
    {
        "attractionId": 9,
        "name": "Horton Plains & World's End Precipice",
        "category": "Nature",
        "activityType": "Sightseeing/Attractions",
        "lat": 6.8028,
        "lng": 80.8091,
        "estimatedCostPerDay": 45.0,
        "description": "Protected montane cloud forest plateau featuring Baker's Falls and the dramatic 880m sheer drop cliff at World's End.",
        "location": "Nuwara Eliya, Central Province",
        "imageUrl": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"
    },
    {
        "attractionId": 10,
        "name": "Sinharaja Virgin Rain Forest Reserve",
        "category": "Nature",
        "activityType": "Guided Tours",
        "lat": 6.4167,
        "lng": 80.4667,
        "estimatedCostPerDay": 40.0,
        "description": "UNESCO World Biosphere reserve harboring over 60% of Sri Lanka's endemic trees, birds, reptiles, and butterflies.",
        "location": "Deniyaya / Kalawana, Southern Province",
        "imageUrl": "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800"
    },
    {
        "attractionId": 11,
        "name": "Udawalawe Elephant Sanctuary Safari",
        "category": "Wildlife",
        "activityType": "Guided Tours",
        "lat": 6.4746,
        "lng": 80.8987,
        "estimatedCostPerDay": 65.0,
        "description": "Guaranteed wild Asian elephant sightings in an open grass savanna surrounding a scenic reservoir lake.",
        "location": "Udawalawe, Sabaragamuwa Province",
        "imageUrl": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800"
    },
    {
        "attractionId": 12,
        "name": "Pigeon Island Marine Sanctuary Coral Snorkeling",
        "category": "Adventure",
        "activityType": "Guided Tours",
        "lat": 8.7203,
        "lng": 81.2033,
        "estimatedCostPerDay": 52.0,
        "description": "National marine park in Nilaveli with live coral reefs, blacktip reef sharks, sea turtles, and turquoise calm waters.",
        "location": "Nilaveli, Trincomalee, Eastern Province",
        "imageUrl": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"
    },
    {
        "attractionId": 13,
        "name": "Adam's Peak (Sri Pada) Sacred Sunrise Pilgrimage",
        "category": "Adventure",
        "activityType": "Sightseeing/Attractions",
        "lat": 6.8096,
        "lng": 80.4994,
        "estimatedCostPerDay": 18.0,
        "description": "5,500-step sacred night climb to the 2,243m summit for the venerated footprint shrine and the legendary triangular sunrise shadow.",
        "location": "Nallathanniya, Central Province",
        "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
    },
    {
        "attractionId": 14,
        "name": "Bentota Golden Beach & Water Sports Haven",
        "category": "Beaches",
        "activityType": "Sightseeing/Attractions",
        "lat": 6.4256,
        "lng": 79.9958,
        "estimatedCostPerDay": 60.0,
        "description": "Tranquil sandy strip nestled between the Indian Ocean and Bentota River lagoon, perfect for jet skiing, windsurfing, and luxury resorts.",
        "location": "Bentota, Galle District, Southern Province",
        "imageUrl": "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800"
    },
    {
        "attractionId": 15,
        "name": "Dambulla Royal Golden Cave Temple",
        "category": "Culture",
        "activityType": "Sightseeing/Attractions",
        "lat": 7.8567,
        "lng": 80.6483,
        "estimatedCostPerDay": 22.0,
        "description": "Largest and best-preserved cave temple complex in Sri Lanka containing 153 Buddha statues and intricate wall murals dating from 1st century BC.",
        "location": "Dambulla, Matale District, Central Province",
        "imageUrl": "https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=800"
    },
    {
        "attractionId": 16,
        "name": "Ancient Kingdom of Polonnaruwa Ruins",
        "category": "History",
        "activityType": "Sightseeing/Attractions",
        "lat": 7.9403,
        "lng": 81.0188,
        "estimatedCostPerDay": 32.0,
        "description": "Medieval capital of Sri Lanka featuring monumental rock-carved Buddha figures at Gal Vihara, royal palaces, and ancient hydraulic tanks.",
        "location": "Polonnaruwa, North Central Province",
        "imageUrl": "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800"
    },
    {
        "attractionId": 17,
        "name": "Anuradhapura Sacred City & Ruwanwelisaya Stupa",
        "category": "History",
        "activityType": "Sightseeing/Attractions",
        "lat": 8.3500,
        "lng": 80.4000,
        "estimatedCostPerDay": 30.0,
        "description": "First ancient capital spanning 1,300 years of royal dynasties, home to the Jaya Sri Maha Bodhi tree and towering white stupas.",
        "location": "Anuradhapura, North Central Province",
        "imageUrl": "https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=800"
    },
    {
        "attractionId": 18,
        "name": "Trincomalee Koneswaram Temple & Swami Rock",
        "category": "Culture",
        "activityType": "Sightseeing/Attractions",
        "lat": 8.5869,
        "lng": 81.2414,
        "estimatedCostPerDay": 24.0,
        "description": "Historic Hindu temple perched atop a dramatic sea cliff overlooking one of the world's deepest natural harbors.",
        "location": "Trincomalee, Eastern Province",
        "imageUrl": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800"
    },
    {
        "attractionId": 19,
        "name": "Nuwara Eliya Tea Estate & Colonial Heritage",
        "category": "Food",
        "activityType": "Guided Tours",
        "lat": 6.9497,
        "lng": 80.7891,
        "estimatedCostPerDay": 35.0,
        "description": "'Little England' hill station surrounded by emerald Ceylon tea plantations, tea factory tasting tours, and cool alpine climate.",
        "location": "Nuwara Eliya, Central Province",
        "imageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800"
    },
    {
        "attractionId": 20,
        "name": "Arugam Bay World Championship Surf Point",
        "category": "Adventure",
        "activityType": "Sightseeing/Attractions",
        "lat": 6.8428,
        "lng": 81.8286,
        "estimatedCostPerDay": 42.0,
        "description": "Global surfing mecca on the southeast coast offering legendary right-hand point breaks, laid-back beach cafes, and lagoon safaris.",
        "location": "Arugam Bay, Ampara District, Eastern Province",
        "imageUrl": "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800"
    },
    {
        "attractionId": 21,
        "name": "Knuckles Mountain Range Wilderness Trek",
        "category": "Nature",
        "activityType": "Guided Tours",
        "lat": 7.4667,
        "lng": 80.7833,
        "estimatedCostPerDay": 50.0,
        "description": "Rugged UNESCO World Heritage mountain peaks resembling clenched fists, featuring hidden waterfalls, endemic fauna, and cloud forests.",
        "location": "Matale / Kandy border, Central Province",
        "imageUrl": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"
    },
    {
        "attractionId": 22,
        "name": "Wilpattu National Park Leopard & Villu Safari",
        "category": "Wildlife",
        "activityType": "Guided Tours",
        "lat": 8.4419,
        "lng": 80.0219,
        "estimatedCostPerDay": 85.0,
        "description": "Sri Lanka's largest and oldest national park characterized by natural sand-rimmed lakes ('villus') and undisturbed leopard territory.",
        "location": "North Western & North Central Province",
        "imageUrl": "https://images.unsplash.com/photo-1547970810-dc1eac8161a7?w=800"
    },
    {
        "attractionId": 23,
        "name": "Unawatuna Coral Reef & Jungle Beach",
        "category": "Beaches",
        "activityType": "Sightseeing/Attractions",
        "lat": 6.0104,
        "lng": 80.2483,
        "estimatedCostPerDay": 38.0,
        "description": "Sheltered crescent bay with calm swimming waters, vibrant seaside seafood dining, and secluded Jungle Beach cove.",
        "location": "Unawatuna, Galle District, Southern Province",
        "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
    },
    {
        "attractionId": 24,
        "name": "Kaffir & Jaffna Heritage Crab Curry Tour",
        "category": "Food",
        "activityType": "Guided Tours",
        "lat": 9.6615,
        "lng": 80.0255,
        "estimatedCostPerDay": 34.0,
        "description": "Northern culinary immersion experiencing fiery Jaffna crab curry, Nallur Kovil atmosphere, Rio Ice Cream, and palmyrah delicacies.",
        "location": "Jaffna, Northern Province",
        "imageUrl": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
    },
    {
        "attractionId": 25,
        "name": "Hiriketiya Horseshoe Bay & Surf Break",
        "category": "Beaches",
        "activityType": "Sightseeing/Attractions",
        "lat": 5.9620,
        "lng": 80.6975,
        "estimatedCostPerDay": 44.0,
        "description": "Boho-chic sheltered jungle cove offering beginner to intermediate surf waves, artisanal coffee shops, and sea turtles.",
        "location": "Dikwella, Southern Province",
        "imageUrl": "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800"
    },
    {
        "attractionId": 26,
        "name": "Jaffna Fort & Nallur Kandaswamy Kovil",
        "category": "Culture",
        "activityType": "Sightseeing/Attractions",
        "lat": 9.6647,
        "lng": 80.0142,
        "estimatedCostPerDay": 22.0,
        "description": "Massive Dutch fortress built with coral stone and the majestic golden Dravidian gopuram of Nallur Kovil.",
        "location": "Jaffna, Northern Province",
        "imageUrl": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800"
    },
    {
        "attractionId": 27,
        "name": "Minneriya National Park Elephant Gathering",
        "category": "Wildlife",
        "activityType": "Guided Tours",
        "lat": 8.0333,
        "lng": 80.8833,
        "estimatedCostPerDay": 75.0,
        "description": "Witness the largest recurring wild Asian elephant gathering in the world (up to 300 elephants) around the Minneriya ancient reservoir.",
        "location": "Habarana, North Central Province",
        "imageUrl": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800"
    },
    {
        "attractionId": 28,
        "name": "Negombo Lagoon & Dutch Canal Kayaking",
        "category": "Adventure",
        "activityType": "Guided Tours",
        "lat": 7.2083,
        "lng": 79.8358,
        "estimatedCostPerDay": 32.0,
        "description": "Mangrove kayaking through historical Dutch canals, observing traditional catamaran fisherman and rich water bird life.",
        "location": "Negombo, Gampaha District, Western Province",
        "imageUrl": "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800"
    },
    {
        "attractionId": 29,
        "name": "Lipton's Seat & Dambatenne Tea Factory Trek",
        "category": "Nature",
        "activityType": "Sightseeing/Attractions",
        "lat": 6.7825,
        "lng": 81.0153,
        "estimatedCostPerDay": 26.0,
        "description": "Panoramic mountain lookout where Sir Thomas Lipton surveyed his tea empire, offering views across seven provinces on clear days.",
        "location": "Haputale, Badulla District, Uva Province",
        "imageUrl": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"
    },
    {
        "attractionId": 30,
        "name": "Koggala Stilt Fishermen & Cinnamon Island Boat Tour",
        "category": "Culture",
        "activityType": "Guided Tours",
        "lat": 5.9912,
        "lng": 80.3275,
        "estimatedCostPerDay": 30.0,
        "description": "Traditional art of cross-bar stilt fishing at sunset followed by an eco-boat ride across Koggala Lake to artisan cinnamon peelers.",
        "location": "Koggala, Southern Province",
        "imageUrl": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800"
    },
    {
        "attractionId": 31,
        "name": "Pidurangala Rock Sunrise Hike",
        "category": "Adventure",
        "activityType": "Sightseeing/Attractions",
        "lat": 7.9658,
        "lng": 80.7636,
        "estimatedCostPerDay": 15.0,
        "description": "Exciting boulder scramble hike offering 360-degree panoramic sunrise vistas with an unobstructed direct view of Sigiriya fortress.",
        "location": "Sigiriya, Central Province",
        "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
    },
    {
        "attractionId": 32,
        "name": "Kandy Spice Garden & Traditional Cooking Class",
        "category": "Food",
        "activityType": "Guided Tours",
        "lat": 7.2750,
        "lng": 80.6000,
        "estimatedCostPerDay": 35.0,
        "description": "Hands-on culinary workshop preparing aromatic coconut milk curries, cardamoms, cinnamon, and clay-pot rice in a lush tropical garden.",
        "location": "Kandy outskirts, Central Province",
        "imageUrl": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
    }
]

SAMPLE_REVIEW_TEMPLATES = {
    5: [
        "Absolutely breathtaking experience! The views at {name} were unforgettable and the staff was so friendly.",
        "A must-visit in Sri Lanka. Incredible history, tranquil atmosphere, and great value for ${cost}/day.",
        "Highlight of our 2-week vacation! Loved every single minute. Perfect for anyone interested in {category}.",
        "Outstanding! Beautiful scenery and great facilities. Clean, safe, and truly magical for travelers.",
        "Exceeded all expectations. World-class destination with authentic cultural depth and friendly local guides."
    ],
    4: [
        "Very impressive destination with fantastic photo opportunities. Can get a bit crowded around midday.",
        "Great experience overall. Well maintained and lovely surroundings. Worth the entrance fee.",
        "Thoroughly enjoyed our visit to {name}. Wear comfortable shoes and bring sunscreen!",
        "Lovely spot for {category} lovers. Good facilities nearby and easy to reach with a driver.",
        "Solid 4 stars. Great adventure and beautiful nature, though ticket prices have increased slightly."
    ],
    3: [
        "Nice place, but definitely overrun with tourists on weekends. Go early in the morning to avoid queues.",
        "Good experience overall, though a bit pricey for foreign tourists compared to other sights.",
        "Average maintenance. The natural beauty is undeniable, but signage and guidance could be improved.",
        "Decent stopover for an hour or two. Nice scenery, but quite hot in the afternoon."
    ],
    2: [
        "A bit disappointed. Too crowded and vendors can be quite pushy near the entrance.",
        "Overpriced compared to what is offered. Long waiting times and limited shade.",
        "Expected much more given the hype. Would recommend looking for quieter alternatives nearby."
    ],
    1: [
        "Terrible experience during monsoon season. Trails were washed out and operations were disorganized.",
        "Way too expensive for basic amenities. Felt like a tourist trap with zero preservation care."
    ]
}


def generate_synthetic_dataset(num_reviews_per_attraction: int = 10) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Generates realistic attraction and review DataFrames."""
    attractions_df = pd.DataFrame(ATTRACTIONS_RAW)
    
    # Calculate seed ratings and reviews
    reviews_list = []
    review_id = 1
    random.seed(42)  # For deterministic reproducibility
    
    # User pool (50 distinct users)
    user_ids = list(range(1, 51))
    
    for attraction in ATTRACTIONS_RAW:
        a_id = attraction["attractionId"]
        a_name = attraction["name"]
        category = attraction["category"]
        cost = int(attraction["estimatedCostPerDay"])
        
        # Decide distribution based on attraction popularity
        # Top tier attractions (Sigiriya, Galle, Yala, Ella, Mirissa) get higher average ratings
        if a_id in [1, 2, 3, 4, 5, 6, 9, 11, 27, 31]:
            rating_weights = [0.03, 0.05, 0.12, 0.35, 0.45]  # Heavy 4 & 5
            count = random.randint(12, 16)
        elif a_id in [7, 8, 10, 12, 13, 14, 15, 19, 21, 25]:
            rating_weights = [0.04, 0.08, 0.18, 0.40, 0.30]
            count = random.randint(9, 13)
        else:
            rating_weights = [0.06, 0.12, 0.25, 0.35, 0.22]
            count = random.randint(7, 10)
            
        selected_users = random.sample(user_ids, min(count, len(user_ids)))
        
        for u_id in selected_users:
            rating = random.choices([1, 2, 3, 4, 5], weights=rating_weights)[0]
            template = random.choice(SAMPLE_REVIEW_TEMPLATES[rating])
            text = template.format(name=a_name, category=category, cost=cost)
            
            # Random date within last 2 years
            days_ago = random.randint(5, 730)
            review_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
            
            reviews_list.append({
                "reviewId": review_id,
                "userId": u_id,
                "attractionId": a_id,
                "rating": rating,
                "text": text,
                "date": review_date
            })
            review_id += 1

    reviews_df = pd.DataFrame(reviews_list)
    return attractions_df, reviews_df


def save_seed_data(data_dir: Path = DATA_DIR):
    """Saves generated dataset to CSV and JSON files in data/ directory."""
    data_dir.mkdir(parents=True, exist_ok=True)
    attractions_df, reviews_df = generate_synthetic_dataset()
    
    # Save CSVs
    attractions_df.to_csv(data_dir / "attractions.csv", index=False)
    reviews_df.to_csv(data_dir / "reviews.csv", index=False)
    
    # Save JSONs
    with open(data_dir / "attractions.json", "w", encoding="utf-8") as f:
        json.dump(attractions_df.to_dict(orient="records"), f, indent=2)
    with open(data_dir / "reviews.json", "w", encoding="utf-8") as f:
        json.dump(reviews_df.to_dict(orient="records"), f, indent=2)
        
    print(f"[OK] Generated & saved {len(attractions_df)} attractions and {len(reviews_df)} reviews to {data_dir}")
    return attractions_df, reviews_df


def load_dataset(data_dir: Path = DATA_DIR) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Loads dataset from local files or creates if missing."""
    attractions_file = data_dir / "attractions.csv"
    reviews_file = data_dir / "reviews.csv"
    
    if attractions_file.exists() and reviews_file.exists():
        attractions_df = pd.read_csv(attractions_file)
        reviews_df = pd.read_csv(reviews_file)
        return attractions_df, reviews_df
    else:
        return save_seed_data(data_dir)


if __name__ == "__main__":
    save_seed_data()
