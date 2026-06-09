-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('PRESENT', 'MISSING', 'PARTIAL');

-- CreateTable
CREATE TABLE "Set" (
    "id" TEXT NOT NULL,
    "setNum" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER,
    "theme" TEXT,
    "numParts" INTEGER,
    "imgUrl" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL,
    "partNum" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'unknown',
    "colorId" INTEGER,
    "imgUrl" TEXT,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetPart" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SetPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "setPartId" TEXT NOT NULL,
    "status" "InventoryStatus" NOT NULL DEFAULT 'PRESENT',
    "quantityOwned" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Set_setNum_key" ON "Set"("setNum");

-- CreateIndex
CREATE UNIQUE INDEX "Part_partNum_colorId_key" ON "Part"("partNum", "colorId");

-- CreateIndex
CREATE UNIQUE INDEX "SetPart_setId_partId_key" ON "SetPart"("setId", "partId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_setPartId_key" ON "Inventory"("setPartId");

-- AddForeignKey
ALTER TABLE "SetPart" ADD CONSTRAINT "SetPart_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetPart" ADD CONSTRAINT "SetPart_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_setPartId_fkey" FOREIGN KEY ("setPartId") REFERENCES "SetPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
