namespace tourism_management_app.Api.Models
{
    public class ReviewHelpfulVote
    {
        public int ReviewId { get; set; }
        public Review Review { get; set; } = null!;

        public int TouristId { get; set; }
        public Tourist Tourist { get; set; } = null!;
    }
}
