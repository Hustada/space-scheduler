import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  where,
  getDocs,
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

const MISSIONS_COLLECTION = 'missions';

export function useMissions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Listen for missions for the current user
  useEffect(() => {
    if (!user) {
      console.log('No user found, skipping mission load');
      return;
    }

    console.log('🔄 Loading missions for user:', {
      userId: user.uid,
      isAnonymous: user.isAnonymous
    });

    try {
      const missionsQuery = query(
        collection(db, 'missions'),
        where('userId', '==', user.uid),
        orderBy('created_at', 'desc')
      );

      console.log('📊 Query created successfully');

      const unsubscribe = onSnapshot(missionsQuery, 
        (snapshot) => {
          console.log('📥 Received Firestore snapshot:', {
            size: snapshot.size,
            empty: snapshot.empty
          });

          const missionList = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              created_at: data.created_at?.toDate(),
              updated_at: data.updated_at?.toDate(),
              started_at: data.started_at?.toDate(),
              completed_at: data.completed_at?.toDate()
            };
          });

          console.log('📋 Processed missions:', {
            count: missionList.length,
            missions: missionList.map(m => ({
              id: m.id,
              title: m.title,
              created_at: m.created_at
            }))
          });

          setMissions(missionList);
          setLoading(false);
        },
        (err) => {
          console.error('❌ Error in mission snapshot:', err);
          setError(err);
          setLoading(false);
        }
      );

      return () => {
        console.log('🧹 Cleaning up mission listener');
        unsubscribe();
      };
    } catch (err) {
      console.error('❌ Error setting up mission query:', err);
      setError(err);
      setLoading(false);
    }
  }, [user]);

  // When anonymous user converts to permanent, migrate their data
  useEffect(() => {
    const handleDataMigration = async () => {
      const previousUserId = localStorage.getItem('previousUserId');
      
      if (previousUserId && user && !user.isAnonymous) {
        console.log('🔄 Migrating data from anonymous user:', {
          from: previousUserId,
          to: user.uid
        });

        try {
          // Get all missions from previous anonymous user
          const previousMissions = await getDocs(
            query(collection(db, MISSIONS_COLLECTION), where('userId', '==', previousUserId))
          );

          if (!previousMissions.empty) {
            const batch = writeBatch(db);
            
            previousMissions.forEach(missionDoc => {
              const missionRef = doc(db, MISSIONS_COLLECTION, missionDoc.id);
              batch.update(missionRef, { userId: user.uid });
            });

            await batch.commit();
            console.log('✅ Successfully migrated missions:', previousMissions.size);
          }

          localStorage.removeItem('previousUserId');
        } catch (err) {
          console.error('❌ Error migrating data:', err);
        }
      }
    };

    handleDataMigration();
  }, [user]);

  const createMission = async (missionData) => {
    if (!user) {
      throw new Error('Must be logged in to create missions');
    }

    // Validate mission data
    if (!missionData.title?.trim()) {
      throw new Error('Mission title is required');
    }

    // Calculate total duration from subtasks or use provided duration
    const totalDuration = missionData.subtasks?.length > 0
      ? missionData.subtasks.reduce((total, subtask) => total + (parseInt(subtask.estimatedDuration) || 0), 0)
      : parseInt(missionData.duration) || 25;

    console.log('Calculated duration:', {
      fromSubtasks: missionData.subtasks?.reduce((total, subtask) => total + (parseInt(subtask.estimatedDuration) || 0), 0),
      providedDuration: missionData.duration,
      finalDuration: totalDuration
    });

    // Sanitize and validate mission data
    const sanitizedMission = {
      title: missionData.title.trim(),
      description: missionData.description?.trim() || '',
      subtasks: Array.isArray(missionData.subtasks) ? missionData.subtasks : [],
      totalDuration,
      duration: totalDuration, // Add this for backward compatibility
      userId: user.uid,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      completed_at: null,
      started_at: null
    };
    
    console.log('📝 Creating new mission:', {
      userId: user.uid,
      mission: sanitizedMission
    });

    try {
      const docRef = await addDoc(collection(db, 'missions'), sanitizedMission);
      console.log('✅ Mission created successfully:', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('❌ Error creating mission:', err);
      throw err;
    }
  };

  const startMission = async (missionId) => {
    if (!user) return;
    
    console.log('🚀 Starting mission:', {
      missionId,
      userId: user.uid
    });

    try {
      const missionRef = doc(db, 'missions', missionId);
      const mission = missions.find(m => m.id === missionId);
      
      // Get duration from mission
      const totalDuration = mission?.totalDuration || mission?.duration || 25;

      const updateData = {
        started_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        totalDuration
      };
      
      console.log('📝 Updating mission with:', updateData);
      await updateDoc(missionRef, updateData);
      console.log('✅ Mission started successfully');
    } catch (err) {
      console.error('❌ Error starting mission:', err);
      throw err;
    }
  };

  const completeMission = async (missionId) => {
    if (!user) return;
    
    console.log('🎯 Completing mission:', {
      missionId,
      userId: user.uid
    });

    try {
      const missionRef = doc(db, 'missions', missionId);
      const updateData = {
        completed_at: serverTimestamp(),
        started_at: null, // Clear started_at to properly reset the mission state
        updated_at: serverTimestamp()
      };
      
      console.log('📝 Updating mission with:', updateData);
      await updateDoc(missionRef, updateData);
      console.log('✅ Mission completed successfully');
    } catch (err) {
      console.error('❌ Error completing mission:', err);
      throw err;
    }
  };

  const revertMission = async (missionId) => {
    if (!user) return;
    
    console.log('↩️ Reverting mission:', {
      missionId,
      userId: user.uid
    });

    try {
      const missionRef = doc(db, MISSIONS_COLLECTION, missionId);
      await updateDoc(missionRef, {
        completed_at: null,
        updated_at: serverTimestamp()
      });
      console.log('✅ Mission reverted successfully');
    } catch (err) {
      console.error('❌ Error reverting mission:', err);
      throw err;
    }
  };

  const updateSubtask = async (missionId, subtaskIndex, completed) => {
    if (!user) return;
    
    console.log('📝 Updating subtask:', {
      missionId,
      subtaskIndex,
      completed,
      userId: user.uid
    });

    try {
      const mission = missions.find(m => m.id === missionId);
      if (!mission) throw new Error('Mission not found');

      const updatedSubtasks = [...mission.subtasks];
      updatedSubtasks[subtaskIndex] = {
        ...updatedSubtasks[subtaskIndex],
        completed
      };

      const missionRef = doc(db, MISSIONS_COLLECTION, missionId);
      await updateDoc(missionRef, {
        subtasks: updatedSubtasks,
        updated_at: serverTimestamp()
      });
      console.log('✅ Subtask updated successfully');
    } catch (err) {
      console.error('❌ Error updating subtask:', err);
      throw err;
    }
  };

  const deleteMission = async (missionId) => {
    if (!user) return;
    
    console.log('🗑️ Deleting mission:', {
      missionId,
      userId: user.uid
    });

    try {
      const missionRef = doc(db, MISSIONS_COLLECTION, missionId);
      await deleteDoc(missionRef);
      console.log('✅ Mission deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting mission:', err);
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
    revertMission,
    updateSubtask,
    deleteMission
  };
}
