


const Joi = require('joi');

const agentSchema = Joi.object({
  id: Joi.string().required(),
  performanceScore: Joi.number().integer().min(0).max(100).required(),
  seniorityMonths: Joi.number().integer().min(0).required(),
  targetAchievedPercent: Joi.number().min(0).max(100).required(),
  activeClients: Joi.number().integer().min(0).required(),
});

const allocationSchema = Joi.object({
  siteKitty: Joi.number().min(0).required(),
  salesAgents: Joi.array().items(agentSchema).required(),
});

exports.validateAllocationRequest = (req, res, next) => {
  
  const { error } = allocationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};