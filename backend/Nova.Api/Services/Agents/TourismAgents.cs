using Nova.Api.DTOs.AgenticAI;
using Nova.Api.Entities;

namespace Nova.Api.Services.Agents;

// 1. Travel Planning Agent
public interface ITravelPlanningAgent
{
    Task<List<ItineraryDayPlan>> PlanDaysAsync(StructuredObjectiveDto objective);
}

// 2. Destination Research & Recommendation Agent
public interface IDestinationResearchAgent
{
    Task<List<ActivityCandidate>> ResearchActivitiesAsync(string destination, List<string> interests, string tripStyle);
}

// 3. Travel Logistics & Availability Agent
public interface ITravelLogisticsAgent
{
    Task<List<ItineraryItem>> SequenceAndScheduleAsync(DateTime date, string location, List<ActivityCandidate> candidates, int maxDailyTravelHours);
    Task<TransportLogisticsAssessment> AssessTransportLogisticsAsync(DateTime date, string origin, string destination, string transportType);
}

// 4. Itinerary Validation & Safety Agent
public interface ISafetyValidationAgent
{
    Task<SafetyAssessmentResult> AssessSafetyAsync(string destination, List<ItineraryDay> days);
}

public class ActivityCandidate
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Category { get; set; } = "culture";
    public decimal CostPerPerson { get; set; } = 0.0m;
    public int DurationMinutes { get; set; } = 120;
    public TimeSpan DefaultStartTime { get; set; }
    public TimeSpan DefaultEndTime { get; set; }
    public int TravelTimeFromPrevious { get; set; } = 15;
}

public class ItineraryDayPlan
{
    public int DayNumber { get; set; }
    public DateTime Date { get; set; }
    public string Location { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
}

public class SafetyAssessmentResult
{
    public double SafetyScore { get; set; } = 96.0;
    public List<string> Advisories { get; set; } = [];
}

public class TransportLogisticsAssessment
{
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string RecommendedMode { get; set; } = "PUBLIC_TRANSPORT"; // BUS, TRAIN, PRIVATE
    public int EstimatedTravelMinutes { get; set; } = 60;
    public decimal EstimatedCost { get; set; } = 0.0m;
    public bool IsFeasible { get; set; } = true;
    public List<string> LogisticsNotes { get; set; } = [];
}

// Implementations
public class TravelPlanningAgent : ITravelPlanningAgent
{
    public Task<List<ItineraryDayPlan>> PlanDaysAsync(StructuredObjectiveDto objective)
    {
        int durationDays = objective.DurationDays > 0 
            ? objective.DurationDays 
            : Math.Max(1, (int)(objective.EndDate.Date - objective.StartDate.Date).TotalDays + 1);
        var days = new List<ItineraryDayPlan>();

        for (int d = 1; d <= durationDays; d++)
        {
            var date = objective.StartDate.AddDays(d - 1);
            days.Add(new ItineraryDayPlan
            {
                DayNumber = d,
                Date = date,
                Location = objective.Destination,
                Title = d == 1 ? $"Arrival & Exploration in {objective.Destination}" :
                        d == durationDays ? $"Final Highlights & Departure from {objective.Destination}" :
                        $"{objective.Destination} Cultural & Nature Excursions"
            });
        }

        return Task.FromResult(days);
    }
}

public class DestinationResearchAgent : IDestinationResearchAgent
{
    private readonly IAiAgentClient? _aiAgentClient;

    public DestinationResearchAgent(IAiAgentClient? aiAgentClient = null)
    {
        _aiAgentClient = aiAgentClient;
    }

