-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."NoShowParty" AS ENUM ('STUDENT', 'COACH');

-- CreateEnum
CREATE TYPE "public"."CompletedBy" AS ENUM ('SYSTEM', 'STUDENT', 'COACH');

-- CreateEnum
CREATE TYPE "public"."SlotStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('COACH', 'STUDENT');

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'ACTIVE',
    "noShowBy" "public"."NoShowParty",
    "completedAt" TIMESTAMP(3),
    "completedBy" "public"."CompletedBy",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CallReview" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "satisfactionScore" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoachStatistics" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "totalCalls" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "totalSlots" INTEGER NOT NULL DEFAULT 0,
    "completedSlots" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Slot" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "public"."SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_slotId_key" ON "public"."Booking"("slotId");

-- CreateIndex
CREATE INDEX "Booking_studentId_idx" ON "public"."Booking"("studentId");

-- CreateIndex
CREATE INDEX "Booking_coachId_idx" ON "public"."Booking"("coachId");

-- CreateIndex
CREATE UNIQUE INDEX "CallReview_bookingId_key" ON "public"."CallReview"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachStatistics_coachId_key" ON "public"."CoachStatistics"("coachId");

-- CreateIndex
CREATE INDEX "Slot_coachId_idx" ON "public"."Slot"("coachId");

-- CreateIndex
CREATE INDEX "Slot_startTime_idx" ON "public"."Slot"("startTime");

-- CreateIndex
CREATE UNIQUE INDEX "Slot_coachId_startTime_key" ON "public"."Slot"("coachId", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "public"."Slot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CallReview" ADD CONSTRAINT "CallReview_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoachStatistics" ADD CONSTRAINT "CoachStatistics_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Slot" ADD CONSTRAINT "Slot_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
