// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
// import { auth, db } from "../../../firebaseConfig";
// import type { UserProps } from "../../superAdminBranches/data/userTypes";

// interface CreateAdminParams {
//   email: string;
//   password: string;
// }

// interface CreateAdminResult {
//   success: boolean;
//   message: string;
//   userId?: string;
// }

// export async function createAdmin(params: CreateAdminParams): Promise<CreateAdminResult> {
//   const { email, password } = params;

//   try {
//     // Validate email format
//     const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
//     if (!emailRegex.test(email)) {
//       return {
//         success: false,
//         message: "Invalid email format",
//       };
//     }

//     // Validate password length (Firebase requires minimum 6 characters)
//     if (password.length < 6) {
//       return {
//         success: false,
//         message: "Password must be at least 6 characters long",
//       };
//     }

//     console.log("🔧 [DEV] Creating admin user...");
//     console.log("📧 Email:", email);

//     // Create Firebase Auth user
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     const userId = userCredential.user.uid;

//     console.log("✅ Firebase Auth user created:", userId);

//     // Create Firestore user document in "users" collection
//     const userDocRef = doc(db, "users", userId);
//     const userData: UserProps = {
//       id: userId, // Set id to match the document ID
//       branchId: null,
//       email,
//       role: "admin",
//       createdAt: serverTimestamp() as Timestamp, // Firestore server timestamp
//     };

//     await setDoc(userDocRef, userData);

//     console.log("✅ Firestore user document created");
//     console.log("🎉 Admin created successfully!");

//     return {
//       success: true,
//       message: "Admin created successfully",
//       userId,
//     };
//   } catch (error: any) {
//     console.error("❌ Error creating admin:", error);

//     let errorMessage = "Failed to create admin";

//     if (error.code) {
//       switch (error.code) {
//         case "auth/email-already-in-use":
//           errorMessage = "Email is already registered";
//           break;
//         case "auth/invalid-email":
//           errorMessage = "Invalid email address";
//           break;
//         case "auth/weak-password":
//           errorMessage = "Password is too weak";
//           break;
//         case "auth/operation-not-allowed":
//           errorMessage = "Email/password accounts are not enabled";
//           break;
//         default:
//           errorMessage = `Firebase error: ${error.code}`;
//       }
//     } else if (error.message) {
//       errorMessage = error.message;
//     }

//     return {
//       success: false,
//       message: errorMessage,
//     };
//   }
// }