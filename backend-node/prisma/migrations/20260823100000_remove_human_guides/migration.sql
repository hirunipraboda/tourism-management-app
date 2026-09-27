-- AlterEnum
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role" USING ("role"::text::"Role");
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
DROP TYPE "Role_old";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_guideId_fkey";

-- DropForeignKey
ALTER TABLE "guide_languages" DROP CONSTRAINT IF EXISTS "guide_languages_guideId_fkey";

-- DropForeignKey
ALTER TABLE "guide_languages" DROP CONSTRAINT IF EXISTS "guide_languages_languageId_fkey";

-- DropForeignKey
ALTER TABLE "guide_specializations" DROP CONSTRAINT IF EXISTS "guide_specializations_guideId_fkey";

-- DropForeignKey
ALTER TABLE "guides" DROP CONSTRAINT IF EXISTS "guides_userId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "reviews_guideId_fkey";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "guideId",
DROP COLUMN IF EXISTS "guideRequired";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN IF EXISTS "guideId";

-- AlterTable
ALTER TABLE "trips" DROP COLUMN IF EXISTS "guideRequired";

-- DropTable
DROP TABLE IF EXISTS "guide_languages";

-- DropTable
DROP TABLE IF EXISTS "guide_specializations";

-- DropTable
DROP TABLE IF EXISTS "guides";

-- DropTable
DROP TABLE IF EXISTS "languages";

-- DropEnum
DROP TYPE IF EXISTS "SpecializationType";
