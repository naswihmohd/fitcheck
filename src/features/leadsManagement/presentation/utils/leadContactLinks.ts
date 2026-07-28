/** Digits only — for tel: and wa.me */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function getCallHref(phoneNumber?: string): string | null {
  const digits = digitsOnly(phoneNumber || '');
  if (!digits) return null;
  return `tel:+${digits}`;
}

export function getWhatsAppHref(whatsappNumber?: string): string | null {
  const digits = digitsOnly(whatsappNumber || '');
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export function getLinkHref(link?: string): string | null {
  const trimmed = (link || '').trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
