import { Router } from 'express';
import * as controller from '../controller/categoria.controller.js';
import { validarId } from './id.js';

const router = Router();
router.param('id', validarId);

router.get('/', controller.listar);
router.post('/', controller.criar);
router.get('/:id', controller.buscar);
router.patch('/:id', controller.atualizar);
router.delete('/:id', controller.remover);

export default router;
