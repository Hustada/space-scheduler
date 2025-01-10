import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const MISSIONS_COLLECTION = 'missions';

export function useMissions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to missions
  useEffect(() => {
    console.log('Setting up missions listener...');
    setLoading(true);
    setError(null);

    try {
      console.log('Creating Firestore query...');
      const missionsRef = collection(db, MISSIONS_COLLECTION);
      const q = query(missionsRef, orderBy('created_at', 'desc'));

      console.log('Setting up snapshot listener...');
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('Received Firestore snapshot:', snapshot.size, 'documents');
          const missionData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              created_at: data.created_at?.toDate(),
              started_at: data.started_at?.toDate(),
              completed_at: data.completed_at?.toDate(),
            };
          });
          console.log('Processed mission data:', missionData);
          setMissions(missionData);
          setLoading(false);
        }, 
        (err) => {
          console.error('Firestore snapshot error:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => {
        console.log('Cleaning up missions listener...');
        unsubscribe();
      };
    } catch (err) {
      console.error('Error in missions setup:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const createMission = async (missionData) => {
    try {
      const docRef = await addDoc(collection(db, MISSIONS_COLLECTION), {
        ...missionData,
        created_at: serverTimestamp(),
        status: 'pending'
      });
      return { id: docRef.id, ...missionData };
    } catch (err) {
      console.error('Error creating mission:', err);
      setError(err);
      throw err;
    }
  };

  const startMission = async (missionId) => {
    try {
      // Check if any mission is in progress
      const hasActiveMission = missions.some(m => m.status === 'in-progress');
      if (hasActiveMission) {
        throw new Error('Another mission is already in progress');
      }

      const missionRef = doc(db, MISSIONS_COLLECTION, missionId);
      await updateDoc(missionRef, {
        status: 'in-progress',
        started_at: serverTimestamp()
      });
    } catch (err) {
      console.error('Error starting mission:', err);
      setError(err);
      throw err;
    }
  };

  const completeMission = async (missionId) => {
    try {
      const missionRef = doc(db, MISSIONS_COLLECTION, missionId);
      await updateDoc(missionRef, {
        status: 'complete',
        completed_at: serverTimestamp()
      });
    } catch (err) {
      console.error('Error completing mission:', err);
      setError(err);
      throw err;
    }
  };

  const revertMission = async (missionId) => {
    try {
      const missionRef = doc(db, MISSIONS_COLLECTION, missionId);
      await updateDoc(missionRef, {
        status: 'pending',
        started_at: null,
        completed_at: null
      });
    } catch (err) {
      console.error('Error reverting mission:', err);
      setError(err);
      throw err;
    }
  };

  return {
    missions,
    loading,
    error,
    createMission,
    startMission,
    completeMission,
    revertMission
  };
}
