/*
  Warnings:

  - The values [BENNINGER,KARLMAYER,MO,TSUDAKOMA] on the enum `WbMachineType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WbMachineType_new" AS ENUM ('BENN_KM', 'MO_TS');
ALTER TABLE "fabric_constructions" ALTER COLUMN "warping_machine" TYPE "WbMachineType_new" USING ("warping_machine"::text::"WbMachineType_new");
ALTER TYPE "WbMachineType" RENAME TO "WbMachineType_old";
ALTER TYPE "WbMachineType_new" RENAME TO "WbMachineType";
DROP TYPE "public"."WbMachineType_old";
COMMIT;
