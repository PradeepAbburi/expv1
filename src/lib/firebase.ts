import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC4jFJ3jCXd7Q5nydQaBSQWaVKvFhTkmJs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'expertene-59771.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'expertene-59771',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'expertene-59771.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '284086686035',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:284086686035:web:f7f79f6730d430db7091a6',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-0GQ6P1ML29',
};

const app = initializeApp(firebaseConfig);

// Analytics (optional – only runs in browser)
let analytics: ReturnType<typeof getAnalytics> | null = null;
try { analytics = getAnalytics(app); } catch { /* SSR / unsupported env */ }

export { analytics };
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(result.user, { displayName: name });
  return result;
};

export const signOut = () => firebaseSignOut(auth);
export { onAuthStateChanged, type User };

// ─── Firestore helpers ────────────────────────────────────────────────────────
export type CustomField = {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'number' | 'textarea';
};

export type ServiceRecord = {
  id: string;
  title: string;
  description: string;
  price: number;
  available_date: string;
  image_url: string;
  custom_fields?: CustomField[];
};

export type BookingRecord = {
  id: string;
  service_title: string;
  professional_name: string;
  service_date: string;
  time_slot?: string;
  custom_responses?: Record<string, string>;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
};

// Fallback in-memory records
const inMemoryServices: ServiceRecord[] = [];
const inMemoryBookings: BookingRecord[] = [];

export const fetchServices = async (): Promise<ServiceRecord[]> => {
  try {
    const q = query(collection(db, 'services'), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ServiceRecord));
    return list.length ? list : inMemoryServices;
  } catch (err) {
    console.warn('[Firebase] fetchServices offline fallback:', err);
    return inMemoryServices;
  }
};

export const addService = async (data: Omit<ServiceRecord, 'id'>): Promise<ServiceRecord> => {
  const tempId = `svc_${Date.now()}`;
  const localItem: ServiceRecord = { id: tempId, ...data };
  try {
    const ref = await addDoc(collection(db, 'services'), { ...data, created_at: serverTimestamp() });
    return { id: ref.id, ...data };
  } catch (err) {
    console.warn('[Firebase] addService offline fallback:', err);
    inMemoryServices.unshift(localItem);
    return localItem;
  }
};

export const fetchBookings = async (): Promise<BookingRecord[]> => {
  try {
    const q = query(collection(db, 'bookings'), orderBy('service_date', 'asc'));
    const snap = await getDocs(q);
    const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BookingRecord));
    return list.length ? list : inMemoryBookings;
  } catch (err) {
    console.warn('[Firebase] fetchBookings offline fallback:', err);
    return inMemoryBookings;
  }
};

export const addBooking = async (data: Omit<BookingRecord, 'id'>): Promise<BookingRecord> => {
  const tempId = `bkn_${Date.now()}`;
  const localItem: BookingRecord = { id: tempId, ...data };
  try {
    const ref = await addDoc(collection(db, 'bookings'), { ...data, created_at: serverTimestamp() });
    return { id: ref.id, ...data };
  } catch (err) {
    console.warn('[Firebase] addBooking offline fallback:', err);
    inMemoryBookings.push(localItem);
    return localItem;
  }
};
