-- CreateEnum
CREATE TYPE "MachineType" AS ENUM ('BENNINGER', 'KARL_MAYER', 'W_MO', 'W_TSUDAKOMA');

-- CreateEnum
CREATE TYPE "ProcessType" AS ENUM ('WARPING', 'BEAMING');

-- CreateTable
CREATE TABLE "colors" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_reports" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "machine" "MachineType" NOT NULL DEFAULT 'BENNINGER',
    "process_type" "ProcessType" NOT NULL DEFAULT 'WARPING',
    "operator" TEXT,
    "fabricId" TEXT,
    "no_wb" TEXT,
    "no_mc" TEXT,
    "cones" SMALLINT,
    "length" SMALLINT,
    "section_beam" INTEGER,
    "speed" SMALLINT,
    "start" CHAR(5),
    "finish" CHAR(5),
    "duration" SMALLINT,
    "theoritical_time" SMALLINT,
    "available_time" SMALLINT,
    "eff_machine" DECIMAL(4,2),
    "eff_production" DECIMAL(4,2),
    "remark" VARCHAR(100),
    "lost_start" CHAR(5),
    "lost_finish" CHAR(5),
    "lost_desc" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "daily_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fabrics" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "fabrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colors_slug_key" ON "colors"("slug");

-- CreateIndex
CREATE INDEX "daily_reports_date_machine_process_type_idx" ON "daily_reports"("date", "machine", "process_type");

-- CreateIndex
CREATE UNIQUE INDEX "fabrics_slug_key" ON "fabrics"("slug");

-- AddForeignKey
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "fabrics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
