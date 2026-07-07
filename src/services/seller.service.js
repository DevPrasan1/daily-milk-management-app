import {
  doc, getDoc, setDoc, updateDoc, collection,
  getDocs, query, where, limit, serverTimestamp, writeBatch,
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
  const refs = []

  // 1. Buyer membership doc
  refs.push(doc(db, 'sellerBuyers', sellerId, 'members', buyerId))

  // 2. All records for this buyer
  const recordsQuery = query(
    collection(db, 'records', sellerId, 'entries'),
    where('buyerId', '==', buyerId)
  )
  const recordsSnap = await getDocs(recordsQuery)
  recordsSnap.forEach(d => {
    refs.push(d.ref)
  })

  // 3. All payments for this buyer
  const paymentsQuery = query(
    collection(db, 'payments', sellerId, 'transactions'),
    where('buyerId', '==', buyerId)
  )
  const paymentsSnap = await getDocs(paymentsQuery)
  paymentsSnap.forEach(d => {
    refs.push(d.ref)
  })

  // Commit in batches of 400 to stay safely under Firestore's 500 limit
  const batchSize = 400
  for (let i = 0; i < refs.length; i += batchSize) {
    const batch = writeBatch(db)
    const chunk = refs.slice(i, i + batchSize)
    chunk.forEach(ref => {
      batch.delete(ref)
    })
    await batch.commit()
  }
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
