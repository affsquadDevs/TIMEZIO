-- CreateTable
CREATE TABLE "MeetingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
