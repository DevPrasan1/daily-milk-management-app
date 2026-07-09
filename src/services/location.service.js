import { collection, getDocs, doc, updateDoc, GeoPoint, query, where, orderBy, startAt, endAt } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common'

export async function saveUserLocation(userId, lat, lng) {
  const hash = geohashForLocation([lat, lng])
  await updateDoc(doc(db, 'users', userId), {
    gpsLocation: new GeoPoint(lat, lng),
    geohash: hash
  })
  
  try {
    await updateDoc(doc(db, 'sellers', userId), {
      gpsLocation: new GeoPoint(lat, lng),
      geohash: hash
    })
  } catch (e) {
    // Sellers profile document might not exist yet if the user is onboarding
  }
}

export async function getNearbySellers(lat, lng, radiusKm = 10) {
  const center = [lat, lng]
  const radiusInM = radiusKm * 1000

  // Calculate geohash query bounds
  const bounds = geohashQueryBounds(center, radiusInM)
  const promises = []

  for (const b of bounds) {
    const q = query(
      collection(db, 'users'),
      orderBy('geohash'),
      startAt(b[0]),
      endAt(b[1])
    )
    promises.push(getDocs(q))
  }

  const snapshots = await Promise.all(promises)
  const matchingSellers = []

  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const data = doc.data()
      // Filter role client-side to avoid needing a Firestore composite index
      if (data.role !== 'seller') continue

      const latVal = data.gpsLocation?.latitude
      const lngVal = data.gpsLocation?.longitude
      
      if (latVal !== undefined && lngVal !== undefined) {
        const distance = distanceBetween([latVal, lngVal], center)
        if (distance <= radiusKm) {
          matchingSellers.push({
            id: doc.id,
            ...data,
            distance
          })
        }
      }
    }
  }

  // Deduplicate results
  const uniqueSellers = new Map()
  matchingSellers.forEach(s => uniqueSellers.set(s.id, s))

  return Array.from(uniqueSellers.values())
    .sort((a, b) => a.distance - b.distance)
}
