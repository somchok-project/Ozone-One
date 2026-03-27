/*
  Warnings:

  - A unique constraint covering the columns `[payment_trans_ref]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "payment_trans_ref" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_payment_trans_ref_key" ON "Booking"("payment_trans_ref");
