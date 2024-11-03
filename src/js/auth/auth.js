import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

export class AuthService {
    constructor() {
        this.auth = getAuth();
    }

    async register(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            console.log("User credential from register:", userCredential); // dodaj log
            return userCredential; // upewnij się, że zwracasz userCredential
        } catch (error) {
            console.error("Auth registration error:", error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            return await signInWithEmailAndPassword(this.auth, email, password);
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            await signOut(this.auth);
        } catch (error) {
            throw error;
        }
    }

    async getCurrentUser() {
        return this.auth.currentUser;
    }

    onAuthStateChanged(callback) {
        this.auth.onAuthStateChanged(callback);
    }

    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(this.auth, email);
        } catch (error) {
            throw error;
        }
    }
}