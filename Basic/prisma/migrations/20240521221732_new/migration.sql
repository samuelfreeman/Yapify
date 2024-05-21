-- CreateTable
CREATE TABLE "ClientTotal" (
    "id" SERIAL NOT NULL,
    "total" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientTotal_pkey" PRIMARY KEY ("id")
);
