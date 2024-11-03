// src/js/services/user-service.js
import { getFirestore, doc, setDoc, getDoc, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

export class UserService {
    constructor() {
        this.db = getFirestore();
        this.usersCollection = collection(this.db, 'users');
    }


    async createUser(uid, email, nickname) {
        console.log("Creating user with:", { uid, email, nickname }); // Dodaj ten log
        try {
            const nicknameExists = await this.checkNicknameExists(nickname);
            console.log("Nickname exists check in createUser:", nicknameExists); // Dodaj ten log

            if (nicknameExists) {
                throw new Error('Ten nickname jest już zajęty');
            }

            const userRef = doc(this.db, 'users', uid);
            await setDoc(userRef, {
                email: email,
                nickname: nickname,
                createdAt: new Date().toISOString()
            });
            console.log("User data saved successfully"); // Dodaj ten log
        } catch (error) {
            console.error("Error creating user:", error);
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