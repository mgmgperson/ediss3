import { Router } from 'express';
import {
    createBookHandler,
    getBookByIsbnHandler,
    updateBookHandler,
} from '../controllers/bookController.js';

const router = Router();

router.post('/', createBookHandler);
router.get('/isbn/:ISBN', getBookByIsbnHandler);
router.get('/:ISBN', getBookByIsbnHandler);
router.put('/:ISBN', updateBookHandler);

export default router;