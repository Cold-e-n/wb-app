/*
  Warnings:

  - You are about to drop the column `roll_count` on the `fabric_specs` table. All the data in the column will be lost.
  - Added the required column `roll_count` to the `fabric_constructions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fabric_constructions" ADD COLUMN     "roll_count" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "fabric_specs" DROP COLUMN "roll_count";
