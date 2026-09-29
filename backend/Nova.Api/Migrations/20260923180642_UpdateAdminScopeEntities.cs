using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nova.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminScopeEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "attractions",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    destination_id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    location = table.Column<string>(type: "text", nullable: false),
                    opening_time = table.Column<string>(type: "text", nullable: false),
                    closing_time = table.Column<string>(type: "text", nullable: false),
                    estimated_duration = table.Column<string>(type: "text", nullable: false),
                    estimated_cost = table.Column<decimal>(type: "numeric", nullable: false),
                    image_url = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_attractions", x => x.id);
                    table.ForeignKey(
                        name: "fk_attractions_destinations_destination_id",
                        column: x => x.destination_id,
                        principalTable: "destinations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "chatbot_payments",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    purchase_id = table.Column<string>(type: "text", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    package_name = table.Column<string>(type: "text", nullable: false),
                    amount = table.Column<decimal>(type: "numeric", nullable: false),
                    payment_method = table.Column<string>(type: "text", nullable: false),
                    masked_card_number = table.Column<string>(type: "text", nullable: false),
                    transaction_reference = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chatbot_payments", x => x.id);
                    table.ForeignKey(
                        name: "fk_chatbot_payments_chatbot_package_purchases_purchase_id",
                        column: x => x.purchase_id,
                        principalTable: "chatbot_package_purchases",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_chatbot_payments_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "promo_payments",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    promo_code_id = table.Column<string>(type: "text", nullable: true),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    promo_code = table.Column<string>(type: "text", nullable: false),
                    amount_paid = table.Column<decimal>(type: "numeric", nullable: false),
                    payment_method = table.Column<string>(type: "text", nullable: false),
                    masked_card_number = table.Column<string>(type: "text", nullable: false),
                    transaction_reference = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    promo_code_status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_promo_payments", x => x.id);
                    table.ForeignKey(
                        name: "fk_promo_payments_promo_codes_promo_code_id",
                        column: x => x.promo_code_id,
                        principalTable: "promo_codes",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_promo_payments_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "system_activities",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    activity_type = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    actor_name = table.Column<string>(type: "text", nullable: false),
                    actor_role = table.Column<string>(type: "text", nullable: false),
                    severity = table.Column<string>(type: "text", nullable: false),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_system_activities", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_attractions_destination_id",
                table: "attractions",
                column: "destination_id");

            migrationBuilder.CreateIndex(
                name: "ix_chatbot_payments_purchase_id",
                table: "chatbot_payments",
                column: "purchase_id");

            migrationBuilder.CreateIndex(
                name: "ix_chatbot_payments_user_id",
                table: "chatbot_payments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_promo_payments_promo_code_id",
                table: "promo_payments",
                column: "promo_code_id");

            migrationBuilder.CreateIndex(
                name: "ix_promo_payments_user_id",
                table: "promo_payments",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "attractions");

            migrationBuilder.DropTable(
                name: "chatbot_payments");

            migrationBuilder.DropTable(
                name: "promo_payments");

            migrationBuilder.DropTable(
                name: "system_activities");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "users");
        }
    }
}
