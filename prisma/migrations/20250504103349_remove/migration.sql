/*
  Warnings:

  - You are about to drop the column `poster` on the `UserListItem` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `UserListItem` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `UserListItem` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `UserListItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserListItem" DROP COLUMN "poster",
DROP COLUMN "title",
DROP COLUMN "type",
DROP COLUMN "year";
