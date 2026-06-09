-- CreateTable
CREATE TABLE "Minifig" (
    "id" TEXT NOT NULL,
    "figNum" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "numParts" INTEGER,
    "imgUrl" TEXT,

    CONSTRAINT "Minifig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetMinifig" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "minifigId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "InventoryStatus" NOT NULL DEFAULT 'PRESENT',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SetMinifig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Minifig_figNum_key" ON "Minifig"("figNum");

-- CreateIndex
CREATE UNIQUE INDEX "SetMinifig_setId_minifigId_key" ON "SetMinifig"("setId", "minifigId");

-- AddForeignKey
ALTER TABLE "SetMinifig" ADD CONSTRAINT "SetMinifig_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetMinifig" ADD CONSTRAINT "SetMinifig_minifigId_fkey" FOREIGN KEY ("minifigId") REFERENCES "Minifig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
