using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SmartTourism.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateGuideFieldsForFrontend : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GuideAvailabilities_Guides_GuideId",
                table: "GuideAvailabilities");

            migrationBuilder.DropForeignKey(
                name: "FK_TourOperations_Guides_GuideId",
                table: "TourOperations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Guides",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "Language",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "Specialization",
                table: "Guides");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Guides",
                newName: "VerificationStatus");

            migrationBuilder.RenameColumn(
                name: "HourlyRate",
                table: "Guides",
                newName: "RatingAvg");

            migrationBuilder.RenameColumn(
                name: "GuideId",
                table: "Guides",
                newName: "ToursCompleted");

            migrationBuilder.AddColumn<int>(
                name: "GuideId",
                table: "TourPackages",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Guides",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<int>(
                name: "ToursCompleted",
                table: "Guides",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Guides",
                type: "integer",
                nullable: false,
                defaultValue: 0)
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Guides",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "Guides",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Guides",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<List<string>>(
                name: "Languages",
                table: "Guides",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Guides",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Guides",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ProviderId",
                table: "Guides",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RatingCount",
                table: "Guides",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<List<string>>(
                name: "Specialties",
                table: "Guides",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "YearsExperience",
                table: "Guides",
                type: "integer",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Guides",
                table: "Guides",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_TourPackages_GuideId",
                table: "TourPackages",
                column: "GuideId");

            migrationBuilder.AddForeignKey(
                name: "FK_GuideAvailabilities_Guides_GuideId",
                table: "GuideAvailabilities",
                column: "GuideId",
                principalTable: "Guides",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TourOperations_Guides_GuideId",
                table: "TourOperations",
                column: "GuideId",
                principalTable: "Guides",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TourPackages_Guides_GuideId",
                table: "TourPackages",
                column: "GuideId",
                principalTable: "Guides",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GuideAvailabilities_Guides_GuideId",
                table: "GuideAvailabilities");

            migrationBuilder.DropForeignKey(
                name: "FK_TourOperations_Guides_GuideId",
                table: "TourOperations");

            migrationBuilder.DropForeignKey(
                name: "FK_TourPackages_Guides_GuideId",
                table: "TourPackages");

            migrationBuilder.DropIndex(
                name: "IX_TourPackages_GuideId",
                table: "TourPackages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Guides",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "GuideId",
                table: "TourPackages");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "Bio",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "Languages",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "ProviderId",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "RatingCount",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "Specialties",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "YearsExperience",
                table: "Guides");

            migrationBuilder.RenameColumn(
                name: "VerificationStatus",
                table: "Guides",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "ToursCompleted",
                table: "Guides",
                newName: "GuideId");

            migrationBuilder.RenameColumn(
                name: "RatingAvg",
                table: "Guides",
                newName: "HourlyRate");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Guides",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "GuideId",
                table: "Guides",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Guides",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "Guides",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Language",
                table: "Guides",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Guides",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Specialization",
                table: "Guides",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Guides",
                table: "Guides",
                column: "GuideId");

            migrationBuilder.AddForeignKey(
                name: "FK_GuideAvailabilities_Guides_GuideId",
                table: "GuideAvailabilities",
                column: "GuideId",
                principalTable: "Guides",
                principalColumn: "GuideId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TourOperations_Guides_GuideId",
                table: "TourOperations",
                column: "GuideId",
                principalTable: "Guides",
                principalColumn: "GuideId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
