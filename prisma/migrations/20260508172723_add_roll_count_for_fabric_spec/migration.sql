/*
  Warnings:

  - Added the required column `roll_count` to the `fabric_specs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fabric_specs" ADD COLUMN     "roll_count" INTEGER NOT NULL;
