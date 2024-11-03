import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    getAuth
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

export class AuthService {
    constructor() {
        this.auth = getAuth();
        this.authStateChanged = new Set();
    }

    getCurrentUser() {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(this.auth, (user) => {
                unsubscribe();
                resolve(user);
            });
        });
    }

    onAuthStateChanged(callback) {
        onAuthStateChanged(this.auth, (user) => {
            callback(user);
        });
    }

    async register(email, password) {
        try {
            return await createUserWithEmailAndPassword(this.auth, email, password);
        } catch (error) {
            throw new Error(`Registration error: ${error.message}`);
        }
    }

    async login(email, password) {
        try {
            return await signInWithEmailAndPassword(this.auth, email, password);
        } catch (error) {
            throw new Error(`Login error: ${error.message}`);
        }
    }

    async logout() {
        try {
            await signOut(this.auth);
        } catch (error) {
            throw new Error(`Logout error: ${error.message}`);
        }
    }
}