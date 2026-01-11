-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MeetingSession" (
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
    "mode" TEXT NOT NULL DEFAULT 'instant',
    "bookingSlug" TEXT,
    "pollVotes" TEXT,
    "workHoursPolicy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_MeetingSession" ("confirmedEvent", "createdAt", "creatorId", "description", "durationMinutes", "id", "participants", "proposedSlots", "rangeFromISO", "rangeToISO", "selectedSlot", "title") SELECT "confirmedEvent", "createdAt", "creatorId", "description", "durationMinutes", "id", "participants", "proposedSlots", "rangeFromISO", "rangeToISO", "selectedSlot", "title" FROM "MeetingSession";
DROP TABLE "MeetingSession";
ALTER TABLE "new_MeetingSession" RENAME TO "MeetingSession";
CREATE UNIQUE INDEX "MeetingSession_bookingSlug_key" ON "MeetingSession"("bookingSlug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
