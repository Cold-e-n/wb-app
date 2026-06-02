-- AlterTable
CREATE SEQUENCE fabric_constructions_construction_no_seq;
ALTER TABLE "fabric_constructions" ALTER COLUMN "construction_no" SET DEFAULT nextval('fabric_constructions_construction_no_seq');
ALTER SEQUENCE fabric_constructions_construction_no_seq OWNED BY "fabric_constructions"."construction_no";
