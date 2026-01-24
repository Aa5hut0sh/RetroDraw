/*
  Warnings:

  - Added the required column `secret` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "secret" TEXT NOT NULL;
