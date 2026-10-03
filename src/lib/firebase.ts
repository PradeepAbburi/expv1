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
  apiKey: 'AIzaSyC4jFJ3jCXd7Q5nydQaBSQWaVKvFhTkmJs',
  authDomain: 'expertene-59771.firebaseapp.com',
  projectId: 'expertene-59771',
  storageBucket: 'expertene-59771.firebasestorage.app',
  messagingSenderId: '284086686035',
  appId: '1:284086686035:web:f7f79f6730d430db7091a6',
  measurementId: 'G-0GQ6P1ML29',
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

export const fetchServices = async (): Promise<ServiceRecord[]> => {
  const q = query(collection(db, 'services'), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ServiceRecord));
};

export const addService = async (data: Omit<ServiceRecord, 'id'>): Promise<ServiceRecord> => {
  const ref = await addDoc(collection(db, 'services'), { ...data, created_at: serverTimestamp() });
  return { id: ref.id, ...data };
};

export const fetchBookings = async (): Promise<BookingRecord[]> => {
  const q = query(collection(db, 'bookings'), orderBy('service_date', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BookingRecord));
};

export const addBooking = async (data: Omit<BookingRecord, 'id'>): Promise<BookingRecord> => {
  const ref = await addDoc(collection(db, 'bookings'), { ...data, created_at: serverTimestamp() });
  return { id: ref.id, ...data };
};
