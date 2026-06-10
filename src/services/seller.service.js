import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection,
  getDocs, query, where, limit, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'

export async function getSellerProfile(sellerId) {
  const snap = await getDoc(doc(db, 'sellers', sellerId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateSellerProfile(sellerId, data) {
  await updateDoc(doc(db, 'sellers', sellerId), data)
}

// --- Buyers (sellerBuyers subcollection) ---

export async function getBuyers(sellerId) {
  const snap = await getDocs(collection(db, 'sellerBuyers', sellerId, 'members'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addBuyer(sellerId, buyerData) {
  const ref = doc(collection(db, 'sellerBuyers', sellerId, 'members'))
  await setDoc(ref, {
    ...buyerData,
    linkedUserId: null,
    status: 'active',
    addedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateBuyer(sellerId, buyerId, data) {
  await updateDoc(doc(db, 'sellerBuyers', sellerId, 'members', buyerId), data)
}

export async function getBuyer(sellerId, buyerId) {
  const snap = await getDoc(doc(db, 'sellerBuyers', sellerId, 'members', buyerId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function deleteBuyer(sellerId, buyerId) {
  await deleteDoc(doc(db, 'sellerBuyers', sellerId, 'members', buyerId))
}

export async function hasBuyerRecords(sellerId, buyerId) {
  const q = query(
    collection(db, 'records', sellerId, 'entries'),
    where('buyerId', '==', buyerId),
    limit(1)
  )
  const snap = await getDocs(q)
  return !snap.empty
}

// --- Prices ---

export async function getSellerPrices(sellerId) {
  const snap = await getDocs(collection(db, 'sellerPrices', sellerId, 'prices'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function setPrice(sellerId, priceId, priceData) {
  await setDoc(doc(db, 'sellerPrices', sellerId, 'prices', priceId), {
    ...priceData,
    fromDate: serverTimestamp(),
  })
}

export function getGlobalPriceId(cattleType) {
  return `global_${cattleType}`
}
