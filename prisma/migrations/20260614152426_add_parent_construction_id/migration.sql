-- AlterTable
ALTER TABLE "fabric_constructions" ADD COLUMN     "parent_construction_id" TEXT;

-- AddForeignKey
ALTER TABLE "fabric_constructions" ADD CONSTRAINT "fabric_constructions_parent_construction_id_fkey" FOREIGN KEY ("parent_construction_id") REFERENCES "fabric_constructions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
