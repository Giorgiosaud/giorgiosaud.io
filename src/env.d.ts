/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="firebase-admin/auth" />
/// <reference types="firebaseui" />
interface ImportMetaEnv {
  readonly CLOUDINARY_API_KEY: string;
  readonly CLOUDINARY_API_SECRET: string;
  readonly FIREBASE_PRIVATE_KEY_ID: string;
  readonly FIREBASE_PRIVATE_KEY: string;
  readonly FIREBASE_PROJECT_ID: string;
  readonly FIREBASE_CLIENT_EMAIL: string;
  readonly FIREBASE_CLIENT_ID: string;
  readonly FIREBASE_AUTH_URI: string;
  readonly FIREBASE_TOKEN_URI: string;
  readonly FIREBASE_AUTH_CERT_URL: string;
  readonly FIREBASE_CLIENT_CERT_URL: string;
  readonly NOTEBOOK_PER_PAGE: number;
  readonly WEB_FORMS3_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user: UserRecord;
  }
}
declare namespace firebaseui {
  firebaseui
}
declare module 'firebaseui' {
  export * from 'firebaseui/dist/firebaseui.js';
}