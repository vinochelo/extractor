import admin from "firebase-admin";

// This is a lazy initialization of the Firebase Admin SDK.
// It will only be initialized once per server instance.
if (!admin.apps.length) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Firebase Admin SDK environment variables are not set. Required: NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        // When using environment variables, the private key's newlines are often escaped.
        // This replaces the escaped newlines with actual newline characters.
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error("Firebase admin initialization error", error);
    // In a serverless environment like Vercel, this might not be a fatal error
    // if admin features are not used on every request.
    // We log it but allow the app to continue running.
  }
}

// Export the initialized services.
// Note: These will throw an error if accessed but initialization failed.
// The code using them should be prepared to handle this case if needed.
export const firestoreAdmin = admin.firestore();
export const authAdmin = admin.auth();
