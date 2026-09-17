using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nova.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialTripItineraryManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "destinations",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    slug = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    location = table.Column<string>(type: "text", nullable: false),
                    province = table.Column<string>(type: "text", nullable: false),
                    image_url = table.Column<string>(type: "text", nullable: false),
                    rating = table.Column<double>(type: "double precision", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_destinations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "activities",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    destination_id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    cost_per_person = table.Column<decimal>(type: "numeric", nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    opening_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    closing_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    latitude = table.Column<double>(type: "double precision", nullable: true),
                    longitude = table.Column<double>(type: "double precision", nullable: true),
                    image_url = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_activities", x => x.id);
                    table.ForeignKey(
                        name: "fk_activities_destinations_destination_id",
                        column: x => x.destination_id,
                        principalTable: "destinations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "trips",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    destination = table.Column<string>(type: "text", nullable: false),
                    destination_id = table.Column<string>(type: "text", nullable: true),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    number_of_travelers = table.Column<int>(type: "integer", nullable: false),
                    budget = table.Column<decimal>(type: "numeric", nullable: false),
                    interests = table.Column<List<string>>(type: "text[]", nullable: false),
                    trip_style = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_trips", x => x.id);
                    table.ForeignKey(
                        name: "fk_trips_destinations_destination_id",
                        column: x => x.destination_id,
                        principalTable: "destinations",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_trips_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "itineraries",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    trip_id = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    total_estimated_cost = table.Column<decimal>(type: "numeric", nullable: false),
                    feasibility_score = table.Column<double>(type: "double precision", nullable: false),
                    approved_by_user_id = table.Column<string>(type: "text", nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    approval_comments = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_itineraries", x => x.id);
                    table.ForeignKey(
                        name: "fk_itineraries_trips_trip_id",
                        column: x => x.trip_id,
                        principalTable: "trips",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "itinerary_generation_workflows",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    trip_id = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    current_step = table.Column<string>(type: "text", nullable: false),
                    constraints_json = table.Column<string>(type: "text", nullable: false),
                    error_message = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_itinerary_generation_workflows", x => x.id);
                    table.ForeignKey(
                        name: "fk_itinerary_generation_workflows_trips_trip_id",
                        column: x => x.trip_id,
                        principalTable: "trips",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "itinerary_approvals",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    itinerary_id = table.Column<string>(type: "text", nullable: false),
                    approved_by_user_id = table.Column<string>(type: "text", nullable: false),
                    action = table.Column<string>(type: "text", nullable: false),
                    previous_status = table.Column<string>(type: "text", nullable: false),
                    new_status = table.Column<string>(type: "text", nullable: false),
                    comments = table.Column<string>(type: "text", nullable: false),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_itinerary_approvals", x => x.id);
                    table.ForeignKey(
                        name: "fk_itinerary_approvals_itineraries_itinerary_id",
                        column: x => x.itinerary_id,
                        principalTable: "itineraries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "itinerary_days",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    itinerary_id = table.Column<string>(type: "text", nullable: false),
                    date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    day_number = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    location = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_itinerary_days", x => x.id);
                    table.ForeignKey(
                        name: "fk_itinerary_days_itineraries_itinerary_id",
                        column: x => x.itinerary_id,
                        principalTable: "itineraries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "workflow_audit_logs",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    workflow_id = table.Column<string>(type: "text", nullable: false),
                    action = table.Column<string>(type: "text", nullable: false),
                    actor = table.Column<string>(type: "text", nullable: false),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    details = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_workflow_audit_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_workflow_audit_logs_itinerary_generation_workflows_workflow",
                        column: x => x.workflow_id,
                        principalTable: "itinerary_generation_workflows",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "itinerary_items",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    itinerary_day_id = table.Column<string>(type: "text", nullable: false),
                    activity_id = table.Column<string>(type: "text", nullable: true),
                    activity_name = table.Column<string>(type: "text", nullable: false),
                    location = table.Column<string>(type: "text", nullable: false),
                    start_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    estimated_cost = table.Column<decimal>(type: "numeric", nullable: false),
                    travel_time_minutes = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    sequence_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_itinerary_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_itinerary_items_activities_activity_id",
                        column: x => x.activity_id,
                        principalTable: "activities",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_itinerary_items_itinerary_days_itinerary_day_id",
                        column: x => x.itinerary_day_id,
                        principalTable: "itinerary_days",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_activities_destination_id",
                table: "activities",
                column: "destination_id");

            migrationBuilder.CreateIndex(
                name: "ix_destinations_slug",
                table: "destinations",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_itineraries_trip_id",
                table: "itineraries",
                column: "trip_id");

            migrationBuilder.CreateIndex(
                name: "ix_itinerary_approvals_itinerary_id",
                table: "itinerary_approvals",
                column: "itinerary_id");

            migrationBuilder.CreateIndex(
                name: "ix_itinerary_days_itinerary_id",
                table: "itinerary_days",
                column: "itinerary_id");

            migrationBuilder.CreateIndex(
                name: "ix_itinerary_generation_workflows_trip_id",
                table: "itinerary_generation_workflows",
                column: "trip_id");

            migrationBuilder.CreateIndex(
                name: "ix_itinerary_items_activity_id",
                table: "itinerary_items",
                column: "activity_id");

            migrationBuilder.CreateIndex(
                name: "ix_itinerary_items_itinerary_day_id",
                table: "itinerary_items",
                column: "itinerary_day_id");

            migrationBuilder.CreateIndex(
                name: "ix_trips_destination_id",
                table: "trips",
                column: "destination_id");

            migrationBuilder.CreateIndex(
                name: "ix_trips_user_id",
                table: "trips",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_workflow_audit_logs_workflow_id",
                table: "workflow_audit_logs",
                column: "workflow_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "itinerary_approvals");

            migrationBuilder.DropTable(
                name: "itinerary_items");

            migrationBuilder.DropTable(
                name: "workflow_audit_logs");

            migrationBuilder.DropTable(
                name: "activities");

            migrationBuilder.DropTable(
                name: "itinerary_days");

            migrationBuilder.DropTable(
                name: "itinerary_generation_workflows");

            migrationBuilder.DropTable(
                name: "itineraries");

            migrationBuilder.DropTable(
                name: "trips");

            migrationBuilder.DropTable(
                name: "destinations");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
