/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly RESEND_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
