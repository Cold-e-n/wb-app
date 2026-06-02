/*
  Warnings:

  - A unique constraint covering the columns `[construction_id]` on the table `fabric_constructions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "fabric_constructions_construction_id_key" ON "fabric_constructions"("construction_id");
