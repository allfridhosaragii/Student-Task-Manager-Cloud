const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Metrics / Summary
router.get('/summary', taskController.getSummary);

// CRUD
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id/status', taskController.updateTaskStatus);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
