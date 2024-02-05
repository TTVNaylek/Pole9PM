/*
  Warnings:

  - You are about to drop the column `createdAt` on the `userToken` table. All the data in the column will be lost.
  - You are about to drop the column `hashedToken` on the `userToken` table. All the data in the column will be lost.
  - You are about to drop the column `revoked` on the `userToken` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `userToken` table. All the data in the column will be lost.
  - Added the required column `token` to the `userToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "userToken" DROP COLUMN "createdAt",
DROP COLUMN "hashedToken",
DROP COLUMN "revoked",
DROP COLUMN "updateAt",
ADD COLUMN     "token" TEXT NOT NULL;
