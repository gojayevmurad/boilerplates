/*
  Warnings:

  - You are about to drop the column `isConfirmed` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isConfirmed",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
