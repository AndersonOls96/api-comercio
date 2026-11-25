import { Router } from 'express';
import * as controller from '../controllers/tarefa.controller.js';
import { validarId } from './id.js';

const router = Router();
router.param('id', validarId);

router.get('/', controller.listar);
router.post('/', controller.validarTarefa, controller.criar);
router.get('/:id', controller.buscar);
router.patch('/:id', controller.validarTarefa, controller.atualizar);
router.delete('/:id', controller.remover);

export default router;
