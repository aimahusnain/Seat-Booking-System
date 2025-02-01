-- CreateTable
CREATE TABLE "Seat" (
    "_id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "seat" INTEGER NOT NULL,
    "isBooked" BOOLEAN NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Users" (
    "_id" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Table" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("_id")
);

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
