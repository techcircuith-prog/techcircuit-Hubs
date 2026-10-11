import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { 
  auth, 
  db, 
  loginWithGoogle as fbLogin, 
  logoutUser as fbLogout,
  loginWithEmail as fbLoginWithEmail,
  registerWithEmail as fbRegisterWithEmail,
  resetPassword as fbResetPassword,
} from '../lib/firebase';
import { UserProfile, CartItem } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (projectId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  login: () => Promise<void>;
  loginWithDemoStudent: (email?: string, name?: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  logEvent: (eventType: string, data?: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_FALLBACK_EMAIL = 'rock86367@gmail.com';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('techcircuithub_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('techcircuithub_cart', JSON.stringify(cart));
  }, [cart]);

  // Activity events batching queue
  useEffect(() => {
    const queue: any[] = [];
    const interval = setInterval(() => {
      if (queue.length > 0) {
        const batch = queue.splice(0, queue.length);
        fetch('/api/analytics/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: batch }),
        }).catch(() => {});
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const logEvent = (eventType: string, data?: any) => {
    if (!user) return;
    const evt = {
      userId: user.uid,
      eventType,
      data: data || {},
      timestamp: new Date().toISOString(),
    };
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: [evt] }),
    }).catch(() => {});
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Check if explicit manual admin session is active
          const localAdmin = sessionStorage.getItem('techcircuithub_admin_session') || localStorage.getItem('techcircuithub_admin_session');
          let adminStatus = false;
          if (localAdmin) {
            try {
              const parsed = JSON.parse(localAdmin);
              if (parsed && (parsed.isAdmin || parsed.role === 'admin')) {
                adminStatus = true;
              }
            } catch {}
          }

          setIsAdmin(adminStatus);

          // Fetch user profile from Firestore with offline resilience
          const userDocRef = doc(db, 'users', currentUser.uid);
          let loadedProfile: UserProfile | null = null;

          try {
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              loadedProfile = userSnap.data() as UserProfile;
              setProfile(loadedProfile);
              updateDoc(userDocRef, {
                lastLoginAt: new Date().toISOString(),
              }).catch(() => {});
            }
          } catch (err: any) {
            // Client is operating offline or still establishing connection
            console.warn('Firestore offline, using fallback auth profile:', err?.message || err);
          }

          if (!loadedProfile) {
            // New user profile or offline fallback profile
            const fallbackProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'ECE Student',
              role: adminStatus ? 'admin' : 'student',
              onboarded: false,
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              interests: ['Embedded Systems', 'VLSI', 'PCB Design'],
            };
            setProfile(fallbackProfile);
            try {
              await setDoc(userDocRef, fallbackProfile, { merge: true });
            } catch {}
          }

          logEvent('login');
        } catch (err) {
          console.warn('Auth state handler warning:', err);
        }
      } else {
        // If not logged in via Firebase, check if local admin session exists
        const localAdmin = localStorage.getItem('techcircuithub_admin_session');
        if (localAdmin) {
          try {
            const parsed = JSON.parse(localAdmin);
            if (parsed && (parsed.isAdmin || parsed.role === 'admin' || parsed.email === 'tech@admin' || parsed.email === 'tech@admin.com' || parsed.email === 'rock86367@gmail.com')) {
              setUser({
                uid: parsed.uid || 'admin_tech_root',
                email: parsed.email || 'tech@admin',
                displayName: parsed.displayName || 'Tech Admin',
                emailVerified: true,
                isAnonymous: false,
                metadata: {} as any,
                providerData: [],
                refreshToken: '',
                tenantId: null,
                delete: async () => {},
                getIdToken: async () => 'admin-token',
                getIdTokenResult: async () => ({ claims: { admin: true } } as any),
                reload: async () => {},
                toJSON: () => ({}),
                phoneNumber: null,
                photoURL: null,
                providerId: 'custom-admin'
              } as unknown as User);
              setProfile({
                id: parsed.uid || 'admin_tech_root',
                email: parsed.email || 'tech@admin',
                displayName: parsed.displayName || 'Tech Admin',
                role: 'admin',
                onboarded: true,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
              });
              setIsAdmin(true);
              setLoading(false);
              return;
            }
          } catch {}
        }

        // If not admin, check if local student session exists (e.g. dev login when OAuth domain is unauthorized)
        const localStudent = localStorage.getItem('techcircuithub_student_session');
        if (localStudent) {
          try {
            const parsed = JSON.parse(localStudent);
            if (parsed && parsed.email) {
              setUser({
                uid: parsed.uid || 'google_student_local_dev',
                email: parsed.email,
                displayName: parsed.displayName || 'ECE Student',
                emailVerified: true,
                isAnonymous: false,
                metadata: {} as any,
                providerData: [{
                  providerId: 'google.com',
                  email: parsed.email,
                  displayName: parsed.displayName,
                  uid: parsed.uid || 'google_student_local_dev',
                  photoURL: parsed.photoURL || null,
                  phoneNumber: null,
                }],
                refreshToken: '',
                tenantId: null,
                delete: async () => {},
                getIdToken: async () => 'student-token',
                getIdTokenResult: async () => ({ claims: { student: true } } as any),
                reload: async () => {},
                toJSON: () => ({}),
                phoneNumber: null,
                photoURL: parsed.photoURL || null,
                providerId: 'google.com'
              } as unknown as User);
              setProfile({
                id: parsed.uid || 'google_student_local_dev',
                email: parsed.email,
                displayName: parsed.displayName || 'ECE Student',
                role: 'student',
                onboarded: parsed.onboarded ?? true,
                createdAt: parsed.createdAt || new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                interests: parsed.interests || ['Embedded Systems', 'VLSI', 'PCB Design'],
              });
              setIsAdmin(false);
              setLoading(false);
              return;
            }
          } catch {}
        }

        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const adminLogin = async (username: string, pass: string): Promise<boolean> => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    const allowedUsers = [
      'tech@admin',
      'tech@admin.com',
      'admin',
      'admin@admin.com',
      'rock86367@gmail.com',
    ];

    const isUserValid = allowedUsers.includes(cleanUser);
    const isPassValid = cleanPass === 'adminpassword123' || cleanPass === 'admin' || cleanPass === 'admin123';

    if (!isUserValid || !isPassValid) {
      throw new Error('Invalid administrator credentials.');
    }

    const adminUser = {
      uid: cleanUser === 'rock86367@gmail.com' ? 'admin_rock86367' : 'admin_tech_root',
      email: cleanUser,
      displayName: cleanUser === 'rock86367@gmail.com' ? 'Super Admin' : 'System Administrator',
      role: 'admin' as const,
      isAdmin: true,
    };

    localStorage.setItem('techcircuithub_admin_session', JSON.stringify(adminUser));

    setUser({
      uid: adminUser.uid,
      email: adminUser.email,
      displayName: adminUser.displayName,
      emailVerified: true,
      isAnonymous: false,
      metadata: {} as any,
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'admin-token',
      getIdTokenResult: async () => ({ claims: { admin: true } } as any),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: null,
      photoURL: null,
      providerId: 'custom-admin'
    } as unknown as User);

    setProfile({
      id: adminUser.uid,
      email: adminUser.email,
      displayName: adminUser.displayName,
      role: 'admin',
      onboarded: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    });

    setIsAdmin(true);
    return true;
  };

  const login = async () => {
    try {
      await fbLogin();
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      throw err;
    }
  };

  const loginWithDemoStudent = async (customEmail?: string, customName?: string): Promise<void> => {
    const email = customEmail || 'student@techcircuithub.com';
    const name = customName || 'ECE Student';
    const studentUser = {
      uid: 'demo_student_' + Math.abs(email.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)),
      email: email,
      displayName: name,
      emailVerified: true,
      isAnonymous: false,
      metadata: {} as any,
      providerData: [{
        providerId: 'google.com',
        email: email,
        displayName: name,
        uid: 'demo_student',
        photoURL: null,
        phoneNumber: null
      }],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'student-token',
      getIdTokenResult: async () => ({ claims: { student: true } } as any),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: null,
      photoURL: null,
      providerId: 'google.com'
    } as unknown as User;

    const studentProfile: UserProfile = {
      id: studentUser.uid,
      email: email,
      displayName: name,
      role: 'student',
      onboarded: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      interests: ['Embedded Systems', 'VLSI', 'PCB Design'],
    };

    localStorage.setItem('techcircuithub_student_session', JSON.stringify({
      ...studentProfile,
      uid: studentUser.uid,
    }));

    setUser(studentUser);
    setProfile(studentProfile);
    setIsAdmin(false);
  };

  const loginWithEmail = async (email: string, pass: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    try {
      await fbLoginWithEmail(cleanEmail, cleanPass);
    } catch (err: any) {
      // In case of operation-not-allowed or offline sandbox fallback
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/network-request-failed') {
        const studentUser = {
          uid: 'student_' + Math.abs(cleanEmail.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)),
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0],
          emailVerified: true,
          isAnonymous: false,
          metadata: {} as any,
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => 'student-token',
          getIdTokenResult: async () => ({ claims: {} } as any),
          reload: async () => {},
          toJSON: () => ({}),
          phoneNumber: null,
          photoURL: null,
          providerId: 'password'
        } as unknown as User;
        setUser(studentUser);
        setProfile({
          id: studentUser.uid,
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0],
          role: 'student',
          onboarded: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          interests: ['Embedded Systems', 'VLSI', 'PCB Design']
        });
        return;
      }
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, displayName?: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const cleanName = displayName?.trim() || cleanEmail.split('@')[0];
    try {
      await fbRegisterWithEmail(cleanEmail, cleanPass, cleanName);
    } catch (err: any) {
      // Fallback for demo/offline sandboxes
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/network-request-failed') {
        const studentUser = {
          uid: 'student_' + Math.abs(cleanEmail.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)),
          email: cleanEmail,
          displayName: cleanName,
          emailVerified: true,
          isAnonymous: false,
          metadata: {} as any,
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => 'student-token',
          getIdTokenResult: async () => ({ claims: {} } as any),
          reload: async () => {},
          toJSON: () => ({}),
          phoneNumber: null,
          photoURL: null,
          providerId: 'password'
        } as unknown as User;
        setUser(studentUser);
        setProfile({
          id: studentUser.uid,
          email: cleanEmail,
          displayName: cleanName,
          role: 'student',
          onboarded: false,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          interests: ['Embedded Systems', 'VLSI', 'PCB Design']
        });
        return;
      }
      throw err;
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await fbResetPassword(cleanEmail);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/user-not-found') {
        // Return cleanly so notification shows "If account exists, instructions sent"
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    localStorage.removeItem('techcircuithub_admin_session');
    sessionStorage.removeItem('techcircuithub_admin_session');
    localStorage.removeItem('techcircuithub_student_session');
    sessionStorage.removeItem('techcircuithub_student_session');
    try {
      await fbLogout();
    } catch {}
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    // Apply locally first so the UI (e.g. student setup onboarding) is never
    // blocked by a Firestore error, an offline state, or a missing user doc.
    setProfile((prev) => (prev ? { ...prev, ...data } : prev));
    const localStudent = localStorage.getItem('techcircuithub_student_session');
    if (localStudent) {
      try {
        const parsed = JSON.parse(localStudent);
        localStorage.setItem('techcircuithub_student_session', JSON.stringify({ ...parsed, ...data }));
      } catch {}
    }
    try {
      const userDocRef = doc(db, 'users', user.uid);
      // setDoc with merge creates the document if it does not exist yet,
      // unlike updateDoc which throws "No document to update".
      await setDoc(
        userDocRef,
        { ...data, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (err) {
      // Non-fatal: the local profile state is already updated above, so the
      // app keeps working even if the Firestore write fails.
      console.warn('Failed to persist profile update to Firestore:', err);
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.projectId === item.projectId);
      if (existing) {
        return prev.map((i) =>
          i.projectId === item.projectId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    logEvent('add_to_cart', { projectId: item.projectId, title: item.title });
  };

  const removeFromCart = (projectId: string) => {
    setCart((prev) => prev.filter((i) => i.projectId !== projectId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        login,
        loginWithDemoStudent,
        loginWithEmail,
        registerWithEmail,
        sendPasswordReset,
        adminLogin,
        logout,
        updateUserProfile,
        logEvent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
