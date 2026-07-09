import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, addDoc,
  getDocs, query, where, serverTimestamp, writeBatch, Timestamp, orderBy
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { isAbnormal } from '@/utils/milkUtils'

// --- MilkBooks Metadata ---

export async function getMilkBooks(userId) {
  const q1 = query(collection(db, 'milkbooks'), where('creatorId', '==', userId))
  const q2 = query(collection(db, 'milkbooks'), where('partnerId', '==', userId))
  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)])
  
  const creatorIds = Array.from(new Set(
    snap2.docs.map(d => d.data().creatorId).filter(Boolean)
  ))
  
  const creatorSnaps = await Promise.all(
    creatorIds.map(cid => getDoc(doc(db, 'users', cid)))
  )
  const creatorsMap = new Map()
  creatorSnaps.forEach(snap => {
    if (snap.exists()) {
      creatorsMap.set(snap.id, snap.data())
    }
  })

  const booksMap = new Map()
  snap1.docs.forEach(d => {
    const data = d.data()
    booksMap.set(d.id, {
      id: d.id,
      ...data,
      isCreator: true,
      displayName: data.name
    })
  })
  
  snap2.docs.forEach(d => {
    const data = d.data()
    const creatorProfile = creatorsMap.get(data.creatorId)
    booksMap.set(d.id, {
      id: d.id,
      ...data,
      isCreator: false,
      displayName: creatorProfile?.name || data.name
    })
  })
  
  return Array.from(booksMap.values())
}

export async function getMilkBook(milkbookId, currentUserId) {
  const snap = await getDoc(doc(db, 'milkbooks', milkbookId))
  if (!snap.exists()) return null
  const data = snap.data()
  const isCreator = data.creatorId === currentUserId

  let displayName = data.name
  if (!isCreator && data.creatorId) {
    const userSnap = await getDoc(doc(db, 'users', data.creatorId))
    if (userSnap.exists()) {
      displayName = userSnap.data().name || data.name
    }
  }

  return {
    id: snap.id,
    ...data,
    isCreator,
    displayName
  }
}

export async function addMilkBook(creatorId, bookData) {
  let partnerId = null
  if (bookData.phone) {
    const cleanPhone = bookData.phone.replace('+91', '').trim()
    const phones = [bookData.phone, cleanPhone, `+91${cleanPhone}`]
    const q = query(collection(db, 'users'), where('phone', 'in', phones))
    const snap = await getDocs(q)
    if (!snap.empty) {
      partnerId = snap.docs[0].id
    }
  }

  const ref = doc(collection(db, 'milkbooks'))
  const finalData = {
    ...bookData,
    creatorId,
    partnerId,
    status: 'active',
    createdAt: serverTimestamp(),
  }
  await setDoc(ref, finalData)
  return ref.id
}

export async function updateMilkBook(milkbookId, data) {
  if (data.phone !== undefined) {
    let partnerId = null
    if (data.phone) {
      const cleanPhone = data.phone.replace('+91', '').trim()
      const phones = [data.phone, cleanPhone, `+91${cleanPhone}`]
      const q = query(collection(db, 'users'), where('phone', 'in', phones))
      const snap = await getDocs(q)
      if (!snap.empty) {
        partnerId = snap.docs[0].id
      }
    }
    data.partnerId = partnerId
  }
  await updateDoc(doc(db, 'milkbooks', milkbookId), data)
}

export async function deleteMilkBook(milkbookId) {
  const refs = []
  refs.push(doc(db, 'milkbooks', milkbookId))

  const recs = await getDocs(collection(db, 'milkbooks', milkbookId, 'records'))
  recs.forEach(d => refs.push(d.ref))

  const pays = await getDocs(collection(db, 'milkbooks', milkbookId, 'payments'))
  pays.forEach(d => refs.push(d.ref))

  const batchSize = 400
  for (let i = 0; i < refs.length; i += batchSize) {
    const batch = writeBatch(db)
    refs.slice(i, i + batchSize).forEach(ref => batch.delete(ref))
    await batch.commit()
  }
}

// --- Records Subcollection ---

