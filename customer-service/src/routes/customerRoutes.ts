import { Router } from 'express';
import {
    createCustomerHandler,
    getCustomerByIdHandler,
    getCustomerByUserIdHandler,
} from '../controllers/customerController.js';

const router = Router();

router.post('/', createCustomerHandler);
router.get('/:id', getCustomerByIdHandler);
router.get('/', getCustomerByUserIdHandler);

export default router;