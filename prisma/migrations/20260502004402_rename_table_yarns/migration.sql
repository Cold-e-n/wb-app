/*
  Warnings:

  - You are about to drop the column `color_layout_id` on the `fabrics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "fabrics" DROP COLUMN "color_layout_id";

-- AlterTable
ALTER TABLE "weaving_machines" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "yarns" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "yarns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "yarns_name_key" ON "yarns"("name");

-- CreateIndex
CREATE UNIQUE INDEX "yarns_slug_key" ON "yarns"("slug");
