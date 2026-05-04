-- CreateTable
CREATE TABLE "fabric_specs" (
    "id" TEXT NOT NULL,
    "fabric_id" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "length" INTEGER NOT NULL,
    "warp_yarn_id" TEXT NOT NULL,
    "weft_yarn_id" TEXT NOT NULL,
    "color" TEXT,
    "cutmark_per_roll" JSONB NOT NULL,
    "total_ends" INTEGER NOT NULL,
    "reed_width" DECIMAL(8,2) NOT NULL,
    "reed_no" TEXT NOT NULL,
    "fringe" INTEGER,
    "pick_per_inch" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "fabric_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FabricConstruction" (
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

    CONSTRAINT "FabricConstruction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fabric_specs_fabric_id_width_length_warp_yarn_id_weft_yarn__key" ON "fabric_specs"("fabric_id", "width", "length", "warp_yarn_id", "weft_yarn_id");

-- AddForeignKey
ALTER TABLE "fabric_specs" ADD CONSTRAINT "fabric_specs_fabric_id_fkey" FOREIGN KEY ("fabric_id") REFERENCES "fabrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fabric_specs" ADD CONSTRAINT "fabric_specs_warp_yarn_id_fkey" FOREIGN KEY ("warp_yarn_id") REFERENCES "yarns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fabric_specs" ADD CONSTRAINT "fabric_specs_weft_yarn_id_fkey" FOREIGN KEY ("weft_yarn_id") REFERENCES "yarns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricConstruction" ADD CONSTRAINT "FabricConstruction_fabric_spec_id_fkey" FOREIGN KEY ("fabric_spec_id") REFERENCES "fabric_specs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
