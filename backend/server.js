import dotenv from "dotenv";
dotenv.config();

import { connectToDatabase } from "./config/database.js";
import app from "./index.js";
import { seedAdmin } from "./controllers/adminController.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectToDatabase();
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start: ", error);
  }
}

startServer();
