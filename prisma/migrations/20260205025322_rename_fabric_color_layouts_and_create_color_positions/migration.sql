/*
  Warnings:

  - You are about to drop the column `fabric_color_layout_id` on the `fabrics` table. All the data in the column will be lost.
  - You are about to drop the `fabric_color_layouts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "fabric_color_layouts" DROP CONSTRAINT "fabric_color_layouts_fabric_id_fkey";

-- AlterTable
ALTER TABLE "fabrics" DROP COLUMN "fabric_color_layout_id",
ADD COLUMN     "color_layout_id" TEXT;

-- DropTable
DROP TABLE "fabric_color_layouts";

-- CreateTable
CREATE TABLE "color_layouts" (
    "id" TEXT NOT NULL,
    "fabric_id" TEXT NOT NULL,
    "color_content" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "color_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "color_positions" (
    "id" TEXT NOT NULL,
    "fabric_id" TEXT NOT NULL,
    "color_layout_id" TEXT NOT NULL,
    "fabric_content" JSONB,

    CONSTRAINT "color_positions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "color_layouts_fabric_id_key" ON "color_layouts"("fabric_id");

-- CreateIndex
CREATE UNIQUE INDEX "color_positions_fabric_id_key" ON "color_positions"("fabric_id");

-- CreateIndex
CREATE UNIQUE INDEX "color_positions_color_layout_id_key" ON "color_positions"("color_layout_id");

-- AddForeignKey
ALTER TABLE "color_layouts" ADD CONSTRAINT "color_layouts_fabric_id_fkey" FOREIGN KEY ("fabric_id") REFERENCES "fabrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "color_positions" ADD CONSTRAINT "color_positions_fabric_id_fkey" FOREIGN KEY ("fabric_id") REFERENCES "fabrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "color_positions" ADD CONSTRAINT "color_positions_color_layout_id_fkey" FOREIGN KEY ("color_layout_id") REFERENCES "color_layouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
