import "dotenv/config";

import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { verifySmtpConnection } from "./services/email-smtp.service.js";
import "./queues/email.worker.js";

const PORT = Number(process.env.PORT ?? 5000);

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();

    await verifySmtpConnection();

    app.listen(PORT, () => {
      console.log(
        `🚀 Backend running on http://localhost:${PORT}`,
      );
    });
  } catch (error) {
    console.error(
      "❌ Failed to start backend:",
      error,
    );

    process.exit(1);
  }
}

bootstrap();