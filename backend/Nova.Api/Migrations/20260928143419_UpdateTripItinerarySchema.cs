using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nova.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTripItinerarySchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_bookings_trips_trip_id",
                table: "bookings");

            migrationBuilder.AddColumn<string>(
                name: "created_source",
                table: "trips",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "trip_name",
                table: "trips",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "created_source",
                table: "itineraries",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "fk_bookings_trips_trip_id",
                table: "bookings",
                column: "trip_id",
                principalTable: "trips",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_bookings_trips_trip_id",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "created_source",
                table: "trips");

            migrationBuilder.DropColumn(
                name: "trip_name",
                table: "trips");

            migrationBuilder.DropColumn(
                name: "created_source",
                table: "itineraries");

            migrationBuilder.AddForeignKey(
                name: "fk_bookings_trips_trip_id",
                table: "bookings",
                column: "trip_id",
                principalTable: "trips",
                principalColumn: "id");
        }
    }
}
