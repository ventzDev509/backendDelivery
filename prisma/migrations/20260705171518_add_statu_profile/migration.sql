-- CreateEnum
CREATE TYPE "SellerStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "documentUrl" TEXT,
ADD COLUMN     "sellerStatus" "SellerStatus" NOT NULL DEFAULT 'NONE';
