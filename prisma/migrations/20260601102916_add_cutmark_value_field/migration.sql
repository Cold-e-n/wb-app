/*
  Warnings:

  - Added the required column `cutmark_value` to the `fabric_constructions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fabric_constructions" ADD COLUMN     "cutmark_value" TEXT NOT NULL;
