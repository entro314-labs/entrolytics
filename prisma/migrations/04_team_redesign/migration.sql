/*
  Warnings:

  - You are about to drop the `org_website` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "org" ADD COLUMN     "deleted_at" TIMESTAMPTZ(6),
ADD COLUMN     "logo_url" VARCHAR(2183);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "display_name" VARCHAR(255),
ADD COLUMN     "logo_url" VARCHAR(2183);

-- AlterTable
ALTER TABLE "website" ADD COLUMN     "created_by" UUID,
ADD COLUMN     "org_id" UUID;

-- MigrateData
UPDATE "website" SET created_by = user_id WHERE org_id IS NULL;

-- DropTable
DROP TABLE "org_website";

-- CreateIndex
CREATE INDEX "website_org_id_idx" ON "website"("org_id");

-- CreateIndex
CREATE INDEX "website_created_by_idx" ON "website"("created_by");