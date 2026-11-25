export const MAX_INTEIRO = 2147483647;

export function inteiroPositivo(valor) {
  return Number.isInteger(valor) && valor > 0 && valor <= MAX_INTEIRO;
}

export function objeto(valor) {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}

export function validarCampos(body, regras, parcial = false) {
  if (!objeto(body)) return null;

  const campos = Object.keys(body);
  if (!campos.length || campos.some((campo) => !Object.hasOwn(regras, campo))) return null;
  if (!parcial && campos.length !== Object.keys(regras).length) return null;

  const valores = {};
  for (const campo of campos) {
    const valor = typeof body[campo] === 'string' ? body[campo].trim() : body[campo];
    if (!regras[campo](valor)) return null;
    valores[campo] = valor;
  }
  return valores;
}

export function nomeValido(valor) {
  return typeof valor === 'string' && valor.length > 0 && [...valor].length <= 120 && !valor.includes('\0');
}
