namespace SmartTourism.API.Domain.Entities.Enums;

public enum GuideVerificationStatus { Pending, Verified, Rejected }

public enum TourOperationStatus { Scheduled, CheckedIn, InProgress, Completed, NoShow, Cancelled }

public enum UserRole { Tourist, Provider, Admin }
