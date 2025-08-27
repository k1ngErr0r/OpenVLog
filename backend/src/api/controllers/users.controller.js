const winston = require('winston');
const userService = require('../../services/user.service');

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
    try {
        const users = await userService.getAllUsers();
        logger.info('Fetched all users.');
        res.json(users);
    } catch (error) {
        logger.error(`Error fetching users: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        logger.warn('Attempt to add user with missing username or password.');
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const user = await userService.addUser(username, password);
        logger.info(`User added: ${username}`);
        res.status(201).json(user);
    } catch (error) {
        if (error.code === '23505') {
            logger.warn(`Add user failed: Username ${username} already exists.`);
            return res.status(409).json({ error: 'Username already exists' });
        }
        logger.error(`Error adding user ${username}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await userService.deleteUser(id);
        if (!user) {
            logger.warn(`User ${id} not found for deletion.`);
            return res.status(404).json({ error: 'User not found' });
        }
        logger.info(`User deleted: ${id}`);
        res.status(204).send(); // No Content
    } catch (error) {
        logger.error(`Error deleting user ${id}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllUsers,
    addUser,
    deleteUser,
};
