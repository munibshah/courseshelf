function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
    publishableKey: string;
  };
  cloudflare: {
    accountId: string;
    r2: {
      accessKeyId: string;
      secretAccessKey: string;
      bucketName: string;
    };
    stream: {
      apiToken: string;
    };
  };
  resend: {
    apiKey: string;
  };
  app: {
    url: string;
  };
}

export function getConfig(): AppConfig {
  return {
    supabase: {
      url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      anonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    },
    stripe: {
      secretKey: requireEnv("STRIPE_SECRET_KEY"),
      webhookSecret: requireEnv("STRIPE_WEBHOOK_SECRET"),
      publishableKey: requireEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
    },
    cloudflare: {
      accountId: requireEnv("CLOUDFLARE_ACCOUNT_ID"),
      r2: {
        accessKeyId: requireEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
        bucketName: requireEnv("CLOUDFLARE_R2_BUCKET_NAME"),
      },
      stream: {
        apiToken: requireEnv("CLOUDFLARE_STREAM_API_TOKEN"),
      },
    },
    resend: {
      apiKey: requireEnv("RESEND_API_KEY"),
    },
    app: {
      url: requireEnv("NEXT_PUBLIC_APP_URL"),
    },
  };
}
