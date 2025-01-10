import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

const MISSIONS_COLLECTION = 'missions';
const PATTERNS_COLLECTION = 'mission_patterns';

export const missionService = {
  // Create a new mission
  async createMission(missionData) {
    try {
      const docRef = await addDoc(collection(db, MISSIONS_COLLECTION), {
        ...missionData,
        created_at: serverTimestamp(),
        status: 'pending',
      });
      return { id: docRef.id, ...missionData };
    } catch (error) {
      console.error('Error creating mission:', error);
      throw error;
    }
  },

  // Update mission status and timing
  async updateMissionStatus(missionId, status, additionalData = {}) {
    try {
      const missionRef = doc(db, MISSIONS_COLLECTION, missionId);
      const updateData = {
        status,
        ...additionalData,
      };
      
      if (status === 'in-progress') {
        updateData.started_at = serverTimestamp();
      } else if (status === 'complete') {
        updateData.completed_at = serverTimestamp();
        // Calculate actual duration
        const missionDoc = await getDocs(query(
          collection(db, MISSIONS_COLLECTION),
          where('id', '==', missionId)
        ));
        if (!missionDoc.empty) {
          const startTime = missionDoc.data().started_at;
          if (startTime) {
            const duration = (Date.now() - startTime.toDate()) / (1000 * 60); // in minutes
            updateData.actual_duration = duration;
          }
        }
      }

      await updateDoc(missionRef, updateData);
    } catch (error) {
      console.error('Error updating mission:', error);
      throw error;
    }
  },

  // Get all missions for analysis
  async getMissionHistory() {
    try {
      const q = query(
        collection(db, MISSIONS_COLLECTION),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting mission history:', error);
      throw error;
    }
  },

  // Get mission patterns
  async getMissionPatterns() {
    try {
      const querySnapshot = await getDocs(collection(db, PATTERNS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting mission patterns:', error);
      throw error;
    }
  },

  // Update mission patterns based on completion
  async updateMissionPatterns(missionId, completionData) {
    try {
      const { dayOfWeek, timeOfDay, duration, energyLevel } = completionData;
      
      // Find or create pattern
      const q = query(
        collection(db, PATTERNS_COLLECTION),
        where('mission_id', '==', missionId),
        where('day_of_week', '==', dayOfWeek),
        where('time_of_day', '==', timeOfDay)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create new pattern
        await addDoc(collection(db, PATTERNS_COLLECTION), {
          mission_id: missionId,
          day_of_week: dayOfWeek,
          time_of_day: timeOfDay,
          completion_count: 1,
          total_duration: duration,
          average_duration: duration,
          energy_level_impact: energyLevel,
          success_rate: 100
        });
      } else {
        // Update existing pattern
        const pattern = querySnapshot.docs[0];
        const patternData = pattern.data();
        const newCompletionCount = patternData.completion_count + 1;
        const newTotalDuration = patternData.total_duration + duration;
        
        await updateDoc(doc(db, PATTERNS_COLLECTION, pattern.id), {
          completion_count: newCompletionCount,
          total_duration: newTotalDuration,
          average_duration: newTotalDuration / newCompletionCount,
          energy_level_impact: (patternData.energy_level_impact + energyLevel) / 2
        });
      }
    } catch (error) {
      console.error('Error updating mission patterns:', error);
      throw error;
    }
  }
};
