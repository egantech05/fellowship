export const SERVICE_UUID         = '12345678-1234-5678-1234-56789abcdef0';
export const CHAR_UUID_APP_TAG    = '12345678-1234-5678-1234-56789abcdef2';
export const CHAR_UUID_USER_UUID  = '12345678-1234-5678-1234-56789abcdef3';

// immutable “magic value” proving the other app is OUR app
export const APP_TAG = 'FELLOWSHIP_V1';

export function toBase64Utf8(str){ return Buffer.from(str, 'utf8').toString('base64'); }
export function fromBase64Utf8(b64){ return Buffer.from(b64, 'base64').toString('utf8'); }
