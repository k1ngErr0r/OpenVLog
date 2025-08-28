const { HttpError } = require('../../middleware/error.middleware');
const commentService = require('../../services/comment.service');
const vulnerabilityService = require('../../services/vulnerability.service');

const list = async (req, res) => {
  const { vulnerabilityId } = req.params;
  const vuln = await vulnerabilityService.getVulnerabilityById(vulnerabilityId);
  if (!vuln) throw new HttpError(404, 'Vulnerability not found', 'NOT_FOUND');
  const comments = await commentService.listComments(vulnerabilityId);
  res.json(comments);
};

const add = async (req, res) => {
  const { vulnerabilityId } = req.params;
  const { body } = req.body;
  if (!body || !body.trim()) throw new HttpError(400, 'Comment body required', 'VALIDATION');
  const vuln = await vulnerabilityService.getVulnerabilityById(vulnerabilityId);
  if (!vuln) throw new HttpError(404, 'Vulnerability not found', 'NOT_FOUND');
  const comment = await commentService.addComment(vulnerabilityId, req.user.userId, body.trim());
  res.status(201).json(comment);
};

module.exports = { list, add };
