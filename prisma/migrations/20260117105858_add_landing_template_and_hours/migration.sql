-- CreateEnum
CREATE TYPE "LandingTemplate" AS ENUM ('CATALOG', 'BRANDING', 'INFO');

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "landingTemplate" "LandingTemplate" NOT NULL DEFAULT 'CATALOG',
ADD COLUMN     "openingHours" TEXT;
