using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace tourism_management_app.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRecommendationManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"ALTER TABLE ""Reviews"" ADD COLUMN IF NOT EXISTS ""OperatorNotes"" text;");
            migrationBuilder.Sql(@"ALTER TABLE ""Reviews"" ADD COLUMN IF NOT EXISTS ""Status"" text DEFAULT 'Published';");

            migrationBuilder.AddColumn<DateTime>(
                name: "FeaturedUntil",
                table: "Attractions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsExcludedFromRecommendations",
                table: "Attractions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsFeatured",
                table: "Attractions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "RecommendationSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InterestWeight = table.Column<decimal>(type: "numeric", nullable: false),
                    RatingWeight = table.Column<decimal>(type: "numeric", nullable: false),
                    BudgetWeight = table.Column<decimal>(type: "numeric", nullable: false),
                    DistanceWeight = table.Column<decimal>(type: "numeric", nullable: false),
                    PopularityWeight = table.Column<decimal>(type: "numeric", nullable: false),
                    HistoryWeight = table.Column<decimal>(type: "numeric", nullable: false),
                    MinReviewCountToRank = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecommendationSettings", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "RecommendationSettings",
                columns: new[] { "Id", "BudgetWeight", "DistanceWeight", "HistoryWeight", "InterestWeight", "MinReviewCountToRank", "PopularityWeight", "RatingWeight", "UpdatedAt", "UpdatedBy" },
                values: new object[] { 1, 15m, 15m, 5m, 30m, 0, 10m, 25m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RecommendationSettings");

            migrationBuilder.DropColumn(
                name: "OperatorNotes",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "FeaturedUntil",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "IsExcludedFromRecommendations",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "IsFeatured",
                table: "Attractions");
        }
    }
}
