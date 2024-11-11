import { 
    collection,
    doc, 
    setDoc, 
    getDoc,
    query,
    where,
    getDocs
}  from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';
import { db } from '../config/FirebaseInit.js';

export class UserService {
    constructor() {
        this.db = db;
        this.usersCollection = collection(this.db, 'users');
    }

    async createUser(uid, email, nickname) {
        try {
            const nicknameExists = await this.checkNicknameExists(nickname);
    
            if (nicknameExists) {
                throw new Error('Ten nickname jest już zajęty');
            }
    
            const userRef = doc(this.db, 'users', uid);
            await setDoc(userRef, {
                email: email,
                nickname: nickname,
                createdAt: new Date().toISOString()
            });
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