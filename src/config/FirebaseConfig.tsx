import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';



const firebaseConfig = {
  apiKey: "AIzaSyCAdrH9VGhulFPOKUmSIPCEQ0ArpR1O5z0",
  authDomain: "bloomx-850eb.firebaseapp.com",
  databaseURL: "https://bloomx-850eb-default-rtdb.firebaseio.com",
  projectId: "bloomx-850eb",
  storageBucket: "bloomx-850eb.appspot.com",
  messagingSenderId: "922528344793",
  appId: "1:922528344793:web:f707e54c256d12b8212cc8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });

export const database = getDatabase(app);