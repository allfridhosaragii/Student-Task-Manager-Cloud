const db = require('../database/db');

class TaskService {
  /**
   * Get all tasks with optional search and filters
   */
  async getAllTasks({ search, status, priority, course, sortBy = 'created_at', order = 'DESC' } = {}) {
    const validSortFields = ['id', 'title', 'course', 'deadline', 'priority', 'status', 'created_at', 'updated_at'];
    const validOrders = ['ASC', 'DESC'];

    const actualSort = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const actualOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      conditions.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length} OR course ILIKE $${params.length})`);
    }

    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (priority && priority !== 'all') {
      params.push(priority);
      conditions.push(`priority = $${params.length}`);
    }

    if (course && course.trim() !== '') {
      params.push(`%${course.trim()}%`);
      conditions.push(`course ILIKE $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT id, title, description, course, 
             TO_CHAR(deadline, 'YYYY-MM-DD') AS deadline,
             priority, status, created_at, updated_at
      FROM tasks
      ${whereClause}
      ORDER BY ${actualSort} ${actualOrder}
    `;

    const result = await db.query(sql, params);
    return result.rows;
  }

  /**
   * Get single task by ID
   */
  async getTaskById(id) {
    const sql = `
      SELECT id, title, description, course,
             TO_CHAR(deadline, 'YYYY-MM-DD') AS deadline,
             priority, status, created_at, updated_at
      FROM tasks
      WHERE id = $1
    `;
    const result = await db.query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get dashboard summary / metrics
   */
  async getTaskSummary() {
    const sql = `
      SELECT
        COUNT(*)::int AS total_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int AS pending_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END)::int AS in_progress_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::int AS completed_tasks,
        COUNT(CASE WHEN priority = 'high' AND status != 'completed' THEN 1 END)::int AS high_priority_tasks,
        COUNT(CASE WHEN deadline < CURRENT_DATE AND status != 'completed' THEN 1 END)::int AS overdue_tasks
      FROM tasks
    `;
    const result = await db.query(sql);
    return result.rows[0];
  }

  /**
   * Create a new task
   */
  async createTask({ title, description, course, deadline, priority = 'medium', status = 'pending' }) {
    const sql = `
      INSERT INTO tasks (title, description, course, deadline, priority, status, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id, title, description, course,
                TO_CHAR(deadline, 'YYYY-MM-DD') AS deadline,
                priority, status, created_at, updated_at
    `;
    const result = await db.query(sql, [title, description || '', course, deadline, priority, status]);
    return result.rows[0];
  }

  /**
   * Update full task
   */
  async updateTask(id, { title, description, course, deadline, priority, status }) {
    const sql = `
      UPDATE tasks
      SET title = $1,
          description = $2,
          course = $3,
          deadline = $4,
          priority = $5,
          status = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, title, description, course,
                TO_CHAR(deadline, 'YYYY-MM-DD') AS deadline,
                priority, status, created_at, updated_at
    `;
    const result = await db.query(sql, [title, description || '', course, deadline, priority, status, id]);
    return result.rows[0] || null;
  }

  /**
   * Update status only
   */
  async updateTaskStatus(id, status) {
    const sql = `
      UPDATE tasks
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, title, description, course,
                TO_CHAR(deadline, 'YYYY-MM-DD') AS deadline,
                priority, status, created_at, updated_at
    `;
    const result = await db.query(sql, [status, id]);
    return result.rows[0] || null;
  }

  /**
   * Delete task by ID
   */
  async deleteTask(id) {
    const sql = `DELETE FROM tasks WHERE id = $1 RETURNING id, title`;
    const result = await db.query(sql, [id]);
    return result.rows[0] || null;
  }
}

module.exports = new TaskService();
