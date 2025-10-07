import Joi from 'joi';

const budgetSchema = Joi.object({
  amount: Joi.number().min(0).optional(),
  currency: Joi.string().max(10).optional(),
}).optional();

const documentSchema = Joi.object({
  filename: Joi.string().optional(),
  url: Joi.string().uri().optional(),
  uploadedBy: Joi.string().length(24).hex().optional(),
  uploadedAt: Joi.date().optional(),
}).optional();

const milestoneSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().allow('').optional(),
  dueDate: Joi.date().optional(),
  status: Joi.string().valid('pending','in_progress','done','blocked').optional(),
  completedAt: Joi.date().optional(),
}).optional();

export const createProjectSchema = Joi.object({
  title: Joi.string().trim().min(1).required(),
  description: Joi.string().allow('').optional(),
  budget: budgetSchema,
  status: Joi.string().valid('proposed','planned','active','paused','completed','cancelled').optional(),
  client: Joi.string().length(24).hex().optional(),
  owner: Joi.string().length(24).hex().optional(),
  assignedUsers: Joi.array().items(Joi.string().length(24).hex()).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  documents: Joi.array().items(documentSchema).optional(),
  milestones: Joi.array().items(milestoneSchema).optional(),
});

export const updateProjectSchema = Joi.object({
  title: Joi.string().trim().min(1).optional(),
  description: Joi.string().allow('').optional(),
  budget: budgetSchema,
  status: Joi.string().valid('proposed','planned','active','paused','completed','cancelled').optional(),
  client: Joi.string().length(24).hex().optional(),
  owner: Joi.string().length(24).hex().optional(),
  assignedUsers: Joi.array().items(Joi.string().length(24).hex()).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  documents: Joi.array().items(documentSchema).optional(),
  milestones: Joi.array().items(milestoneSchema).optional(),
  archived: Joi.boolean().optional(),
});

export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: 'Validation error', details: error.details.map(d => d.message) });
    }
    req.body = value;
    next();
  };
}
