using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tourism_management_app.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAttractionEnrichment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActivityType",
                table: "Attractions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BestTimeToVisit",
                table: "Attractions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Attractions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Attractions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Duration",
                table: "Attractions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "EstimatedCostUsd",
                table: "Attractions",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Attractions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Attractions",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Attractions",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "OpeningHours",
                table: "Attractions",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActivityType",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "BestTimeToVisit",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "EstimatedCostUsd",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "OpeningHours",
                table: "Attractions");
        }
    }
}
