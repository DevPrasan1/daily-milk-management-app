import {
  collection, doc, addDoc, getDocs, query,
  where, orderBy, Timestamp, serverTimestamp, deleteDoc
} from 'firebase/firestore'
import { db } from '@/config/firebase'

export async function getPayments(sellerId, buyerId) {
  const q = query(
    collection(db, 'payments', sellerId, 'transactions'),
    where('buyerId', '==', buyerId),
    orderBy('date', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getPaymentsForMonth(sellerId, buyerId, year, month) {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)
  const q = query(
    collection(db, 'payments', sellerId, 'transactions'),
    where('buyerId', '==', buyerId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addPayment(sellerId, buyerId, amount, date, note) {
  await addDoc(collection(db, 'payments', sellerId, 'transactions'), {
    buyerId,
    amount: parseFloat(amount),
    date: Timestamp.fromDate(date),
    note: note || '',
    addedBy: sellerId,
    createdAt: serverTimestamp(),
  })
}

export function calcBillSummary(records, pricePerLitre, payments) {
  const totalLitres = records.reduce((sum, r) => sum + (r.total || 0), 0)
  const totalAmount = parseFloat((totalLitres * pricePerLitre).toFixed(2))
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const remaining = parseFloat((totalAmount - totalPaid).toFixed(2))
  return { totalLitres, totalAmount, totalPaid, remaining }
}

export async function deletePayment(sellerId, paymentId) {
  await deleteDoc(doc(db, 'payments', sellerId, 'transactions', paymentId))
}
