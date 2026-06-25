/* Rotas REST para gerir sugestões no backend principal.

Este ficheiro expõe apenas o CRUD determinístico da entidade suggestions.
*/

import express from 'express';
import {getSuggestions} from '../controllers/suggestionsController.js'


const router = express.Router();

router.get('/', getSuggestions);

export default router;