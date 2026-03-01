-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_booth_id_fkey";

-- AlterTable
ALTER TABLE "Booth" ADD COLUMN     "model_url" TEXT,
ADD COLUMN     "position_x" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "position_y" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "position_z" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "rotation_x" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "rotation_y" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "rotation_z" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "scale" DOUBLE PRECISION DEFAULT 1,
ADD COLUMN     "zone_id" UUID;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "booth_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "BoothItem" (
    "id" UUID NOT NULL,
    "booth_id" UUID NOT NULL,
    "item_type" TEXT NOT NULL,
    "color" TEXT,
    "position_x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position_y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position_z" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rotation_x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rotation_y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rotation_z" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoothItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Booth" ADD CONSTRAINT "Booth_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoothItem" ADD CONSTRAINT "BoothItem_booth_id_fkey" FOREIGN KEY ("booth_id") REFERENCES "Booth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_booth_id_fkey" FOREIGN KEY ("booth_id") REFERENCES "Booth"("id") ON DELETE SET NULL ON UPDATE CASCADE;
