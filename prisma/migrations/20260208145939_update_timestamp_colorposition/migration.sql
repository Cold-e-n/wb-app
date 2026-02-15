/*
  Warnings:

  - Made the column `created_at` on table `color_positions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "color_positions" ALTER COLUMN "created_at" SET NOT NULL;
