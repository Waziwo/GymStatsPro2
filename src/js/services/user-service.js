// src/js/services/user-service.js
import { getFirestore, doc, setDoc, getDoc, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

export class UserService {
    constructor() {
        this.db = getFirestore();
        this.usersCollection = collection(this.db, 'users');
    }

    async createUser(uid, email, nickname) {
        try {
            // Sprawdź czy nickname jest już zajęty
            const nicknameExists = await this.checkNicknameExists(nickname);
            if (nicknameExists) {
                throw new Error('Ten nickname jest już zajęty');
            }

            // Jeśli nickname jest wolny, utwórz nowego użytkownika
            await setDoc(doc(this.db, 'users', uid), {
                email,
                nickname,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            throw error;
        }
    }

    async checkNicknameExists(nickname) {
        try {
            const q = query(this.usersCollection, where("nickname", "==", nickname));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            throw error;
        }
    }

    async getUserData(userId) {
        try {
            const userDoc = await getDoc(doc(this.db, "users", userId));
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error("Error fetching user data:", error);
            throw error;
        }
    }
}