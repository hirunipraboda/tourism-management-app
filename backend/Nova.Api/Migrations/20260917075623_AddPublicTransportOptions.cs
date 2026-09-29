using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nova.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicTransportOptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "transport_options",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    trip_id = table.Column<string>(type: "text", nullable: true),
                    itinerary_item_id = table.Column<string>(type: "text", nullable: true),
                    transport_type = table.Column<string>(type: "text", nullable: false),
                    origin = table.Column<string>(type: "text", nullable: false),
                    destination = table.Column<string>(type: "text", nullable: false),
                    travel_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    departure_time = table.Column<string>(type: "text", nullable: false),
                    arrival_time = table.Column<string>(type: "text", nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    route_number = table.Column<string>(type: "text", nullable: true),
                    route_name = table.Column<string>(type: "text", nullable: true),
                    direction = table.Column<string>(type: "text", nullable: true),
                    intermediate_stops = table.Column<List<string>>(type: "text[]", nullable: false),
                    train_name = table.Column<string>(type: "text", nullable: true),
                    train_number = table.Column<string>(type: "text", nullable: true),
                    departure_station = table.Column<string>(type: "text", nullable: true),
                    arrival_station = table.Column<string>(type: "text", nullable: true),
                    train_type = table.Column<string>(type: "text", nullable: true),
                    estimated_fare = table.Column<decimal>(type: "numeric", nullable: true),
                    source = table.Column<string>(type: "text", nullable: false),
                    retrieved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_selected = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_transport_options", x => x.id);
                    table.ForeignKey(
                        name: "fk_transport_options_itinerary_items_itinerary_item_id",
                        column: x => x.itinerary_item_id,
                        principalTable: "itinerary_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_transport_options_trips_trip_id",
                        column: x => x.trip_id,
                        principalTable: "trips",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_transport_options_itinerary_item_id",
                table: "transport_options",
                column: "itinerary_item_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_transport_options_origin_destination_travel_date",
                table: "transport_options",
                columns: new[] { "origin", "destination", "travel_date" });

            migrationBuilder.CreateIndex(
                name: "ix_transport_options_trip_id",
                table: "transport_options",
                column: "trip_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "transport_options");
        }
    }
}
