-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'REVIEW_REMINDER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastReviewedAt" TIMESTAMP(3);
