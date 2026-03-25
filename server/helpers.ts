import db from "./database.js";

/**
 * Paginated query helper. Returns data + meta with pagination info.
 */
export function getPaginatedData(
  tableName: string,
  page: number = 1,
  limit: number = 20,
  options: {
    where?: string;
    params?: unknown[];
    orderBy?: string;
    join?: string;
    select?: string;
  } = {}
) {
  const offset = (page - 1) * limit;
  const whereClause = options.where ? `WHERE ${options.where}` : "";
  const params = options.params || [];
  const orderBy = options.orderBy || "id DESC";
  const join = options.join || "";
  const select = options.select || "*";

  const countQuery = `SELECT COUNT(*) as total FROM ${tableName} ${join} ${whereClause}`;
  const totalResult = db.prepare(countQuery).get(...params) as { total: number };
  const total = totalResult.total;

  const dataQuery = `SELECT ${select} FROM ${tableName} ${join} ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
  const data = db.prepare(dataQuery).all(...params, limit, offset);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Log an audit entry
 */
export function logAudit(
  userId: number,
  action: string,
  entity: string,
  entityId: number | bigint,
  details: string
): void {
  db.prepare(
    "INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)"
  ).run(userId, action, entity, entityId, details);
}
