-- ============================================================================
-- FASE 4.2b: String-JSON → JSONB nativo do PostgreSQL
-- ============================================================================
-- User.permissions, Settings.hiddenColumns, ServiceOrder.arrivalPhotoUrls
-- eram String contendo JSON serializado. Agora são JSONB — integridade e
--AOinação nativa, sem JSON.parse/stringify na aplicação.
-- ============================================================================

-- User.permissions
ALTER TABLE "User" ALTER COLUMN "permissions" SET DEFAULT '[]'::jsonb;
ALTER TABLE "User" ALTER COLUMN "permissions" TYPE jsonb USING
  CASE
    WHEN "permissions" IS NULL THEN '[]'::jsonb
    WHEN "permissions" = '' THEN '[]'::jsonb
    ELSE "permissions"::jsonb
  END;

-- Settings.hiddenColumns
ALTER TABLE "Settings" ALTER COLUMN "hiddenColumns" SET DEFAULT '[]'::jsonb;
ALTER TABLE "Settings" ALTER COLUMN "hiddenColumns" TYPE jsonb USING
  CASE
    WHEN "hiddenColumns" IS NULL THEN '[]'::jsonb
    WHEN "hiddenColumns" = '' THEN '[]'::jsonb
    ELSE "hiddenColumns"::jsonb
  END;

-- ServiceOrder.arrivalPhotoUrls
ALTER TABLE "ServiceOrder" ALTER COLUMN "arrivalPhotoUrls" TYPE jsonb USING
  CASE
    WHEN "arrivalPhotoUrls" IS NULL THEN NULL
    ELSE "arrivalPhotoUrls"::jsonb
  END;