    public async Task<List<ActivityCandidate>> ResearchActivitiesAsync(string destination, List<string> interests, string tripStyle)
    {
        if (_aiAgentClient != null)
        {
            try
            {
                var remote = await _aiAgentClient.ResearchDestinationAsync(destination, interests, tripStyle);
                if (remote != null && remote.Count > 0)
                {
                    return remote;
                }
            }
            catch
            {
                // Graceful fallback to built-in candidates
            }
        }

        var candidates = new List<ActivityCandidate>();

        if (destination.Contains("Sigiriya", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Sigiriya Rock Citadel Fortress Climb",
                Description = "Climb the UNESCO rock fortress to King Kasyapa’s 5th-century royal sky palace, ancient frescoes, and mirror wall.",
                Location = "Sigiriya Citadel",
                Category = "culture",
                CostPerPerson = 36.0m,
                DurationMinutes = 180,
                DefaultStartTime = new TimeSpan(6, 30, 0),
                DefaultEndTime = new TimeSpan(9, 30, 0),
                TravelTimeFromPrevious = 20
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Authentic Hiriwadunna Village Safari & Clay-Pot Lunch",
                Description = "Traditional Sri Lankan culinary experience on banana leaves with catamaran lake ride and bullock cart journey.",
                Location = "Hiriwadunna Village, Sigiriya",
                Category = "culture",
                CostPerPerson = 15.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(11, 30, 0),
                DefaultEndTime = new TimeSpan(13, 30, 0),
                TravelTimeFromPrevious = 20
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Pidurangala Rock Panoramic Sunset Viewpoint",
                Description = "Scenic climb through cave monasteries to a 360-degree summit plateau overlooking Sigiriya rock.",
                Location = "Pidurangala, Sigiriya",
                Category = "nature",
                CostPerPerson = 5.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(16, 0, 0),
                DefaultEndTime = new TimeSpan(18, 0, 0),
                TravelTimeFromPrevious = 25
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Dambulla Royal Cave Golden Temple Murals",
                Description = "Explore five sacred rock sanctuaries containing 153 Buddha statues and ancient Buddhist murals.",
                Location = "Dambulla",
                Category = "culture",
                CostPerPerson = 7.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(9, 0, 0),
                DefaultEndTime = new TimeSpan(11, 0, 0),
                TravelTimeFromPrevious = 25
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Minneriya National Park Wild Elephant Gathering Safari",
                Description = "Open-top 4x4 jeep safari witnessing hundreds of wild elephants around the ancient Minneriya reservoir.",
                Location = "Minneriya Reserve",
                Category = "nature",
                CostPerPerson = 45.0m,
                DurationMinutes = 210,
                DefaultStartTime = new TimeSpan(14, 30, 0),
                DefaultEndTime = new TimeSpan(18, 0, 0),
                TravelTimeFromPrevious = 30
            });
        }
        else if (destination.Contains("Kandy", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Temple of the Sacred Tooth Relic (Sri Dalada Maligawa)",
                Description = "Sacred Buddhist pilgrimage site housing the sacred tooth relic with drumming rituals during the puja offering.",
                Location = "Kandy Lake Round",
                Category = "culture",
                CostPerPerson = 10.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(9, 0, 0),
                DefaultEndTime = new TimeSpan(11, 0, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Royal Botanical Gardens Orchid & Palm Walk",
                Description = "Walk through 147 acres of tropical flora, rare orchids, and giant Javan fig trees in Peradeniya.",
                Location = "Peradeniya, Kandy",
                Category = "nature",
                CostPerPerson = 12.0m,
                DurationMinutes = 150,
                DefaultStartTime = new TimeSpan(12, 30, 0),
                DefaultEndTime = new TimeSpan(15, 0, 0),
                TravelTimeFromPrevious = 25
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Traditional Kandyan Cultural Dance & Fire-Walking",
                Description = "Vibrant drumming, acrobatic leaping, and ceremonial fire-walking performance.",
                Location = "Kandy Cultural Center",
                Category = "culture",
                CostPerPerson = 8.0m,
                DurationMinutes = 90,
                DefaultStartTime = new TimeSpan(17, 30, 0),
                DefaultEndTime = new TimeSpan(19, 0, 0),
                TravelTimeFromPrevious = 20
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Udawatta Kele Forest Sanctuary Nature Trek",
                Description = "Historic rainforest sanctuary above the royal palace featuring endemic birds and ancient hermit caves.",
                Location = "Udawatta Kele, Kandy",
                Category = "nature",
                CostPerPerson = 5.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(9, 0, 0),
                DefaultEndTime = new TimeSpan(11, 0, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Bahirawakanda Giant Buddha Hilltop Sunset View",
                Description = "88-foot seated white Buddha statue commanding panoramic vistas over Kandy lake and central mountain ranges.",
                Location = "Bahirawa Kanda, Kandy",
                Category = "culture",
                CostPerPerson = 2.0m,
                DurationMinutes = 75,
                DefaultStartTime = new TimeSpan(16, 30, 0),
                DefaultEndTime = new TimeSpan(17, 45, 0),
                TravelTimeFromPrevious = 20
            });
        }
        else if (destination.Contains("Ella", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Demodara Nine Arches Viaduct Bridge",
                Description = "Colonial-era stone railway viaduct surrounded by emerald tea plantations, perfect for blue train spotting.",
                Location = "Demodara, Ella",
                Category = "nature",
                CostPerPerson = 0.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(8, 30, 0),
                DefaultEndTime = new TimeSpan(10, 30, 0),
                TravelTimeFromPrevious = 25
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Little Adam's Peak Mountain Ridge Trek",
                Description = "Scenic mountain ridge walk offering 360-degree panoramic views across Ella Gap and Ravana valley.",
                Location = "Passara Road, Ella",
                Category = "nature",
                CostPerPerson = 0.0m,
                DurationMinutes = 150,
                DefaultStartTime = new TimeSpan(11, 30, 0),
                DefaultEndTime = new TimeSpan(14, 0, 0),
                TravelTimeFromPrevious = 20
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Ravana Falls & Highway Scenic Viewpoint",
                Description = "Dramatic 25-meter cascading highway waterfall tied to the historic Ramayana legend of King Ravana.",
                Location = "Wellawaya Road, Ella",
                Category = "nature",
                CostPerPerson = 0.0m,
                DurationMinutes = 90,
                DefaultStartTime = new TimeSpan(15, 0, 0),
                DefaultEndTime = new TimeSpan(16, 30, 0),
                TravelTimeFromPrevious = 20
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Halpewatte Tea Factory Tasting & Processing Tour",
                Description = "Guided Ceylon orthodox tea processing tour through factory lofts, with single-estate tea tasting.",
                Location = "Halpewatte, Ella",
                Category = "culture",
                CostPerPerson = 5.0m,
                DurationMinutes = 100,
                DefaultStartTime = new TimeSpan(9, 30, 0),
                DefaultEndTime = new TimeSpan(11, 10, 0),
                TravelTimeFromPrevious = 25
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Ella Rock High-Altitude Summit Hike",
                Description = "Challenging morning mountain trek across eucalyptus forests to breathtaking cliff-edge valley drops.",
                Location = "Ella Mountain Range",
                Category = "nature",
                CostPerPerson = 0.0m,
                DurationMinutes = 240,
                DefaultStartTime = new TimeSpan(6, 30, 0),
                DefaultEndTime = new TimeSpan(10, 30, 0),
                TravelTimeFromPrevious = 20
            });
        }
        else if (destination.Contains("Nuwara Eliya", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Horton Plains National Park & World's End Precipice",
                Description = "High-altitude cloud forest hike to the dramatic 880m sheer drop at World's End and Baker's Falls.",
                Location = "Horton Plains, Nuwara Eliya",
                Category = "nature",
                CostPerPerson = 35.0m,
                DurationMinutes = 240,
                DefaultStartTime = new TimeSpan(6, 0, 0),
                DefaultEndTime = new TimeSpan(10, 0, 0),
                TravelTimeFromPrevious = 40
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Pedro Tea Estate Tour & Lovers Leap Falls",
                Description = "Visit an 1885 colonial tea factory followed by a scenic walk to cascading Lovers Leap waterfall.",
                Location = "Pedro Estate, Nuwara Eliya",
                Category = "culture",
                CostPerPerson = 5.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(11, 30, 0),
                DefaultEndTime = new TimeSpan(13, 30, 0),
                TravelTimeFromPrevious = 20
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Lake Gregory Waterfront Stroll & Paddle Boating",
                Description = "Relax along the scenic mountain lake with paddle boats, lakeside gardens, and cool mountain breezes.",
                Location = "Lake Gregory, Nuwara Eliya",
                Category = "nature",
                CostPerPerson = 3.0m,
                DurationMinutes = 90,
                DefaultStartTime = new TimeSpan(15, 0, 0),
                DefaultEndTime = new TimeSpan(16, 30, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Victoria Park & Colonial Tudor Post Office",
                Description = "Stroll manicured British colonial botanical gardens and visit the iconic 1894 red-brick post office.",
                Location = "Nuwara Eliya Town",
                Category = "culture",
                CostPerPerson = 2.0m,
                DurationMinutes = 75,
                DefaultStartTime = new TimeSpan(17, 0, 0),
                DefaultEndTime = new TimeSpan(18, 15, 0),
                TravelTimeFromPrevious = 10
            });
        }
        else if (destination.Contains("Galle", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Galle Dutch Fort Heritage Ramparts Walk",
                Description = "Explore the UNESCO 17th-century coral ramparts, bastions, and coastal fortifications overlooking the ocean.",
                Location = "Galle Fort Ramparts",
                Category = "culture",
                CostPerPerson = 0.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(9, 0, 0),
                DefaultEndTime = new TimeSpan(11, 0, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "National Maritime Museum & Dutch Church",
                Description = "Colonial cobblestone history walk visiting shipwreck relics and historic 1755 Dutch Reformed Church.",
                Location = "Galle Fort Old Gate",
                Category = "culture",
                CostPerPerson = 5.0m,
                DurationMinutes = 100,
                DefaultStartTime = new TimeSpan(11, 30, 0),
                DefaultEndTime = new TimeSpan(13, 10, 0),
                TravelTimeFromPrevious = 10
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Galle Fort Lighthouse & Flag Rock Sunset",
                Description = "Iconic white coastal lighthouse and dramatic ocean cliff sunset watching along the southern ramparts.",
                Location = "Point Utrecht Bastion, Galle",
                Category = "nature",
                CostPerPerson = 0.0m,
                DurationMinutes = 90,
                DefaultStartTime = new TimeSpan(17, 0, 0),
                DefaultEndTime = new TimeSpan(18, 30, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Jungle Beach & Rumassala Peace Pagoda",
                Description = "Secluded turquoise swimming bay nestled beneath Rumassala headland with tranquil Japanese Peace Pagoda.",
                Location = "Rumassala, Galle / Unawatuna",
                Category = "nature",
                CostPerPerson = 0.0m,
                DurationMinutes = 150,
                DefaultStartTime = new TimeSpan(13, 30, 0),
                DefaultEndTime = new TimeSpan(16, 0, 0),
                TravelTimeFromPrevious = 20
            });
        }
        else if (destination.Contains("Yala", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Yala National Park Leopard & Elephant 4x4 Safari",
                Description = "Thrilling open-top 4x4 game drive tracking leopards, wild elephants, sloth bears, and crocodiles.",
                Location = "Yala National Park Block 1",
                Category = "nature",
                CostPerPerson = 65.0m,
                DurationMinutes = 240,
                DefaultStartTime = new TimeSpan(6, 0, 0),
                DefaultEndTime = new TimeSpan(10, 0, 0),
                TravelTimeFromPrevious = 30
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Sithulpawwa Ancient Jungle Hermitage Monastery",
                Description = "2,200-year-old Buddhist sanctuary perched on rock boulders deep in Yala wilderness reserve.",
                Location = "Sithulpawwa, Yala",
                Category = "culture",
                CostPerPerson = 0.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(11, 30, 0),
                DefaultEndTime = new TimeSpan(13, 30, 0),
                TravelTimeFromPrevious = 35
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Tissa Wewa Ancient Lake Sunset Bird Walk",
                Description = "Peaceful dusk walk along 3rd-century BC reservoir shaded by giant rain trees with roosting flying foxes.",
                Location = "Tissamaharama",
                Category = "nature",
                CostPerPerson = 0.0m,
                DurationMinutes = 90,
                DefaultStartTime = new TimeSpan(16, 30, 0),
                DefaultEndTime = new TimeSpan(18, 0, 0),
                TravelTimeFromPrevious = 20
            });
        }
        else if (destination.Contains("Mirissa", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Mirissa Ocean Blue Whale Watching Safari",
                Description = "Early morning oceanic boat expedition to observe blue whales, sperm whales, and spinning dolphins.",
                Location = "Mirissa Harbour",
                Category = "nature",
                CostPerPerson = 50.0m,
                DurationMinutes = 240,
                DefaultStartTime = new TimeSpan(6, 30, 0),
                DefaultEndTime = new TimeSpan(10, 30, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Secret Beach Mirissa Turquoise Reef Lagoon",
                Description = "Secluded sandy cove sheltered by reef barriers, perfect for relaxing and snorkeling in calm tidal pools.",
                Location = "Secret Beach, Mirissa",
                Category = "nature",
                CostPerPerson = 0.0m,
                DurationMinutes = 150,
                DefaultStartTime = new TimeSpan(12, 0, 0),
                DefaultEndTime = new TimeSpan(14, 30, 0),
                TravelTimeFromPrevious = 20
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Coconut Tree Hill Golden Hour Viewpoint",
                Description = "Iconic palm-covered ocean headland looking out across the Indian Ocean, stunning for sunset photography.",
                Location = "Coconut Tree Hill, Mirissa",
                Category = "nature",
                CostPerPerson = 0.0m,
                DurationMinutes = 90,
                DefaultStartTime = new TimeSpan(16, 30, 0),
                DefaultEndTime = new TimeSpan(18, 0, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Weligama Bay Surf Lesson & Stilt Fishermen",
                Description = "Beginner surfing lesson with professional coach and authentic stilt fishing photography.",
                Location = "Weligama Bay",
                Category = "nature",
                CostPerPerson = 15.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(14, 30, 0),
                DefaultEndTime = new TimeSpan(16, 30, 0),
                TravelTimeFromPrevious = 15
            });
        }
        else if (destination.Contains("Anuradhapura", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Ruwanwelisaya Sacred White Stupa",
                Description = "Colossal 2nd-century BC Buddhist stupa ringed by 344 sculpted elephant friezes.",
                Location = "Sacred City, Anuradhapura",
                Category = "culture",
                CostPerPerson = 5.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(8, 30, 0),
                DefaultEndTime = new TimeSpan(10, 30, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Jaya Sri Maha Bodhi Sacred Enlightenment Tree",
                Description = "The world's oldest historical recorded tree planted in 288 BC, a deeply spiritual Buddhist shrine.",
                Location = "Mahamevnawa Gardens, Anuradhapura",
                Category = "culture",
                CostPerPerson = 0.0m,
                DurationMinutes = 90,
                DefaultStartTime = new TimeSpan(11, 0, 0),
                DefaultEndTime = new TimeSpan(12, 30, 0),
                TravelTimeFromPrevious = 10
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Mihintale Sacred Mountain Peak & Monastic Steps",
                Description = "Climb 1,840 ancient granite steps to the mountain sanctuary where Buddhism was introduced to Sri Lanka.",
                Location = "Mihintale",
                Category = "culture",
                CostPerPerson = 5.0m,
                DurationMinutes = 180,
                DefaultStartTime = new TimeSpan(15, 0, 0),
                DefaultEndTime = new TimeSpan(18, 0, 0),
                TravelTimeFromPrevious = 25
            });
        }
        else if (destination.Contains("Polonnaruwa", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Gal Vihara Colossal Rock Buddha Sculptures",
                Description = "Masterpiece granite carvings featuring four massive Buddha statues including a 14-meter reclining Buddha.",
                Location = "Gal Vihara, Polonnaruwa",
                Category = "culture",
                CostPerPerson = 25.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(9, 0, 0),
                DefaultEndTime = new TimeSpan(11, 0, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Polonnaruwa Vatadage & Sacred Quadrangle Ruins",
                Description = "Ancient circular stone relic shrine with ornate moonstones, guardstones, and royal council chambers.",
                Location = "Sacred Quadrangle, Polonnaruwa",
                Category = "culture",
                CostPerPerson = 0.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(11, 30, 0),
                DefaultEndTime = new TimeSpan(13, 30, 0),
                TravelTimeFromPrevious = 10
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Parakrama Samudra Ancient Reservoir Sunset Stroll",
                Description = "Vast 12th-century artificial inland sea with peaceful lake breezes and waterbird watching.",
                Location = "Parakrama Samudra, Polonnaruwa",
                Category = "nature",
                CostPerPerson = 0.0m,
                DurationMinutes = 90,
                DefaultStartTime = new TimeSpan(16, 30, 0),
                DefaultEndTime = new TimeSpan(18, 0, 0),
                TravelTimeFromPrevious = 15
            });
        }
        else if (destination.Contains("Trincomalee", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Koneswaram Temple & Swami Rock Cliff",
                Description = "Vibrant cliff-top Hindu temple towering 130m above the ocean at Lover's Leap with roaming fort deer.",
                Location = "Fort Frederick, Trincomalee",
                Category = "culture",
                CostPerPerson = 0.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(9, 0, 0),
                DefaultEndTime = new TimeSpan(11, 0, 0),
                TravelTimeFromPrevious = 20
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Pigeon Island Marine National Park Coral Snorkeling",
                Description = "Crystal-clear coral reefs teeming with harmless blacktip reef sharks, green turtles, and tropical fish.",
                Location = "Pigeon Island, Nilaveli",
                Category = "nature",
                CostPerPerson = 35.0m,
                DurationMinutes = 210,
                DefaultStartTime = new TimeSpan(11, 30, 0),
                DefaultEndTime = new TimeSpan(15, 0, 0),
                TravelTimeFromPrevious = 30
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Nilaveli White Sand Beach Coastal Relaxation",
                Description = "Pure white sands and calm shallow waters ideal for afternoon swimming and seafood dining.",
                Location = "Nilaveli Beach, Trincomalee",
                Category = "nature",
                CostPerPerson = 0.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(16, 0, 0),
                DefaultEndTime = new TimeSpan(18, 0, 0),
                TravelTimeFromPrevious = 15
            });
        }
        else if (destination.Contains("Bentota", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Madu Ganga Mangrove River Boat Safari",
                Description = "Boat excursion navigating mangrove tunnels, visiting cinnamon-peeling island and island monasteries.",
                Location = "Balapitiya / Bentota",
                Category = "nature",
                CostPerPerson = 15.0m,
                DurationMinutes = 135,
                DefaultStartTime = new TimeSpan(9, 0, 0),
                DefaultEndTime = new TimeSpan(11, 15, 0),
                TravelTimeFromPrevious = 20
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Bentota Lagoon Jet Ski & Water Sports",
                Description = "Exciting water sports along the sheltered Bentota river lagoon, including jet skiing and kayaking.",
                Location = "Bentota River Lagoon",
                Category = "nature",
                CostPerPerson = 25.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(12, 0, 0),
                DefaultEndTime = new TimeSpan(14, 0, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Kosgoda Sea Turtle Conservation & Sunset Release",
                Description = "Marine turtle rehabilitation project with the opportunity to release baby turtle hatchlings into the ocean.",
                Location = "Kosgoda, Bentota",
                Category = "nature",
                CostPerPerson = 5.0m,
                DurationMinutes = 90,
                DefaultStartTime = new TimeSpan(16, 30, 0),
                DefaultEndTime = new TimeSpan(18, 0, 0),
                TravelTimeFromPrevious = 20
            });
        }
        else if (destination.Contains("Colombo", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Gangaramaya Temple & Seema Malaka (Beira Lake)",
                Description = "Eclectic Buddhist temple and meditation hall floating on Beira Lake with ancient artifacts.",
                Location = "Colombo 02",
                Category = "culture",
                CostPerPerson = 3.0m,
                DurationMinutes = 90,
                DefaultStartTime = new TimeSpan(9, 0, 0),
                DefaultEndTime = new TimeSpan(10, 30, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "National Museum of Colombo & Royal Regalia",
                Description = "Sri Lanka's flagship museum housing the 17th-century throne and crown jewels of the Kandyan kingdom.",
                Location = "Cinnamon Gardens, Colombo",
                Category = "culture",
                CostPerPerson = 5.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(11, 0, 0),
                DefaultEndTime = new TimeSpan(13, 0, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Galle Face Green Oceanside Promenade & Sunset Food",
                Description = "Coastal promenade popular for sunset ocean views, kite flying, and street food like spicy isso vade.",
                Location = "Galle Face, Colombo",
                Category = "nature",
                CostPerPerson = 0.0m,
                DurationMinutes = 90,
                DefaultStartTime = new TimeSpan(16, 30, 0),
                DefaultEndTime = new TimeSpan(18, 0, 0),
                TravelTimeFromPrevious = 20
            });
        }
        else if (destination.Contains("Jaffna", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Nallur Kandaswamy Kovil Temple & Puja",
                Description = "Sacred Dravidian Hindu temple with golden gopuram entrance and ceremonial drumming rituals.",
                Location = "Nallur, Jaffna",
                Category = "culture",
                CostPerPerson = 0.0m,
                DurationMinutes = 100,
                DefaultStartTime = new TimeSpan(9, 0, 0),
                DefaultEndTime = new TimeSpan(10, 40, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Jaffna Dutch Fort & Lagoon Ramparts",
                Description = "Pentagonal limestone colonial fortress overlooking the Jaffna lagoon and causeways.",
                Location = "Jaffna Fort",
                Category = "culture",
                CostPerPerson = 0.0m,
                DurationMinutes = 100,
                DefaultStartTime = new TimeSpan(11, 30, 0),
                DefaultEndTime = new TimeSpan(13, 10, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Casuarina Beach & Karainagar Island",
                Description = "Calm, shallow turquoise waters and white sand beach sheltered by shady casuarina groves.",
                Location = "Karainagar, Jaffna",
                Category = "nature",
                CostPerPerson = 1.0m,
                DurationMinutes = 150,
                DefaultStartTime = new TimeSpan(14, 30, 0),
                DefaultEndTime = new TimeSpan(17, 0, 0),
                TravelTimeFromPrevious = 40
            });
        }
        else
        {
            // Dynamic place-aware candidate generation for custom places (e.g. Tangalle, Wilpattu, Negombo, Arugam Bay, etc.)
            string destLower = destination.ToLowerInvariant();
            bool isCoastal = destLower.Contains("beach") || destLower.Contains("bay") || destLower.Contains("tangalle") || destLower.Contains("negombo") || destLower.Contains("arugam") || destLower.Contains("weligama");
            bool isWildlife = destLower.Contains("wilpattu") || destLower.Contains("park") || destLower.Contains("safari") || destLower.Contains("udawalawe") || destLower.Contains("kumana");

            if (isWildlife)
            {
                candidates.Add(new ActivityCandidate
                {
                    Name = $"{destination} Wilderness Wildlife Jeep Safari",
                    Description = $"Open-top 4x4 wildlife safari tracking endemic animals, elephants, and exotic birds in {destination}.",
                    Location = destination,
                    Category = "nature",
                    CostPerPerson = 45.0m,
                    DurationMinutes = 210,
                    DefaultStartTime = new TimeSpan(6, 30, 0),
                    DefaultEndTime = new TimeSpan(10, 0, 0),
                    TravelTimeFromPrevious = 20
                });
                candidates.Add(new ActivityCandidate
                {
                    Name = $"{destination} Eco Sanctuary Nature Trail",
                    Description = $"Guided biodiversity trail learning about local flora, wetlands, and wildlife conservation in {destination}.",
                    Location = destination,
                    Category = "nature",
                    CostPerPerson = 10.0m,
                    DurationMinutes = 120,
                    DefaultStartTime = new TimeSpan(14, 30, 0),
                    DefaultEndTime = new TimeSpan(16, 30, 0),
                    TravelTimeFromPrevious = 20
                });
            }
            else if (isCoastal)
            {
                candidates.Add(new ActivityCandidate
                {
                    Name = $"{destination} Coastal Bay & Reef Exploration",
                    Description = $"Scenic coastal exploration, ocean breeze, and crystal-clear swimming along the shores of {destination}.",
                    Location = destination,
                    Category = "nature",
                    CostPerPerson = 0.0m,
                    DurationMinutes = 150,
                    DefaultStartTime = new TimeSpan(9, 0, 0),
                    DefaultEndTime = new TimeSpan(11, 30, 0),
                    TravelTimeFromPrevious = 15
                });
                candidates.Add(new ActivityCandidate
                {
                    Name = $"{destination} Fresh Seafood Dining & Sunset Coastal Walk",
                    Description = $"Relaxing sunset beachfront stroll and savoring authentic fresh ocean catch in {destination}.",
                    Location = destination,
                    Category = "nature",
                    CostPerPerson = 15.0m,
                    DurationMinutes = 120,
                    DefaultStartTime = new TimeSpan(16, 30, 0),
                    DefaultEndTime = new TimeSpan(18, 30, 0),
                    TravelTimeFromPrevious = 15
                });
            }
            else
            {
                candidates.Add(new ActivityCandidate
                {
                    Name = $"{destination} Cultural Landmarks & Heritage Walk",
                    Description = $"Guided cultural discovery exploring historical architecture, sacred sites, and local life in {destination}.",
                    Location = destination,
                    Category = "culture",
                    CostPerPerson = 10.0m,
                    DurationMinutes = 120,
                    DefaultStartTime = new TimeSpan(9, 0, 0),
                    DefaultEndTime = new TimeSpan(11, 0, 0),
                    TravelTimeFromPrevious = 15
                });
                candidates.Add(new ActivityCandidate
                {
                    Name = $"{destination} Scenic Viewpoint & Nature Trail",
                    Description = $"Panoramic trail exploring local countryside, tea gardens, or scenic waterways in {destination}.",
                    Location = destination,
                    Category = "nature",
                    CostPerPerson = 5.0m,
                    DurationMinutes = 120,
                    DefaultStartTime = new TimeSpan(14, 30, 0),
                    DefaultEndTime = new TimeSpan(16, 30, 0),
                    TravelTimeFromPrevious = 20
                });
            }
        }

        return candidates;
    }
}

public class TravelLogisticsAgent : ITravelLogisticsAgent
{
    public Task<List<ItineraryItem>> SequenceAndScheduleAsync(DateTime date, string location, List<ActivityCandidate> candidates, int maxDailyTravelHours)
    {
        var items = new List<ItineraryItem>();
        int order = 1;

        // Schedule at most 3 activities per day to prevent exhaustion and time-window overlaps
        var selected = candidates.Take(3).ToList();

        for (int i = 0; i < selected.Count; i++)
        {
            var cand = selected[i];
            var startTime = cand.DefaultStartTime;
            var endTime = cand.DefaultEndTime;

            // Ensure non-overlapping sequential schedule
            if (i > 0 && items.Count > 0)
            {
                var prev = items[i - 1];
                var buffer = TimeSpan.FromMinutes(cand.TravelTimeFromPrevious + 15);
                if (startTime < prev.EndTime + buffer)
                {
                    startTime = prev.EndTime + buffer;
                    endTime = startTime.Add(TimeSpan.FromMinutes(cand.DurationMinutes));
                }
            }

            items.Add(new ItineraryItem
            {
                Id = Guid.NewGuid().ToString(),
                ActivityName = cand.Name,
                Location = cand.Location,
                StartTime = startTime,
                EndTime = endTime,
                DurationMinutes = cand.DurationMinutes,
                EstimatedCost = cand.CostPerPerson,
                TravelTimeMinutes = i == 0 ? 0 : cand.TravelTimeFromPrevious,
                SequenceOrder = order++,
                Notes = cand.Description
            });
        }

        return Task.FromResult(items);
    }

