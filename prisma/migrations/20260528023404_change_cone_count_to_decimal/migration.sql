/*
  Warnings:

  - You are about to alter the column `cone_count` on the `fabric_constructions` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(8,2)`.

*/
-- AlterTable
ALTER TABLE "fabric_constructions" ALTER COLUMN "cone_count" SET DATA TYPE DECIMAL(8,2);
