/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `PasswordReset` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PasswordReset" ADD COLUMN     "resetToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_resetToken_key" ON "PasswordReset"("resetToken");

-- CreateIndex
CREATE INDEX "PasswordReset_resetToken_idx" ON "PasswordReset"("resetToken");
