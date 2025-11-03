-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "bestAnswerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "questions_slug_key" ON "questions"("slug");

-- CreateIndex
CREATE INDEX "questions_authorId_idx" ON "questions"("authorId");

-- CreateIndex
CREATE INDEX "questions_createdAt_idx" ON "questions"("createdAt");

-- CreateIndex
CREATE INDEX "questions_slug_idx" ON "questions"("slug");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
