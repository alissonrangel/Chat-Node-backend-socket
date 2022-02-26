import express from 'express';
import { getRooms } from './users'

const router = express.Router();

router.get('/', (req, res) => {
  res.send('server is up and runner.');
})

router.get('/rooms', (req, res) => {
  res.json({ rooms: getRooms()})
})

export default router;