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
  login: () => Promise<boolean>;
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

const loadCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem('techcircuithub_cart');
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.reduce<CartItem[]>((items, value: unknown) => {
      if (!value || typeof value !== 'object') return items;
      const candidate = value as Partial<CartItem>;
      if (
        typeof candidate.projectId !== 'string' ||
        !candidate.projectId ||
        typeof candidate.title !== 'string' ||
        typeof candidate.price !== 'number' ||
        !Number.isFinite(candidate.price) ||
        (candidate.type !== 'digital' && candidate.type !== 'physical')
      ) return items;

      const quantity = typeof candidate.quantity === 'number' && Number.isFinite(candidate.quantity)
        ? Math.max(1, Math.floor(candidate.quantity))
        : 1;
      const existing = items.find((item) => item.projectId === candidate.projectId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        items.push({
          projectId: candidate.projectId,
          title: candidate.title,
          price: candidate.price,
          type: candidate.type,
          image: typeof candidate.image === 'string' ? candidate.image : undefined,
          quantity,
        });
      }
      return items;
    }, []);
  } catch {
    return [];
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>(loadCart);

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
    let authStateVersion = 0;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const version = ++authStateVersion;
      setLoading(true);
      setUser(currentUser);
      setProfile(null);
      if (currentUser) {
        try {
          const tokenResult = await currentUser.getIdTokenResult();
          let adminStatus = tokenResult.claims.admin === true;
          if (!adminStatus) {
            try {
              const adminMembership = await getDoc(doc(db, 'admins', currentUser.uid));
              adminStatus = adminMembership.exists();
            } catch (error) {
              if (version !== authStateVersion) return;
              console.warn('Could not verify administrator membership:', error);
            }
          }
          setIsAdmin(adminStatus);

          // Fetch user profile from Firestore with offline resilience
          const userDocRef = doc(db, 'users', currentUser.uid);
          let loadedProfile: UserProfile | null = null;

          try {
            const userSnap = await getDoc(userDocRef);
            if (version !== authStateVersion) return;
            if (userSnap.exists()) {
              loadedProfile = {
                ...userSnap.data(),
                role: adminStatus ? 'admin' : 'student',
              } as UserProfile;
              setProfile(loadedProfile);
              updateDoc(userDocRef, {
                lastLoginAt: new Date().toISOString(),
              }).catch(() => {});
            }
          } catch (err: any) {
            if (version !== authStateVersion) return;
            // Client is operating offline or still establishing connection
            console.warn('Firestore offline, using fallback auth profile:', err?.message || err);
          }

          if (!loadedProfile) {
            if (version !== authStateVersion) return;
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
            setDoc(userDocRef, fallbackProfile, { merge: true }).catch((err) => {
              console.warn('Failed to create student profile in Firestore:', err);
            });
          }

          if (version !== authStateVersion) return;
          logEvent('login');
        } catch (err) {
          if (version !== authStateVersion) return;
          console.warn('Auth state handler warning:', err);
        }
      } else {
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
    const authenticatedUser = await fbLoginWithEmail(username.trim().toLowerCase(), pass);
    let isAdminAccount = (await authenticatedUser.getIdTokenResult()).claims.admin === true;
    if (!isAdminAccount) {
      try {
        isAdminAccount = (await getDoc(doc(db, 'admins', authenticatedUser.uid))).exists();
      } catch (error) {
        await fbLogout();
        throw new Error(error instanceof Error
          ? `Could not verify administrator membership. Check the deployed Firestore rules. ${error.message}`
          : 'Could not verify administrator membership. Check the deployed Firestore rules.');
      }
    }
    if (!isAdminAccount) {
      await fbLogout();
      throw new Error('This Firebase account is not authorized for administrator access.');
    }

    setUser(authenticatedUser);
    setProfile({
      id: authenticatedUser.uid,
      email: authenticatedUser.email || '',
      displayName: authenticatedUser.displayName || 'Tech CircuitHub Admin',
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
      const result = await fbLogin();
      return !result.redirecting;
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
      onboarded: false,
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
        const fallbackProfile: UserProfile = {
          id: studentUser.uid,
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0],
          role: 'student',
          onboarded: false,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          interests: ['Embedded Systems', 'VLSI', 'PCB Design'],
        };
        localStorage.setItem('techcircuithub_student_session', JSON.stringify({
          ...fallbackProfile,
          uid: studentUser.uid,
        }));
        setProfile(fallbackProfile);
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
    if (!user) throw new Error('Sign in to save your student profile.');
    const nextProfile: UserProfile = {
      ...(profile || {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role: 'student',
        onboarded: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      }),
      ...data,
    };
    const localStudent = localStorage.getItem('techcircuithub_student_session');

    if (localStudent) {
      localStorage.setItem('techcircuithub_student_session', JSON.stringify({
        ...nextProfile,
        uid: user.uid,
      }));
    } else {
      await setDoc(
        doc(db, 'users', user.uid),
        { ...data, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    }

    setProfile(nextProfile);
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
