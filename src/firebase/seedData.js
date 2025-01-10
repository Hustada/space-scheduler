import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const initialMissions = [
  {
    title: 'Launch Day Initialization',
    description: 'Wake up and begin day',
    time: '05:00',
    duration: 30,
    status: 'pending',
    type: 'critical',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    title: 'Physical Systems Calibration',
    description: 'Morning workout routine',
    time: '05:30',
    duration: 60,
    status: 'pending',
    type: 'routine',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    title: 'Mission Planning & Sustenance',
    description: 'Breakfast and daily planning',
    time: '07:00',
    duration: 30,
    status: 'pending',
    type: 'routine',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  }
];

export async function seedDatabase() {
  try {
    const missionsCollection = collection(db, 'missions');
    
    for (const mission of initialMissions) {
      await addDoc(missionsCollection, {
        ...mission,
        created_at: serverTimestamp()
      });
    }
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
