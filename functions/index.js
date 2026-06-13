const { onSchedule } = require('firebase-functions/v2/scheduler')
const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore, Timestamp } = require('firebase-admin/firestore')

initializeApp()
const db = getFirestore()

/**
 * autoCreateRecords — runs at 8:00 AM and 8:00 PM IST every day.
 * For each seller with autoMode=true, creates records for all buyers
 * who also have autoMode=true using their set morning/evening quantities.
 */
exports.autoCreateRecordsMorning = onSchedule(
  { schedule: '30 2 * * *', timeZone: 'Asia/Kolkata' }, // 8:00 AM IST = 02:30 UTC
  async () => {
    await createAutoRecords('morning')
  }
)

exports.autoCreateRecordsEvening = onSchedule(
  { schedule: '30 14 * * *', timeZone: 'Asia/Kolkata' }, // 8:00 PM IST = 14:30 UTC
  async () => {
    await createAutoRecords('evening')
  }
)

async function createAutoRecords(session) {
  const sellersSnap = await db.collection('sellers').where('autoMode', '==', true).get()
  const now = new Date()
  const dateTs = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
  const batch = db.batch()

  for (const sellerDoc of sellersSnap.docs) {
    const sellerId = sellerDoc.id
    const membersSnap = await db
      .collection('sellerBuyers').doc(sellerId).collection('members')
      .where('status', '==', 'active')
      .where('autoMode', '==', true)
      .get()

    for (const memberDoc of membersSnap.docs) {
      const buyer = memberDoc.data()
      const buyerId = memberDoc.id

      for (const cattleType of ['cow', 'buffalo']) {
        const setMorning = buyer.morning?.[cattleType] ?? 0
        const setEvening = buyer.evening?.[cattleType] ?? 0
        if (setMorning === 0 && setEvening === 0) continue

        const quantity = session === 'morning' ? setMorning : setEvening
        const recordId = `${buyerId}_${cattleType}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

        const ref = db.collection('records').doc(sellerId).collection('entries').doc(recordId)
        const existing = await ref.get()

        if (existing.exists) {
          // Only update the relevant session, don't overwrite the other
          batch.update(ref, {
            [session]: quantity,
            total: (existing.data().morning ?? 0) + (session === 'morning' ? quantity : (existing.data().evening ?? 0)),
            isAbnormal: false,
            source: 'auto',
          })
        } else {
          batch.set(ref, {
            buyerId,
            date: dateTs,
            cattleType,
            morning: session === 'morning' ? setMorning : 0,
            evening: session === 'evening' ? setEvening : 0,
            total: session === 'morning' ? setMorning : setEvening,
            setMorning,
            setEvening,
            isAbnormal: false,
            source: 'auto',
            createdAt: Timestamp.now(),
          })
        }
      }
    }
  }

  await batch.commit()
}

/**
 * onPhoneMatch — triggers when a new user registers.
 * Checks if any sellerBuyers entry matches their phone.
 * If yes, creates a pending linkRequest.
 */
exports.onNewUserCreate = onDocumentCreated('users/{userId}', async (event) => {
  const user = event.data.data()
  if (!user?.phone || user.role !== 'buyer') return

  const sellersSnap = await db.collection('sellers').get()

  for (const sellerDoc of sellersSnap.docs) {
    const sellerId = sellerDoc.id
    const membersSnap = await db
      .collection('sellerBuyers').doc(sellerId).collection('members')
      .where('phone', '==', user.phone)
      .get()

    for (const memberDoc of membersSnap.docs) {
      const sellerUserDoc = await db.collection('users').doc(sellerId).get()
      const sellerPhone = sellerUserDoc.data()?.phone || ''

      await db.collection('linkRequests').add({
        sellerPhone,
        buyerPhone: user.phone,
        sellerId,
        buyerId: event.params.userId,
        status: 'pending',
        createdAt: Timestamp.now(),
      })
    }
  }
})
