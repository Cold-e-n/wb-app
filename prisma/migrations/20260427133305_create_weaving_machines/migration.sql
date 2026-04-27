/*
  Warnings:

  - You are about to drop the `daily_reports` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "WbMachineType" AS ENUM ('BENNINGER', 'KARLMAYER', 'MO', 'TSUDAKOMA');

-- CreateEnum
CREATE TYPE "WbProcessType" AS ENUM ('WARPING', 'BEAMING');

-- DropTable
DROP TABLE "daily_reports";

-- DropEnum
DROP TYPE "MachineType";

-- DropEnum
DROP TYPE "ProcessType";

-- CreateTable
CREATE TABLE "weaving_machines" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "width" INTEGER NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "weaving_machines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "weaving_machines_name_key" ON "weaving_machines"("name");

-- CreateIndex
CREATE UNIQUE INDEX "weaving_machines_slug_key" ON "weaving_machines"("slug");
