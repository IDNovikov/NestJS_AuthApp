/*
  Warnings:

  - You are about to drop the `Desk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sticker` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Desk" DROP CONSTRAINT "Desk_userId_fkey";

-- DropForeignKey
ALTER TABLE "Sticker" DROP CONSTRAINT "Sticker_deskId_fkey";

-- DropTable
DROP TABLE "Desk";

-- DropTable
DROP TABLE "Sticker";
