import express from 'express';
import { login, register } from '../controllers/authController.js'; 
import { validateBody } from '../middlewares/validationMiddleware.js';
import { loginSchema, registerSchema } from '../validators/authValidator.js';

const router = express.Router();

// Rota de Login
router.post("/login", validateBody(loginSchema), login);

// Rota de Registo
router.post("/register", validateBody(registerSchema), register);


export default router;

