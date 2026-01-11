-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "googleId" TEXT,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingSession" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "rangeFromISO" TEXT NOT NULL,
    "rangeToISO" TEXT NOT NULL,
    "participants" TEXT NOT NULL,
    "proposedSlots" TEXT,
    "selectedSlot" TEXT,
    "confirmedEvent" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'instant',
    "bookingSlug" TEXT,
    "pollVotes" TEXT,
    "workHoursPolicy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingSession_bookingSlug_key" ON "MeetingSession"("bookingSlug");
