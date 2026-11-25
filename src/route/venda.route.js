import { Router } from 'express';
import * as controller from '../controller/venda.controller.js';
import { validarId } from './id.js';

const router = Router();
router.param('id', validarId);

router.get('/', controller.listar);
router.post('/', controller.criar);
router.get('/:id', controller.buscar);

export default router;
