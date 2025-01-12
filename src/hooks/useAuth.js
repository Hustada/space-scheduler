import { useState, useEffect } from 'react';
import { 
  getAuth, 
  signInAnonymously,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  setDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    console.log('🚀 Initializing auth...', {
      currentUser: auth.currentUser,
      persistence: browserLocalPersistence
    });

    // Set persistence immediately
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('✅ Persistence set successfully');
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log('👤 Auth state changed:', {
            userId: user?.uid,
            isAnonymous: user?.isAnonymous,
            email: user?.email,
            emailVerified: user?.emailVerified
          });

          setUser(user);
          setLoading(false);
          
          // Only sign in anonymously if there's no user at all
          if (!user) {
            console.log('🔑 No user found, signing in anonymously...');
            signInAnonymously(auth)
              .then(() => console.log('✅ Anonymous sign-in successful'))
              .catch(error => {
                console.error('❌ Anonymous sign-in failed:', error);
                setError(error.message);
              });
          }
        }, (error) => {
          console.error('❌ Auth state change error:', error);
          setError(error);
          setLoading(false);
        });

        // Check for email sign-in links on load
        if (isSignInWithEmailLink(auth, window.location.href)) {
          console.log('🔗 Found email sign-in link');
          const email = window.localStorage.getItem('emailForSignIn');
          if (email) {
            console.log('📧 Found stored email:', email);
            signInWithEmailLink(auth, email, window.location.href)
              .then((result) => {
                console.log('✅ Email link sign-in successful:', {
                  userId: result.user.uid,
                  email: result.user.email
                });
                window.localStorage.removeItem('emailForSignIn');
                addToEmailList(email, result.user.uid);
              })
              .catch((error) => {
                console.error('❌ Email link sign-in failed:', error);
                setError(error.message);
              });
          } else {
            console.warn('⚠️ No email found in storage for sign-in link');
          }
        }

        return () => {
          console.log('🧹 Cleaning up auth listener');
          unsubscribe();
        };
      })
      .catch((error) => {
        console.error('❌ Error setting persistence:', error);
      });
  }, [auth]);

  const addToEmailList = async (email, userId) => {
    console.log('📝 Adding to email list:', { email, userId });
    try {
      await setDoc(doc(db, 'email_list', email.toLowerCase()), {
        email: email.toLowerCase(),
        userId,
        subscribed: true,
        subscribedAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        preferences: {
          marketing: true,
          updates: true,
          features: true
        }
      }, { merge: true });
      console.log('✅ Added to email list successfully');
    } catch (error) {
      console.error('❌ Error adding to email list:', error);
    }
  };

  const convertToPermamentAccount = async (email, subscribeToUpdates = true) => {
    console.log('🔄 Converting to permanent account:', {
      email,
      currentUser: auth.currentUser?.uid,
      isAnonymous: auth.currentUser?.isAnonymous
    });

    if (!auth.currentUser?.isAnonymous) {
      console.error('❌ Cannot convert: user is not anonymous');
      throw new Error('User is not anonymous');
    }

    try {
      setError(null);
      const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      console.log('✅ Sign-in link sent successfully');
      
      // Save email for sign-in completion
      window.localStorage.setItem('emailForSignIn', email);
      console.log('💾 Email saved to local storage');

      // Add to email list immediately if they opted in
      if (subscribeToUpdates) {
        await addToEmailList(email, auth.currentUser.uid);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error converting account:', error);
      setError(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('👋 Signing out current user:', auth.currentUser?.uid);
    try {
      setError(null);
      await firebaseSignOut(auth);
      console.log('✅ Sign out successful');
      
      // Auto sign-in anonymously after sign-out
      console.log('🔑 Creating new anonymous session...');
      await signInAnonymously(auth);
      console.log('✅ Anonymous sign-in successful');
    } catch (error) {
      console.error('❌ Error during sign out:', error);
      setError(error.message);
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    signOut,
    convertToPermamentAccount,
    isAnonymous: user?.isAnonymous ?? true
  };
}
