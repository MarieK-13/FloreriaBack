import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Celular peruano: 9 dígitos que empiezan en 9, con o sin +51 y espacios (igual que el backend). */
export const PERU_MOBILE = /^(\+?51)?[\s-]*9([\s-]*\d){8}$/;

/** No acepta un texto hecho solo de espacios. */
export const notBlank: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.length > 0 && control.value.trim() === ''
    ? { blank: true }
    : null;

/**
 * Validador de grupo: los dos campos deben ser iguales (contraseña y su confirmación).
 * Marca el error "passwordMismatch" en el grupo.
 */
export function fieldsMatch(field: string, confirmation: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const value = group.get(field)?.value;
    const repeated = group.get(confirmation)?.value;
    return value && repeated && value !== repeated ? { passwordMismatch: true } : null;
  };
}

/** Muestra +51987654321 como "+51 987 654 321". */
export function formatPeruMobile(phone: string | null | undefined): string {
  if (!phone) {
    return '';
  }
  const digits = phone.replace(/\D/g, '').replace(/^51(?=9\d{8}$)/, '');
  return digits.length === 9
    ? `+51 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    : phone;
}
