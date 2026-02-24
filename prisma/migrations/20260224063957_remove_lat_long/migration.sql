/*
  Warnings:

  - You are about to drop the column `latitude` on the `Booth` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Booth` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Booth` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booth" DROP CONSTRAINT "Booth_user_id_fkey";

-- AlterTable
ALTER TABLE "Booth" DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "type",
ALTER COLUMN "user_id" DROP NOT NULL;

-- DropEnum
DROP TYPE "BoothType";

-- AddForeignKey
ALTER TABLE "Booth" ADD CONSTRAINT "Booth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
