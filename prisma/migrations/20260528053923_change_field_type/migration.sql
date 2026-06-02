/*
  Warnings:

  - You are about to alter the column `cone_count` on the `fabric_constructions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(8,2)` to `Integer`.
  - You are about to alter the column `beam_width` on the `fabric_constructions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(8,2)` to `Integer`.
  - Added the required column `cone_length` to the `fabric_constructions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fabric_constructions" ADD COLUMN     "cone_length" INTEGER NOT NULL,
ALTER COLUMN "cone_count" SET DATA TYPE INTEGER,
ALTER COLUMN "beam_width" SET DATA TYPE INTEGER,
ALTER COLUMN "construction_no" DROP DEFAULT;
DROP SEQUENCE "fabric_constructions_construction_no_seq";
