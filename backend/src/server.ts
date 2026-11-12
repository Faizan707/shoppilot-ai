import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

async function bootstrap() {
  await connectDB();
  const app = createApp();

  app.listen(env.port, () => {
    console.log(`ShopPilot AI API running on port ${env.port} [${env.nodeEnv}]`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
