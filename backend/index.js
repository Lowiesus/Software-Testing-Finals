import express from "express";
import cors from "cors";
import authRoute from "./routes/authRoute.js";
import adminRoute from "./routes/adminRoute.js";
import postRoute from "./routes/postRoute.js";
import commentRoute from "./routes/commentRoute.js";
import bookmarkRoute from "./routes/bookmarkRoute.js";
import likeRoute from "./routes/likeRoute.js";
import tagRoute from "./routes/tagRoute.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(cookieParser());

// Serve static files from uploads directory (MUST be before routes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  }),
);

app.get("/ping", (req, res) => res.json({ message: "pong" }));

app.post("/test-google-login", (req, res) => {
  res.json({ message: "Google login endpoint is working" });
});

app.use("/admin", adminRoute);
app.use("/authentication", authRoute);
app.use("/api", postRoute);
app.use("/api", commentRoute);
app.use("/api", bookmarkRoute);
app.use("/api", likeRoute);
app.use("/api", tagRoute);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
