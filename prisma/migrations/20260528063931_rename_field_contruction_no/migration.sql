/*
  Warnings:

  - You are about to drop the column `construction_no` on the `fabric_constructions` table. All the data in the column will be lost.
  - Added the required column `construction_id` to the `fabric_constructions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fabric_constructions" DROP COLUMN "construction_no",
ADD COLUMN     "construction_id" INTEGER NOT NULL;
