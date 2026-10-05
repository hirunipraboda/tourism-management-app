using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Nova.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGuideAndReviewsEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "guides",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    provider_id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    phone = table.Column<string>(type: "text", nullable: true),
                    bio = table.Column<string>(type: "text", nullable: true),
                    languages = table.Column<List<string>>(type: "text[]", nullable: true),
                    specialties = table.Column<List<string>>(type: "text[]", nullable: true),
                    years_experience = table.Column<int>(type: "integer", nullable: true),
                    verification_status = table.Column<string>(type: "text", nullable: false),
                    rating_avg = table.Column<decimal>(type: "numeric", nullable: false),
                    rating_count = table.Column<int>(type: "integer", nullable: false),
                    tours_completed = table.Column<int>(type: "integer", nullable: false),
                    avatar_url = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_guides", x => x.id);
                    table.ForeignKey(
                        name: "fk_guides_users_provider_id",
                        column: x => x.provider_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "recommendation_settings",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    interest_weight = table.Column<decimal>(type: "numeric", nullable: false),
                    rating_weight = table.Column<decimal>(type: "numeric", nullable: false),
                    budget_weight = table.Column<decimal>(type: "numeric", nullable: false),
                    distance_weight = table.Column<decimal>(type: "numeric", nullable: false),
                    popularity_weight = table.Column<decimal>(type: "numeric", nullable: false),
                    history_weight = table.Column<decimal>(type: "numeric", nullable: false),
                    min_review_count_to_rank = table.Column<int>(type: "integer", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_recommendation_settings", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "review_helpful_votes",
                columns: table => new
                {
                    review_id = table.Column<string>(type: "text", nullable: false),
                    tourist_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_review_helpful_votes", x => new { x.review_id, x.tourist_id });
                    table.ForeignKey(
                        name: "fk_review_helpful_votes_reviews_review_id",
                        column: x => x.review_id,
                        principalTable: "reviews",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_review_helpful_votes_users_tourist_id",
                        column: x => x.tourist_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "guide_availabilities",
                columns: table => new
                {
                    availability_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    guide_id = table.Column<int>(type: "integer", nullable: false),
                    available_date = table.Column<DateOnly>(type: "date", nullable: false),
                    start_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    end_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    is_booked = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_guide_availabilities", x => x.availability_id);
                    table.ForeignKey(
                        name: "fk_guide_availabilities_guides_guide_id",
                        column: x => x.guide_id,
                        principalTable: "guides",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tour_packages",
                columns: table => new
                {
                    tour_package_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    guide_id = table.Column<int>(type: "integer", nullable: false),
                    package_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    destination = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    duration_days = table.Column<int>(type: "integer", nullable: false),
                    price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    max_group_size = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    image_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tour_packages", x => x.tour_package_id);
                    table.ForeignKey(
                        name: "fk_tour_packages_guides_guide_id",
                        column: x => x.guide_id,
                        principalTable: "guides",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tour_operations",
                columns: table => new
                {
                    tour_operation_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tour_package_id = table.Column<int>(type: "integer", nullable: false),
                    guide_id = table.Column<int>(type: "integer", nullable: false),
                    scheduled_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    number_of_tourists = table.Column<int>(type: "integer", nullable: false),
                    total_cost = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tour_operations", x => x.tour_operation_id);
                    table.ForeignKey(
                        name: "fk_tour_operations_guides_guide_id",
                        column: x => x.guide_id,
                        principalTable: "guides",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_tour_operations_tour_packages_tour_package_id",
                        column: x => x.tour_package_id,
                        principalTable: "tour_packages",
                        principalColumn: "tour_package_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "recommendation_settings",
                columns: new[] { "id", "budget_weight", "distance_weight", "history_weight", "interest_weight", "min_review_count_to_rank", "popularity_weight", "rating_weight", "updated_at", "updated_by" },
                values: new object[] { 1, 15m, 15m, 5m, 30m, 0, 10m, 25m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" });

            migrationBuilder.CreateIndex(
                name: "ix_guide_availabilities_guide_id",
                table: "guide_availabilities",
                column: "guide_id");

            migrationBuilder.CreateIndex(
                name: "ix_guides_provider_id",
                table: "guides",
                column: "provider_id");

            migrationBuilder.CreateIndex(
                name: "ix_review_helpful_votes_tourist_id",
                table: "review_helpful_votes",
                column: "tourist_id");

            migrationBuilder.CreateIndex(
                name: "ix_tour_operations_guide_id",
                table: "tour_operations",
                column: "guide_id");

            migrationBuilder.CreateIndex(
                name: "ix_tour_operations_tour_package_id",
                table: "tour_operations",
                column: "tour_package_id");

            migrationBuilder.CreateIndex(
                name: "ix_tour_packages_guide_id",
                table: "tour_packages",
                column: "guide_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tour_operations");

            migrationBuilder.DropTable(
                name: "guide_availabilities");

            migrationBuilder.DropTable(
                name: "tour_packages");

            migrationBuilder.DropTable(
                name: "guides");

            migrationBuilder.DropTable(
                name: "review_helpful_votes");

            migrationBuilder.DropTable(
                name: "recommendation_settings");
        }
    }
}
