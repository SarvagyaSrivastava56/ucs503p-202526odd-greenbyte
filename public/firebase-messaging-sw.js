// This file intentionally left blank. It's needed for Firebase Cloud Messaging.
// In a real app, you would add logic here to handle background notifications.
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging/sw';

// This config will be replaced by the Firebase SDK with your project's config.
const firebaseConfig = {
    apiKey: "AIzaSyCPACZkQcMW9PxX5mkXm-wsYBlukOMAPIk",
    authDomain: "studio-827010330-91b76.firebaseapp.com",
    projectId: "studio-827010330-91b76",
    storageBucket: "studio-827010330-91b76.appspot.com",
    messagingSenderId: "271282670485",
    appId: "1:271282670485:web:49c4913d9655adfa55c49c"
};
  
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
