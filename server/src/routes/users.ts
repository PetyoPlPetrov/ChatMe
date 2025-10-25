import express from 'express';
import { mockUsers } from '../data/mockUsers';
import { User } from '../types';

const router = express.Router();

// GET /api/users - Get all users
router.get('/', (req, res) => {
  try {
    // Simulate network delay like the frontend mock
    setTimeout(() => {
      res.json(mockUsers);
    }, 300);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  try {
    const userId = req.params.id;

    setTimeout(() => {
      try {
        const user = mockUsers.find((u: User) => u.id === userId);

        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }

        res.json(user);
      } catch (error) {
        console.error('Error in setTimeout:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }, 300);

    // Note: We don't return here because the response is handled in setTimeout
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
