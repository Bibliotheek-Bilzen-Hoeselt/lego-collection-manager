/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Set` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Set" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Set_slug_key" ON "Set"("slug");
