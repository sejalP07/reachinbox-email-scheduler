import "dotenv/config";

import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { verifySmtpConnection } from "./services/email-smtp.service.js";
import "./queues/email.worker.js";

const PORT = Number(process.env.PORT ?? 5000);

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Backend running on port ${PORT}`);
    });

    // SMTP should NOT prevent the API from starting.
    try {
      await verifySmtpConnection();
      console.log("✅ SMTP connection verified");
    } catch (error) {
      console.error(
        "⚠️ SMTP verification failed. Backend will continue running:",
        error,
      );
    }
  } catch (error) {
    console.error("❌ Failed to start backend:", error);

    process.exit(1);
  }
}

bootstrap();