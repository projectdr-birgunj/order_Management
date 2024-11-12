const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DB_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MSG_SNDR_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASURE_ID,
};
export default firebaseConfig;
