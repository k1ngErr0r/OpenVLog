const winston = require('winston');
const userService = require('../../services/user.service');
const { HttpError } = require('../../middleware/error.middleware');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
    ],
  });

const getAllUsers = async (req, res) => {
  const users = await userService.getAllUsers();
  res.json(users);
};

const addUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) throw new HttpError(400, 'Username and password are required', 'VALIDATION');
  try {
    const user = await userService.addUser(username, password);
    res.status(201).json(user);
  } catch (error) {
    if (error.code === '23505') throw new HttpError(409, 'Username already exists', 'DUPLICATE');
    throw error;
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await userService.deleteUser(id);
  if (!user) throw new HttpError(404, 'User not found', 'NOT_FOUND');
  res.status(204).send();
};

module.exports = {
    getAllUsers,
    addUser,
    deleteUser,
};
