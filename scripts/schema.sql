-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WeekPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeekPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeekSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "task" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'surface',
    "planId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeekSlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WeekSlot_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WeekPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FlashFolder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FlashFolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FlashFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FlashFolder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FlashTopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FlashTopic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FlashTopic_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "FlashFolder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Board_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "List" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "x" REAL NOT NULL DEFAULT 24,
    "y" REAL NOT NULL DEFAULT 24,
    "w" REAL NOT NULL DEFAULT 296,
    "h" REAL NOT NULL DEFAULT 320,
    "z" INTEGER NOT NULL DEFAULT 0,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "trashedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "List_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "listId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "dueDate" DATETIME,
    "trashedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Card_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Drawing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "w" REAL NOT NULL,
    "h" REAL NOT NULL,
    "strokes" TEXT NOT NULL,
    "z" INTEGER NOT NULL DEFAULT 0,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "trashedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Drawing_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FlashCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FlashCard_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "FlashTopic" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FlashCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizFolder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuizFolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "QuizFolder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Quiz_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "QuizFolder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prompt" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL DEFAULT false,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "QuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled',
    "content" TEXT NOT NULL DEFAULT '{"text":"","strokes":[]}',
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "z" INTEGER NOT NULL DEFAULT 0,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "trashedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '',
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "w" REAL NOT NULL DEFAULT 300,
    "h" REAL NOT NULL DEFAULT 48,
    "trashedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Link_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Arrow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "x1" REAL NOT NULL,
    "y1" REAL NOT NULL,
    "x2" REAL NOT NULL,
    "y2" REAL NOT NULL,
    "fromType" TEXT NOT NULL DEFAULT '',
    "fromId" TEXT NOT NULL DEFAULT '',
    "fromSide" TEXT NOT NULL DEFAULT '',
    "toType" TEXT NOT NULL DEFAULT '',
    "toId" TEXT NOT NULL DEFAULT '',
    "toSide" TEXT NOT NULL DEFAULT '',
    "trashedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Arrow_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BoardFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mime" TEXT NOT NULL DEFAULT '',
    "size" BIGINT NOT NULL DEFAULT 0,
    "kind" TEXT NOT NULL DEFAULT 'file',
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "trashedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BoardFile_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BoardTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "cols" INTEGER NOT NULL DEFAULT 4,
    "rows" INTEGER NOT NULL DEFAULT 7,
    "cells" TEXT NOT NULL DEFAULT '{}',
    "trashedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BoardTable_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Heading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "w" REAL NOT NULL DEFAULT 640,
    "h" REAL NOT NULL DEFAULT 96,
    "z" INTEGER NOT NULL DEFAULT 0,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "fontSize" INTEGER NOT NULL DEFAULT 28,
    "color" TEXT NOT NULL DEFAULT '#1e293b',
    "bold" BOOLEAN NOT NULL DEFAULT false,
    "align" TEXT NOT NULL DEFAULT 'center',
    "trashedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Heading_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "w" REAL NOT NULL DEFAULT 320,
    "h" REAL NOT NULL DEFAULT 320,
    "z" INTEGER NOT NULL DEFAULT 0,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "trashedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Note_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "WeekPlan_userId_idx" ON "WeekPlan"("userId");

-- CreateIndex
CREATE INDEX "WeekSlot_userId_day_idx" ON "WeekSlot"("userId", "day");

-- CreateIndex
CREATE INDEX "WeekSlot_planId_idx" ON "WeekSlot"("planId");

-- CreateIndex
CREATE INDEX "FlashFolder_userId_parentId_idx" ON "FlashFolder"("userId", "parentId");

-- CreateIndex
CREATE INDEX "FlashTopic_userId_createdAt_idx" ON "FlashTopic"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "FlashTopic_folderId_idx" ON "FlashTopic"("folderId");

-- CreateIndex
CREATE INDEX "List_boardId_idx" ON "List"("boardId");

-- CreateIndex
CREATE INDEX "List_boardId_trashedAt_idx" ON "List"("boardId", "trashedAt");

-- CreateIndex
CREATE INDEX "Card_listId_order_idx" ON "Card"("listId", "order");

-- CreateIndex
CREATE INDEX "Card_listId_trashedAt_idx" ON "Card"("listId", "trashedAt");

-- CreateIndex
CREATE INDEX "Drawing_boardId_idx" ON "Drawing"("boardId");

-- CreateIndex
CREATE INDEX "Drawing_boardId_trashedAt_idx" ON "Drawing"("boardId", "trashedAt");

-- CreateIndex
CREATE INDEX "FlashCard_userId_createdAt_idx" ON "FlashCard"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "FlashCard_topicId_createdAt_idx" ON "FlashCard"("topicId", "createdAt");

-- CreateIndex
CREATE INDEX "QuizFolder_userId_parentId_idx" ON "QuizFolder"("userId", "parentId");

-- CreateIndex
CREATE INDEX "Quiz_userId_createdAt_idx" ON "Quiz"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Quiz_folderId_idx" ON "Quiz"("folderId");

-- CreateIndex
CREATE INDEX "QuizQuestion_quizId_order_idx" ON "QuizQuestion"("quizId", "order");

-- CreateIndex
CREATE INDEX "QuizOption_questionId_order_idx" ON "QuizOption"("questionId", "order");

-- CreateIndex
CREATE INDEX "Document_boardId_idx" ON "Document"("boardId");

-- CreateIndex
CREATE INDEX "Document_boardId_trashedAt_idx" ON "Document"("boardId", "trashedAt");

-- CreateIndex
CREATE INDEX "Link_boardId_idx" ON "Link"("boardId");

-- CreateIndex
CREATE INDEX "Link_boardId_trashedAt_idx" ON "Link"("boardId", "trashedAt");

-- CreateIndex
CREATE INDEX "Arrow_boardId_idx" ON "Arrow"("boardId");

-- CreateIndex
CREATE INDEX "Arrow_boardId_trashedAt_idx" ON "Arrow"("boardId", "trashedAt");

-- CreateIndex
CREATE INDEX "BoardFile_boardId_idx" ON "BoardFile"("boardId");

-- CreateIndex
CREATE INDEX "BoardFile_boardId_trashedAt_idx" ON "BoardFile"("boardId", "trashedAt");

-- CreateIndex
CREATE INDEX "BoardTable_boardId_idx" ON "BoardTable"("boardId");

-- CreateIndex
CREATE INDEX "BoardTable_boardId_trashedAt_idx" ON "BoardTable"("boardId", "trashedAt");

-- CreateIndex
CREATE INDEX "Heading_boardId_idx" ON "Heading"("boardId");

-- CreateIndex
CREATE INDEX "Heading_boardId_trashedAt_idx" ON "Heading"("boardId", "trashedAt");

-- CreateIndex
CREATE INDEX "Note_boardId_idx" ON "Note"("boardId");

-- CreateIndex
CREATE INDEX "Note_boardId_trashedAt_idx" ON "Note"("boardId", "trashedAt");

-- CreateTable
CREATE TABLE "Diagram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled diagram',
    "document" TEXT NOT NULL DEFAULT '{"shapes":[],"connectors":[]}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Diagram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Diagram_userId_updatedAt_idx" ON "Diagram"("userId", "updatedAt");

