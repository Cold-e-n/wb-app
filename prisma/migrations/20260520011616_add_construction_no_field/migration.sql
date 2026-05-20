/*
  Warnings:

  - Added the required column `construction_no` to the `fabric_constructions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fabric_constructions" ADD COLUMN     "construction_no" INTEGER NOT NULL;
