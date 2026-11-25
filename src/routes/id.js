export function validarId(req, res, next, value) {
  const id = Number(value);
  if (!/^[1-9]\d*$/.test(value) || id > 2147483647) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }
  req.recursoId = id;
  next();
}
