/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly RESEND_API_KEY: string;
  readonly TWILIO_ACCOUNT_SID: string;
  readonly TWILIO_AUTH_TOKEN: string;
  readonly TWILIO_PHONE_NUMBER: string;
  readonly ADMIN_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
