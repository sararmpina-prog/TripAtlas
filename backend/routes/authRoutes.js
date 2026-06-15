import express from 'express';
import { login, register } from '../controllers/authController.js'; 
import { validateBody } from '../middlewares/validationMiddleware.js';
import { loginSchema} from '../validators/authValidator.js';
import { createUserSchema } from '../validators/userValidator.js';

const router = express.Router();

// Rota de Login
router.post("/login", validateBody(loginSchema), login);

// Rota de Registo
router.post("/register", validateBody(createUserSchema), register);


export default router;