export async function getMilkBookRecords(milkbookId, year, month) {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)
  const q = query(
    collection(db, 'milkbooks', milkbookId, 'records'),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function saveMilkBookRecord(milkbookId, date, cattleType, morning, evening, comment = '', source = 'manual') {
  const total = parseFloat((morning + evening).toFixed(2))
  const abnormal = isAbnormal(morning, evening)
  const dateTs = Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()))
  const recordId = `${cattleType}_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`

  await setDoc(doc(db, 'milkbooks', milkbookId, 'records', recordId), {
    date: dateTs,
    cattleType,
    morning,
    evening,
    total,
    isAbnormal: abnormal,
    source,
    comment,
    ...(source === 'manual' ? { manualEditedAt: serverTimestamp() } : {}),
    createdAt: serverTimestamp(),
  }, { merge: true })

  return recordId
}

export async function deleteMilkBookRecord(milkbookId, recordId) {
  await deleteDoc(doc(db, 'milkbooks', milkbookId, 'records', recordId))
}

// --- Payments Subcollection ---

export async function getMilkBookPayments(milkbookId, year, month) {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)
  const q = query(
    collection(db, 'milkbooks', milkbookId, 'payments'),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addMilkBookPayment(milkbookId, creatorId, amount, date, note = '') {
  await addDoc(collection(db, 'milkbooks', milkbookId, 'payments'), {
    amount: parseFloat(amount),
    date: Timestamp.fromDate(date),
    note: note || '',
    addedBy: creatorId,
    createdAt: serverTimestamp(),
  })
}

export async function deleteMilkBookPayment(milkbookId, paymentId) {
  await deleteDoc(doc(db, 'milkbooks', milkbookId, 'payments', paymentId))
}

// --- Automatic Linking ---

export async function linkPendingMilkbooks(userId, phone) {
  if (!phone) return
  const cleanPhone = phone.replace('+91', '').trim()
  const phones = [phone, cleanPhone, `+91${cleanPhone}`]

  const q = query(
    collection(db, 'milkbooks'),
    where('phone', 'in', phones)
  )
  const snap = await getDocs(q)
  const batch = writeBatch(db)
  let updatedCount = 0
  snap.forEach(d => {
    const data = d.data()
    if (data.partnerId !== userId) {
      batch.update(d.ref, { partnerId: userId })
      updatedCount++
    }
  })
  if (updatedCount > 0) {
    await batch.commit()
  }
}

// --- Backfilling ---

export async function backfillMilkBookRecords(milkbookId, morning, evening, startDate) {
  const cattleTypes = [
    ...new Set([...Object.keys(morning || {}), ...Object.keys(evening || {})])
  ].filter(type => (morning?.[type] ?? 0) > 0 || (evening?.[type] ?? 0) > 0)

  if (!cattleTypes.length) return

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [yr, mo, dy] = startDate.split('-').map(Number)
  const from = new Date(yr, mo - 1, dy)
  from.setHours(0, 0, 0, 0)

  if (from > today) return

  const toWrite = []
  for (let d = new Date(from); d <= today; d.setDate(d.getDate() + 1)) {
    const day = new Date(d)
    for (const cattleType of cattleTypes) {
      const setMorning = morning?.[cattleType] ?? 0
      const setEvening = evening?.[cattleType] ?? 0
      const id = `${cattleType}_${day.getFullYear()}${String(day.getMonth() + 1).padStart(2, '0')}${String(day.getDate()).padStart(2, '0')}`
      toWrite.push({ id, day: new Date(day), cattleType, setMorning, setEvening })
    }
  }

  for (let i = 0; i < toWrite.length; i += 500) {
    const batch = writeBatch(db)
    for (const { id, day, cattleType, setMorning, setEvening } of toWrite.slice(i, i + 500)) {
      const ref = doc(db, 'milkbooks', milkbookId, 'records', id)
      const dateTs = Timestamp.fromDate(new Date(day.getFullYear(), day.getMonth(), day.getDate()))
      batch.set(ref, {
        date: dateTs,
        cattleType,
        morning: setMorning,
        evening: setEvening,
        total: parseFloat((setMorning + setEvening).toFixed(2)),
        isAbnormal: false,
        source: 'auto',
        createdAt: serverTimestamp(),
      }, { merge: true })
    }
    await batch.commit()
  }
}
