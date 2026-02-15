/*
  Warnings:

  - You are about to drop the column `fabricId` on the `daily_reports` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `fabrics` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "daily_reports" DROP CONSTRAINT "daily_reports_fabricId_fkey";

-- AlterTable
ALTER TABLE "daily_reports" DROP COLUMN "fabricId";

-- AlterTable
ALTER TABLE "fabrics" ADD COLUMN     "fabric_color_layout_id" TEXT,
ADD COLUMN     "has_color" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "fabric_color_layouts" (
    "id" TEXT NOT NULL,
    "fabric_id" TEXT NOT NULL,
    "colorContent" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "fabric_color_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fabric_color_layouts_fabric_id_key" ON "fabric_color_layouts"("fabric_id");

-- CreateIndex
CREATE UNIQUE INDEX "fabrics_name_key" ON "fabrics"("name");

-- AddForeignKey
ALTER TABLE "fabric_color_layouts" ADD CONSTRAINT "fabric_color_layouts_fabric_id_fkey" FOREIGN KEY ("fabric_id") REFERENCES "fabrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
