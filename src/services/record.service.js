import {
  collection, doc, setDoc, deleteDoc, getDocs, query,
  where, orderBy, Timestamp, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { isAbnormal } from '@/utils/milkUtils'

export async function getRecordsForMonth(sellerId, buyerId, year, month) {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)
  const q = query(
    collection(db, 'records', sellerId, 'entries'),
    where('buyerId', '==', buyerId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getRecordsForMonthAllBuyers(sellerId, year, month) {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)
  const q = query(
    collection(db, 'records', sellerId, 'entries'),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function saveRecord(sellerId, buyerId, date, cattleType, morning, evening, setMorning, setEvening, source = 'manual') {
  const total = parseFloat((morning + evening).toFixed(2))
  const abnormal = isAbnormal(morning, evening, setMorning, setEvening)
  const dateTs = Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()))
  const recordId = `${buyerId}_${cattleType}_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`

  await setDoc(doc(db, 'records', sellerId, 'entries', recordId), {
    buyerId,
    date: dateTs,
    cattleType,
    morning,
    evening,
    total,
    setMorning: setMorning ?? morning,
    setEvening: setEvening ?? evening,
    isAbnormal: abnormal,
    source,
    ...(source === 'manual' ? { manualEditedAt: serverTimestamp() } : {}),
    createdAt: serverTimestamp(),
  }, { merge: true })

  return recordId
}

export async function getBuyerSelfRecords(buyerId, sellerId, year, month) {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)
  const q = query(
    collection(db, 'buyerSelfRecords', buyerId, 'entries'),
    where('sellerId', '==', sellerId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function deleteRecord(sellerId, recordId) {
  await deleteDoc(doc(db, 'records', sellerId, 'entries', recordId))
}

export async function saveBuyerSelfRecord(buyerId, sellerId, date, cattleType, morning, evening) {
  const total = parseFloat((morning + evening).toFixed(2))
  const dateTs = Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()))
  const recordId = `${sellerId}_${cattleType}_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`

  await setDoc(doc(db, 'buyerSelfRecords', buyerId, 'entries', recordId), {
    sellerId,
    date: dateTs,
    cattleType,
    morning,
    evening,
    total,
    source: 'buyer',
    createdAt: serverTimestamp(),
  }, { merge: true })
}
