import {
  doc, getDoc, updateDoc, collection, getDocs,
  query, where, addDoc, serverTimestamp,
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
  await updateDoc(doc(db, 'linkRequests', requestId), {
    status: accept ? 'accepted' : 'rejected',
  })
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
