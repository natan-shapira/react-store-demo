/// <reference types="vite/client" />

// Removes Vite's catch-all `any` index, so an unknown or misspelled env key is a type error
interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
