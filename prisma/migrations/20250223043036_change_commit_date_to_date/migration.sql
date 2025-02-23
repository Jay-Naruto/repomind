/*
  Warnings:

  - Added the required column `commitDate` to the `Commit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Commit" DROP COLUMN "commitDate",
ADD COLUMN     "commitDate" TIMESTAMP(3) NOT NULL;
