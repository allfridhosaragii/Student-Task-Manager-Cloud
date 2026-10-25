const taskService = require('../services/taskService');

const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_STATUSES = ['pending', 'in_progress', 'completed'];

function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  // Regex YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

class TaskController {
  /**
   * GET /api/tasks
   */
  async getAllTasks(req, res, next) {
    try {
      const { search, status, priority, course, sortBy, order } = req.query;
      const tasks = await taskService.getAllTasks({ search, status, priority, course, sortBy, order });
      return res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/tasks/summary
   */
  async getSummary(req, res, next) {
    try {
      const summary = await taskService.getTaskSummary();
      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/tasks/:id
   */
  async getTaskById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          error: 'ID tugas tidak valid'
        });
      }

      const task = await taskService.getTaskById(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: `Tugas dengan ID ${id} tidak ditemukan`
        });
      }

      return res.status(200).json({
        success: true,
        data: task
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/tasks
   */
  async createTask(req, res, next) {
    try {
      const { title, description, course, deadline, priority, status } = req.body;

      // Validation
      const errors = [];
      if (!title || typeof title !== 'string' || title.trim().length < 3) {
        errors.push('Judul tugas wajib diisi (minimal 3 karakter)');
      }
      if (!course || typeof course !== 'string' || course.trim().length < 2) {
        errors.push('Mata kuliah wajib diisi (minimal 2 karakter)');
      }
      if (!isValidDate(deadline)) {
        errors.push('Format deadline tidak valid. Gunakan format YYYY-MM-DD');
      }
      if (priority && !VALID_PRIORITIES.includes(priority)) {
        errors.push(`Prioritas harus salah satu dari: ${VALID_PRIORITIES.join(', ')}`);
      }
      if (status && !VALID_STATUSES.includes(status)) {
        errors.push(`Status harus salah satu dari: ${VALID_STATUSES.join(', ')}`);
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validasi data gagal',
          details: errors
        });
      }

      const newTask = await taskService.createTask({
        title: title.trim(),
        description: description ? description.trim() : '',
        course: course.trim(),
        deadline,
        priority: priority || 'medium',
        status: status || 'pending'
      });

      return res.status(201).json({
        success: true,
        message: 'Tugas berhasil ditambahkan',
        data: newTask
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUT /api/tasks/:id
   */
  async updateTask(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          error: 'ID tugas tidak valid'
        });
      }

      const { title, description, course, deadline, priority, status } = req.body;

      const errors = [];
      if (!title || typeof title !== 'string' || title.trim().length < 3) {
        errors.push('Judul tugas wajib diisi (minimal 3 karakter)');
      }
      if (!course || typeof course !== 'string' || course.trim().length < 2) {
        errors.push('Mata kuliah wajib diisi (minimal 2 karakter)');
      }
      if (!isValidDate(deadline)) {
        errors.push('Format deadline tidak valid. Gunakan format YYYY-MM-DD');
      }
      if (!VALID_PRIORITIES.includes(priority)) {
        errors.push(`Prioritas harus salah satu dari: ${VALID_PRIORITIES.join(', ')}`);
      }
      if (!VALID_STATUSES.includes(status)) {
        errors.push(`Status harus salah satu dari: ${VALID_STATUSES.join(', ')}`);
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validasi data gagal',
          details: errors
        });
      }

      const updatedTask = await taskService.updateTask(id, {
        title: title.trim(),
        description: description ? description.trim() : '',
        course: course.trim(),
        deadline,
        priority,
        status
      });

      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          error: `Tugas dengan ID ${id} tidak ditemukan`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Tugas berhasil diperbarui',
        data: updatedTask
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PATCH /api/tasks/:id/status
   */
  async updateTaskStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          error: 'ID tugas tidak valid'
        });
      }

      const { status } = req.body;
      if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Status tidak valid. Harus salah satu dari: ${VALID_STATUSES.join(', ')}`
        });
      }

      const updatedTask = await taskService.updateTaskStatus(id, status);
      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          error: `Tugas dengan ID ${id} tidak ditemukan`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Status tugas berhasil diubah menjadi ${status}`,
        data: updatedTask
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * DELETE /api/tasks/:id
   */
  async deleteTask(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          error: 'ID tugas tidak valid'
        });
      }

      const deletedTask = await taskService.deleteTask(id);
      if (!deletedTask) {
        return res.status(404).json({
          success: false,
          error: `Tugas dengan ID ${id} tidak ditemukan`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Tugas "${deletedTask.title}" berhasil dihapus`,
        data: { id: deletedTask.id }
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new TaskController();
