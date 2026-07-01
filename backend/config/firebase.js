import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

let auth = null;

// Only initialize Firebase if credentials are provided
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    auth = admin.auth();
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase:", error.message);
  }
} else {
  console.warn(
    "FIREBASE_SERVICE_ACCOUNT not found in .env. Firebase features will be disabled.",
  );
}

export { auth };
