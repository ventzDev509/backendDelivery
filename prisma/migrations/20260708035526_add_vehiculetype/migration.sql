-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('MOTORCYCLE', 'BICYCLE', 'CAR', 'TRUCK');

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "vehiclePlate" TEXT,
ADD COLUMN     "vehicleType" "VehicleType" NOT NULL DEFAULT 'MOTORCYCLE';
