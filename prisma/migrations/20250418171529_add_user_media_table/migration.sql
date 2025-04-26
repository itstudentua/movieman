/*
  Warnings:

  - You are about to drop the column `myRating` on the `UserMedia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserMedia" DROP COLUMN "myRating",
ADD COLUMN     "userComment" TEXT,
ADD COLUMN     "userRating" DOUBLE PRECISION;
