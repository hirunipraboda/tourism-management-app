using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tourism_management_app.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHelpfulCount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HelpfulCount",
                table: "Reviews",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HelpfulCount",
                table: "Reviews");
        }
    }
}
