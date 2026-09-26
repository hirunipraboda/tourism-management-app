namespace Nova.Api.DTOs
{
    public class AttractionReadDto
    {
        public Guid Id { get; set; }
        public Guid DestinationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? OpeningHours { get; set; }
        public decimal? EntryFee { get; set; }
        public int? VisitDurationMinutes { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool IsAccessible { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AttractionCreateDto
    {
        public Guid DestinationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? OpeningHours { get; set; }
        public decimal? EntryFee { get; set; }
        public int? VisitDurationMinutes { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool IsAccessible { get; set; } = true;
    }

    public class AttractionUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? OpeningHours { get; set; }
        public decimal? EntryFee { get; set; }
        public int? VisitDurationMinutes { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool IsAccessible { get; set; }
    }
}