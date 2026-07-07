import express from "express";
import cors from "cors";
import authRoute from "./routes/authRoute.js";
import adminRoute from "./routes/adminRoute.js";
import postRoute from "./routes/postRoute.js";
import commentRoute from "./routes/commentRoute.js";
import bookmarkRoute from "./routes/bookmarkRoute.js";
import likeRoute from "./routes/likeRoute.js";
import reblogRoute from "./routes/reblogRoute.js";
import tagRoute from "./routes/tagRoute.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(cookieParser());

// Serve static uploads locally only (Vercel uses ephemeral /tmp storage)
if (!process.env.VERCEL) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

const parseOrigins = (value) => {
  if (!value) return [];
  return value.split(",").map((origin) => origin.trim()).filter(Boolean);
};

const allowedOrigins = [
  ...parseOrigins(process.env.CORS_ORIGIN),
  ...parseOrigins(process.env.CORS_ORIGINS),
  "http://localhost:5173",
  "http://localhost:3000",
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  // Allow Vercel preview URLs for this project (e.g. software-testing-finals-xvio-lilac.vercel.app)
  const vercelPrefix = process.env.CORS_VERCEL_PREFIX || "software-testing-finals";
  if (
    origin.startsWith(`https://${vercelPrefix}`) &&
    origin.endsWith(".vercel.app")
  ) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      console.warn(`Blocked CORS origin: ${origin}`);
      callback(null, false);
    },
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
app.use("/api", reblogRoute);
app.use("/api", tagRoute);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
