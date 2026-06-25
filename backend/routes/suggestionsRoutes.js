/* Rotas REST para gerir sugestões no backend principal.

Este ficheiro expõe apenas o CRUD determinístico da entidade suggestions.
*/

import express from 'express';
import { validateIdParam } from '../middlewares/validateIdParams.js';
import {getSuggestions} from '../controllers/suggestionsController.js'
import {deleteSuggestionById} from '../controllers/suggestionsController.js'


const router = express.Router();

router.get('/', getSuggestions);

router.delete('/:suggestionId', validateIdParam('suggestionId'), deleteSuggestionById);

export default router;