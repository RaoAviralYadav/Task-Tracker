const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Task = require('../models/Task');

const router = express.Router();

// ─── Validation helpers ───────────────────────────────────────────────────────

const taskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3 }).withMessage('Title must be at least 3 characters')
    .isLength({ max: 100 }).withMessage('Title must be 100 characters or fewer'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be 500 characters or fewer'),

  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status value'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority value'),

  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Due date must be a valid ISO date (YYYY-MM-DD)'),

  body('tags')
    .optional()
    .isArray({ max: 5 }).withMessage('Maximum 5 tags allowed')
    .custom((tags) => tags.every((t) => typeof t === 'string' && t.length <= 30))
    .withMessage('Each tag must be a string under 30 characters'),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

// ─── GET /api/tasks ──────────────────────────────────────────────────────────
// Query params: status, priority, search, sortBy, order, page, limit
router.get('/', async (req, res, next) => {
  try {
    const {
      status,
      priority,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};

    if (status && ['todo', 'in-progress', 'completed'].includes(status)) {
      filter.status = status;
    }
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      filter.priority = priority;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const validSortFields = ['createdAt', 'updatedAt', 'dueDate', 'title', 'priority'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = order === 'asc' ? 1 : -1;

    const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(Math.min(100, Number(limit)))
        .lean(),
      Task.countDocuments(filter),
    ]);

    res.json({
      tasks,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/tasks/:id ──────────────────────────────────────────────────────
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid task ID'),
  handleValidation,
  async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id).lean();
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/tasks ─────────────────────────────────────────────────────────
router.post('/', taskValidation, handleValidation, async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    const task = new Task({
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags || [],
    });

    await task.save();
    res.status(201).json(task.toJSON());
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/tasks/:id ──────────────────────────────────────────────────────
router.put(
  '/:id',
  param('id').isMongoId().withMessage('Invalid task ID'),
  // For updates, title is optional
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('Title must be at least 3 characters')
    .isLength({ max: 100 }).withMessage('Title must be 100 characters or fewer'),
  body('description').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('status').optional().isIn(['todo', 'in-progress', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date'),
  body('tags').optional().isArray({ max: 5 }),
  handleValidation,
  async (req, res, next) => {
    try {
      const allowed = ['title', 'description', 'status', 'priority', 'dueDate', 'tags'];
      const updates = {};
      allowed.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });

      if (updates.dueDate === null || updates.dueDate === '') {
        updates.dueDate = null;
      } else if (updates.dueDate) {
        updates.dueDate = new Date(updates.dueDate);
      }

      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();

      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/tasks/:id ───────────────────────────────────────────────────
router.delete(
  '/:id',
  param('id').isMongoId().withMessage('Invalid task ID'),
  handleValidation,
  async (req, res, next) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json({ message: 'Task deleted', id: req.params.id });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/tasks ───────────────────────────────────────────────────────
// Bulk delete by status (bonus feature)
router.delete('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    if (!status || !['todo', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Provide a valid status query param to bulk delete' });
    }
    const result = await Task.deleteMany({ status });
    res.json({ message: `Deleted ${result.deletedCount} tasks`, deletedCount: result.deletedCount });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
