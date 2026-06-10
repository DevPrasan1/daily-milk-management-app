import { collection, getDocs, doc, updateDoc, GeoPoint, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { distanceKm } from '@/hooks/useLocation'

export async function saveUserLocation(userId, lat, lng) {
  await updateDoc(doc(db, 'users', userId), {
    gpsLocation: new GeoPoint(lat, lng),
  })
}

export async function getNearbySellers(lat, lng, radiusKm = 10) {
  // Fetch all users with role=seller who have a GPS location set.
  // Client-side distance filter is fine for village-scale (dozens of sellers max).
  const q = query(collection(db, 'users'), where('role', '==', 'seller'))
  const snap = await getDocs(q)

  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u => u.gpsLocation)
    .map(u => ({
      ...u,
      distance: distanceKm(lat, lng, u.gpsLocation.latitude, u.gpsLocation.longitude),
    }))
    .filter(u => u.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
}
