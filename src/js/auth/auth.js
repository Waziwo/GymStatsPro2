import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

export class AuthService {
    constructor() {
        this.auth = getAuth();
    }

    async register(email, password) {
        try {
            await createUserWithEmailAndPassword(this.auth, email, password);
        } catch (error) {
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
}