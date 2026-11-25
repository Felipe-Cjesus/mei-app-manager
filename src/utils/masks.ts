// src/utils/masks.ts

/**
 * Remove todos os caracteres não numéricos.
 */
export function unmask(value: string): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

/**
 * Aplica máscara de CNPJ: 00.000.000/0000-00
 */
export function maskCnpj(value: string): string {
  if (!value) return '';
  const digits = unmask(value).slice(0, 14);

  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

/**
 * Aplica máscara de Referência (mês/ano): MM/AAAA
 */
export function maskReference(value: string): string {
  if (!value) return '';
  const digits = unmask(value).slice(0, 6);

  return digits.replace(/^(\d{2})(\d)/, '$1/$2');
}

/**
 * Aplica máscara de Data: DD/MM/AAAA
 */
export function maskDate(value: string): string {
  if (!value) return '';
  const digits = unmask(value).slice(0, 8);

  return digits
    .replace(/^(\d{2})(\d)/, '$1/$2')
    .replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
}

/**
 * Formata um valor enquanto o usuário digita no input para moeda brasileira: R$ 0,00
 * Exemplo:
 * "1"       -> "0,01"
 * "12"      -> "0,12"
 * "1234"    -> "12,34"
 * "123456"  -> "1.234,56"
 */
export function maskCurrency(value: string | number): string {
  if (value === null || value === undefined) return '';

  let numericString = typeof value === 'number'
    ? Math.round(value * 100).toString()
    : unmask(String(value));

  if (!numericString) return '';

  // Remove zeros à esquerda mantendo pelo menos 1
  numericString = numericString.replace(/^0+(?!$)/, '');
  if (numericString.length === 1) numericString = '0' + numericString;
  if (numericString.length === 2) numericString = '0' + numericString;

  const integerPart = numericString.slice(0, -2) || '0';
  const decimalPart = numericString.slice(-2);

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `R$ ${formattedInteger},${decimalPart}`;
}

/**
 * Converte uma string formatada em moeda ("R$ 1.234,56") de volta para número float (1234.56).
 */
export function currencyToNumber(value: string): number {
  if (!value) return 0;
  const digits = unmask(value);
  if (!digits) return 0;
  return parseFloat(digits) / 100;
}

