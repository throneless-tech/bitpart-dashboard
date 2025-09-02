/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `State` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "State_name_key" ON "State"("name");
