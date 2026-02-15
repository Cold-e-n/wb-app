/*
  Warnings:

  - Added the required column `wb_no` to the `color_positions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "color_positions" ADD COLUMN     "wb_no" TEXT NOT NULL;
