CREATE TABLE "SystemError" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'error',
    "operation" TEXT,
    "message" TEXT NOT NULL,
    "requestId" TEXT,
    "route" TEXT,
    "method" TEXT,
    "userId" INTEGER,
    "username" TEXT,
    "statusCode" INTEGER,
    "stack" TEXT,
    "details" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SystemError_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SystemError_timestamp_idx" ON "SystemError"("timestamp");
CREATE INDEX "SystemError_severity_resolved_idx" ON "SystemError"("severity", "resolved");
CREATE INDEX "SystemError_requestId_idx" ON "SystemError"("requestId");
CREATE INDEX "SystemError_operation_idx" ON "SystemError"("operation");
