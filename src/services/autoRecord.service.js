import { doc, getDoc, setDoc, Timestamp, writeBatch } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { getBuyers } from './seller.service'

function getISTHour() {
  // IST = UTC + 5:30
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const ist = new Date(utc + 5.5 * 3600000)
  return { hour: ist.getHours(), date: ist }
}

function recordId(buyerId, cattleType, date) {
  return `${buyerId}_${cattleType}_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
}

async function ensureRecord(sellerId, buyerId, cattleType, date, setMorning, setEvening, session) {
  const id = recordId(buyerId, cattleType, date)
  const ref = doc(db, 'records', sellerId, 'entries', id)
  const snap = await getDoc(ref)

  const dateTs = Timestamp.fromDate(
    new Date(date.getFullYear(), date.getMonth(), date.getDate())
  )

  if (!snap.exists()) {
    // No record at all — create with whatever sessions have passed
    await setDoc(ref, {
      buyerId,
      date: dateTs,
      cattleType,
      morning: session === 'both' || session === 'morning' ? setMorning : 0,
      evening: session === 'evening' || session === 'both' ? setEvening : 0,
      total: session === 'both' ? setMorning + setEvening
        : session === 'morning' ? setMorning : setEvening,
      setMorning,
      setEvening,
      isAbnormal: false,
      source: 'auto',
      createdAt: Timestamp.now(),
    })
    return 'created'
  }

  // Record exists — only fill in the specific session if it's still 0
  const data = snap.data()
  const updates = {}

  if ((session === 'morning' || session === 'both') && data.morning === 0 && setMorning > 0) {
    updates.morning = setMorning
    updates.total = (data.evening ?? 0) + setMorning
  }
  if ((session === 'evening' || session === 'both') && data.evening === 0 && setEvening > 0) {
    updates.evening = setEvening
    updates.total = (data.morning ?? 0) + setEvening
  }

  if (Object.keys(updates).length > 0) {
    await setDoc(ref, { ...updates, source: 'auto' }, { merge: true })
    return 'updated'
  }

  return 'skipped'
}

/**
 * Called when seller opens the app.
 * Creates auto records for all buyers with autoMode=true,
 * for whichever sessions have passed today (8am IST = morning, 8pm IST = evening).
 * Idempotent — safe to call multiple times; won't overwrite manual entries.
 */
export async function runAutoRecordsForSeller(sellerId) {
  const { hour, date } = getISTHour()

  const morningDue = hour >= 8
  const eveningDue = hour >= 20

  if (!morningDue) return // Before 8am IST, nothing to do

  const buyers = await getBuyers(sellerId)
  const autoBuyers = buyers.filter(b => b.autoMode && b.status === 'active')

  if (autoBuyers.length === 0) return

  const session = eveningDue ? 'both' : 'morning'

  const tasks = []
  for (const buyer of autoBuyers) {
    for (const cattleType of ['cow', 'buffalo']) {
      const setMorning = buyer.morning?.[cattleType] ?? 0
      const setEvening = buyer.evening?.[cattleType] ?? 0
      if (setMorning === 0 && setEvening === 0) continue

      tasks.push(ensureRecord(sellerId, buyer.id, cattleType, date, setMorning, setEvening, session))
    }
  }

  await Promise.allSettled(tasks)
}

/**
 * Backfills records from startDate (inclusive) up to today for a newly added buyer.
 * Uses the buyer's set morning/evening quantities for each cattle type.
 * Skips days where a record already exists. Writes in batches of 500.
 */
export async function backfillRecordsForBuyer(sellerId, buyerId, morning, evening, startDate) {
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

  // Collect all (date, cattleType) combos that need a record
  const toWrite = []
  for (let d = new Date(from); d <= today; d.setDate(d.getDate() + 1)) {
    const day = new Date(d)
    for (const cattleType of cattleTypes) {
      const setMorning = morning?.[cattleType] ?? 0
      const setEvening = evening?.[cattleType] ?? 0
      const id = recordId(buyerId, cattleType, day)
      toWrite.push({ id, day: new Date(day), cattleType, setMorning, setEvening })
    }
  }

  // Write in batches of 500 (Firestore limit)
  for (let i = 0; i < toWrite.length; i += 500) {
    const batch = writeBatch(db)
    for (const { id, day, cattleType, setMorning, setEvening } of toWrite.slice(i, i + 500)) {
      const ref = doc(db, 'records', sellerId, 'entries', id)
      const dateTs = Timestamp.fromDate(new Date(day.getFullYear(), day.getMonth(), day.getDate()))
      batch.set(ref, {
        buyerId,
        date: dateTs,
        cattleType,
        morning: setMorning,
        evening: setEvening,
        total: parseFloat((setMorning + setEvening).toFixed(2)),
        setMorning,
        setEvening,
        isAbnormal: false,
        source: 'auto',
        createdAt: Timestamp.now(),
      }, { merge: true })
    }
    await batch.commit()
  }
}
