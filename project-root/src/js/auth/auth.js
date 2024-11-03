import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

export class AuthService {
    constructor(auth) {
        this.auth = auth;
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