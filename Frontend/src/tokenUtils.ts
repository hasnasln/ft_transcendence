import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { _apiManager } from './api/APIManeger';


export interface User {
  uuid: string;
  username: string;
  email?: string;    // eğer kayıtta saklıyorsanız
  name?: string;
  surname?: string;
}


// Geliştirme amaçlı gizli anahtar (prod ortamında sunucuda saklanmalı)
const JWT_SECRET = 'DUMMY_SECRET_KEY_FOR_DEV_ONLY';
// TextEncoder ile Uint8Array olarak tutulacak anahtar
const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Geliştirme amaçlı JWT oluşturur.
 * @param payload – Token içine koymak istediğiniz obje
 * @returns Promise<string> - imzalanmış JWT
 */
export async function generateDevToken(payload: object): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 30 * 24 * 60 * 60; // 30 gün (saniye cinsinden)

  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresIn)
    .sign(secretKey);
}

/**
 * Geliştirme ortamında gelen JWT’yi doğrular.
 * @param token – doğrulanacak JWT
 * @returns Promise<JWTPayload | null> - çözülmüş payload veya null
 */
export async function verifyDevToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}



export async function checkCurrentUser(): Promise<User | null> {
  const token = _apiManager.getToken();
  if (!token) {
    console.warn('Kullanıcı henüz giriş yapmamış.');
    return null;
  }

  const payload = await verifyDevToken(token);
  if (!payload) {
    console.warn('Token geçersiz veya süresi dolmuş.');
    // İsterseniz oturumu sonlandırın:
    // await _apiManager.logout();
    return null;
  }

  console.log('Doğrulanmış payload:', payload);
  return payload.user as User;  // burada payload içindeki user objesi
}
