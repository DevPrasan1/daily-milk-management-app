import {
  doc, getDoc, updateDoc, collection, getDocs,
  query, where, addDoc, serverTimestamp, writeBatch, arrayUnion,
} from 'firebase/firestore'
import { db } from '@/config/firebase'

export async function getBuyerProfile(buyerId) {
  const snap = await getDoc(doc(db, 'buyers', buyerId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getLinkedSellers(buyerId) {
  const profile = await getBuyerProfile(buyerId)
  if (!profile?.linkedSellers?.length) return []
  const sellers = await Promise.all(
    profile.linkedSellers.map(sid => getDoc(doc(db, 'users', sid)))
  )
  return sellers
    .filter(s => s.exists())
    .map(s => ({ id: s.id, ...s.data() }))
}

export async function getLinkRequests(buyerId) {
  const q = query(
    collection(db, 'linkRequests'),
    where('buyerId', '==', buyerId),
    where('status', '==', 'pending')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function respondToLinkRequest(requestId, accept) {
  const reqRef = doc(db, 'linkRequests', requestId)
  const reqSnap = await getDoc(reqRef)
  if (!reqSnap.exists()) return

  const { sellerId, buyerId, buyerPhone } = reqSnap.data()
  const batch = writeBatch(db)

  batch.update(reqRef, {
    status: accept ? 'accepted' : 'rejected',
  })

  if (accept) {
    // 2. Add sellerId to buyer's linkedSellers
    const buyerRef = doc(db, 'buyers', buyerId)
    batch.update(buyerRef, {
      linkedSellers: arrayUnion(sellerId),
    })

    // 3. Find matching member doc and set linkedUserId
    const cleanPhone = buyerPhone.replace('+91', '')
    const membersQuery = query(
      collection(db, 'sellerBuyers', sellerId, 'members'),
      where('phone', 'in', [buyerPhone, cleanPhone])
    )
    const membersSnap = await getDocs(membersQuery)
    membersSnap.forEach(d => {
      batch.update(d.ref, {
        linkedUserId: buyerId,
      })
    })
  }

  await batch.commit()
}

export async function createLinkRequest(sellerPhone, buyerPhone, sellerId, buyerId) {
  await addDoc(collection(db, 'linkRequests'), {
    sellerPhone,
    buyerPhone,
    sellerId,
    buyerId,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

export async function getBuyerMembership(sellerId, buyerId, phone) {
  let q = query(
    collection(db, 'sellerBuyers', sellerId, 'members'),
    where('linkedUserId', '==', buyerId)
  )
  let snap = await getDocs(q)
  if (snap.empty && phone) {
    const cleanPhone = phone.replace('+91', '')
    q = query(
      collection(db, 'sellerBuyers', sellerId, 'members'),
      where('phone', 'in', [phone, cleanPhone])
    )
    snap = await getDocs(q)
  }
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}
