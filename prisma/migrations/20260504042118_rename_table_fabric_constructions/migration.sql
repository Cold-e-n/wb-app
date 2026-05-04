/*
  Warnings:

  - You are about to drop the `FabricConstruction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FabricConstruction" DROP CONSTRAINT "FabricConstruction_fabric_spec_id_fkey";

-- DropTable
DROP TABLE "FabricConstruction";

-- CreateTable
CREATE TABLE "fabric_constructions" (
    "id" TEXT NOT NULL,
    "fabric_spec_id" TEXT NOT NULL,
    "warping_machine" "WbMachineType" NOT NULL,
    "cone_count" INTEGER NOT NULL,
    "section_count" INTEGER NOT NULL,
    "section_length" INTEGER NOT NULL,
    "beam_width" DECIMAL(8,2) NOT NULL,
    "spare_ends" INTEGER NOT NULL,
    "beaming_loss" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "fabric_constructions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "fabric_constructions" ADD CONSTRAINT "fabric_constructions_fabric_spec_id_fkey" FOREIGN KEY ("fabric_spec_id") REFERENCES "fabric_specs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
