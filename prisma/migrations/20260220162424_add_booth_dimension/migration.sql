/*
  Warnings:

  - Added the required column `dimension` to the `Booth` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booth" ADD COLUMN     "dimension" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "rating" SET DATA TYPE DECIMAL(2,1);
