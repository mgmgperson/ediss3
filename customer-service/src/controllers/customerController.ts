import type { Request, Response } from 'express';
import {
    createCustomer,
    customerExistsByUserId,
    getCustomerById,
    getCustomerByUserId,
} from '../db/customerRepo.js';
import {
    isValidCustomerBody,
    isValidEmail,
} from '../validations/customerValidation.js';

export async function createCustomerHandler(req: Request, res: Response): Promise<void> {
    try {
        if (!isValidCustomerBody(req.body)) {
        res.sendStatus(400);
        return;
        }

        const customer = req.body;
        const normalizedState = customer.state.toUpperCase();

        const exists = await customerExistsByUserId(customer.userId);
        if (exists) {
        res.status(422).json({
            message: 'This user ID already exists in the system.',
        });
        return;
        }

        const newId = await createCustomer({
        userId: customer.userId,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        address2: customer.address2 ?? null,
        city: customer.city,
        state: normalizedState,
        zipcode: customer.zipcode,
        });

        res
        .status(201)
        .location(`/customers/${newId}`)
        .json({
            id: newId,
            userId: customer.userId,
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            address2: customer.address2 ?? null,
            city: customer.city,
            state: normalizedState,
            zipcode: customer.zipcode,
        });
    } catch (error) {
        console.error('createCustomerHandler error:', error);
        res.sendStatus(500);
    }
}

export async function getCustomerByIdHandler(req: Request, res: Response): Promise<void> {
    try {
        const rawId = req.params.id;
        const id = Number(rawId);

        if (!rawId || !Number.isInteger(id) || id <= 0) {
        res.sendStatus(400);
        return;
        }

        const customer = await getCustomerById(id);

        if (!customer) {
        res.sendStatus(404);
        return;
        }

        res.status(200).json(customer);
    } catch (error) {
        console.error('getCustomerByIdHandler error:', error);
        res.sendStatus(500);
    }
}

export async function getCustomerByUserIdHandler(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.query.userId;

        if (typeof userId !== 'string' || !isValidEmail(userId)) {
        res.sendStatus(400);
        return;
        }

        const customer = await getCustomerByUserId(userId);

        if (!customer) {
        res.sendStatus(404);
        return;
        }

        res.status(200).json(customer);
    } catch (error) {
        console.error('getCustomerByUserIdHandler error:', error);
        res.sendStatus(500);
    }
}