    public Task<TransportLogisticsAssessment> AssessTransportLogisticsAsync(DateTime date, string origin, string destination, string transportType)
    {
        var assessment = new TransportLogisticsAssessment
        {
            Origin = origin,
            Destination = destination,
            RecommendedMode = transportType.ToUpper(),
            IsFeasible = true
        };

        if (transportType.Equals("BUS", StringComparison.OrdinalIgnoreCase))
        {
            assessment.EstimatedTravelMinutes = 180;
            assessment.EstimatedCost = 650.0m;
            assessment.LogisticsNotes.Add("Direct intercity highway/express bus connection available.");
        }
        else if (transportType.Equals("TRAIN", StringComparison.OrdinalIgnoreCase))
        {
            assessment.EstimatedTravelMinutes = 150;
            assessment.EstimatedCost = 1200.0m;
            assessment.LogisticsNotes.Add("Scenic rail connection with scheduled daily service.");
        }
        else
        {
            assessment.EstimatedTravelMinutes = 160;
            assessment.EstimatedCost = 800.0m;
            assessment.LogisticsNotes.Add("Public transit routing feasible via bus or train.");
        }

        return Task.FromResult(assessment);
    }
}

public class SafetyValidationAgent : ISafetyValidationAgent
{
    public Task<SafetyAssessmentResult> AssessSafetyAsync(string destination, List<ItineraryDay> days)
    {
        var advisories = new List<string>();

        if (destination.Contains("Ella", StringComparison.OrdinalIgnoreCase))
        {
            advisories.Add("Weather Warning: Afternoons in Ella can experience mist and showers. Rain gear recommended.");
        }
        if (destination.Contains("Sigiriya", StringComparison.OrdinalIgnoreCase))
        {
            advisories.Add("Heat Advisory: Hydration and early morning climb recommended for the Citadel.");
        }

        return Task.FromResult(new SafetyAssessmentResult
        {
            SafetyScore = 98.0,
            Advisories = advisories
        });
    }
}
