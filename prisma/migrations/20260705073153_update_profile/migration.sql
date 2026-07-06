-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('OPEN', 'BUSY', 'CLOSED');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "storeStatus" "StoreStatus" NOT NULL DEFAULT 'CLOSED';
