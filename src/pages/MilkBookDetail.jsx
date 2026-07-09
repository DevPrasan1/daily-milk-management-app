import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import {
  getMilkBook, deleteMilkBook, getMilkBookRecords, getMilkBookPayments,
  deleteMilkBookRecord, deleteMilkBookPayment
} from '@/services/milkbook.service'

const EMOJIS = {
  cow: '🐄',
  buffalo: '🐃',
  goat: '🐐',
  camel: '🐪',
}

import { getLastNMonths } from '@/utils/dateUtils'
import { buildWhatsAppBillMessage, shareOnWhatsApp } from '@/utils/shareUtils'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import RecordCard from '@/components/records/RecordCard'
import PaymentEntry from '@/components/billing/PaymentEntry'
import PaymentHistory from '@/components/billing/PaymentHistory'
import RecordEntryModal from '@/components/records/RecordEntryModal'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { IndianRupee, Pencil, Trash2, Milk, Download } from 'lucide-react'
import { clsx } from 'clsx'
import { groupRecordsByDate, formatLitres, formatAmount } from '@/utils/milkUtils'

const months = getLastNMonths(6)

export default function MilkBookDetail() {
  const { milkbookId } = useParams()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { toast } = useApp()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [records, setRecords] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(months[0])
  const [showPayment, setShowPayment] = useState(false)
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [tab, setTab] = useState('records')
  const [showDeleteBook, setShowDeleteBook] = useState(false)
  const [deletingBook, setDeletingBook] = useState(false)

  const isCreator = book?.isCreator

  const loadData = useCallback(async () => {
    if (!milkbookId || !user) return
    setLoading(true)
    try {
      const bookData = await getMilkBook(milkbookId, user.uid)
      if (!bookData) {
        toast('MilkBook not found', 'error')
        navigate(-1)
        return
      }
      setBook(bookData)

      const year = selectedMonth.date.getFullYear()
      const month = selectedMonth.date.getMonth()

      const [recs, pays] = await Promise.all([
        getMilkBookRecords(milkbookId, year, month),
        getMilkBookPayments(milkbookId, year, month)
      ])

      setRecords(recs)
      setPayments(pays)
    } catch (e) {
      console.error(e)
      toast(t('common.error'), 'error')
    } finally {
      setLoading(false)
    }
  }, [milkbookId, user, selectedMonth, navigate, toast, t])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getCattlePrice = (type) => {
    return book?.prices?.[type] ?? 0
  }

  // Calculate billing summary
  const summary = (() => {
    let totalLitres = 0
    let totalAmount = 0
    records.forEach(r => {
      totalLitres += r.total || 0
      const rPrice = getCattlePrice(r.cattleType)
      totalAmount += (r.total || 0) * rPrice
    })
    totalAmount = parseFloat(totalAmount.toFixed(2))
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const remaining = parseFloat((totalAmount - totalPaid).toFixed(2))
    return { totalLitres, totalAmount, totalPaid, remaining }
  })()

  const cattleRecords = groupRecordsByDate(records)
  const activeCattleTypes = Array.from(new Set(records.map(r => r.cattleType))).filter(Boolean)

  function handleDownloadPDF() {
    if (!book) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast('Please allow popups to download PDF', 'error')
      return
    }

    const sortedRecords = [...records].sort((a, b) => {
      const da = a.date?.toDate ? a.date.toDate() : new Date(a.date)
      const db = b.date?.toDate ? b.date.toDate() : new Date(b.date)
      return da - db
    })

    const monthName = selectedMonth.label
    
    const recordRows = sortedRecords.map(r => {
      const rDate = r.date?.toDate ? r.date.toDate() : new Date(r.date)
      return `
        <tr>
          <td>${rDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
          <td style="text-transform: capitalize;">${r.cattleType}</td>
          <td>${r.morning ? r.morning.toFixed(1) + ' L' : '—'}</td>
          <td>${r.evening ? r.evening.toFixed(1) + ' L' : '—'}</td>
          <td>${r.comment || '—'}</td>
        </tr>
      `
    }).join('')

    const formatPdfAmt = (val) => {
      const parsed = parseFloat(val || 0)
      return parsed % 1 === 0 ? parsed.toFixed(0) : parsed.toFixed(2)
    }

    const breakdownRows = activeCattleTypes.map(type => {
      const litres = records.filter(r => r.cattleType === type).reduce((sum, r) => sum + (r.total || 0), 0)
      const priceVal = getCattlePrice(type)
      const subtotal = litres * priceVal
      const emoji = EMOJIS[type] || '🥛'
      return `
        <div class="meta-row">
          <span class="meta-label">${emoji} <span style="text-transform: capitalize;">${type}</span> (${litres.toFixed(1)} L):</span>
          <span class="meta-value">₹${priceVal}/L = ₹${formatPdfAmt(subtotal)}</span>
        </div>
      `
    }).join('')

    const paymentRows = payments.map(p => {
      const pDate = p.date?.toDate ? p.date.toDate() : new Date(p.date)
      const amt = p.amount || 0
      const formattedAmt = amt % 1 === 0 ? amt.toFixed(0) : amt.toFixed(2)
      return `
        <tr>
          <td>${pDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
          <td><strong>₹${formattedAmt}</strong></td>
          <td>${p.note || '—'}</td>
        </tr>
      `
    }).join('')

    const htmlContent = `
      <html>
        <head>
          <title>MilkBook Report - ${book.displayName || book.name} - ${monthName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #333;
              margin: 0;
              padding: 40px;
              font-size: 14px;
              line-height: 1.5;
            }
            header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #1D9E75;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title h1 {
              margin: 0;
              color: #1D9E75;
              font-size: 26px;
              font-weight: 700;
            }
            .title p {
              margin: 5px 0 0 0;
              color: #666;
              font-size: 14px;
            }
            .metadata {
              display: grid;
              grid-template-cols: 1fr 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .meta-box {
              background: #f8f9fa;
              border-radius: 12px;
              padding: 20px;
              border: 1px solid #e9ecef;
            }
            .meta-box h3 {
              margin: 0 0 10px 0;
              font-size: 15px;
              color: #495057;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 1px solid #dee2e6;
              padding-bottom: 8px;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .meta-row:last-child {
              margin-bottom: 0;
            }
            .meta-label {
              color: #6c757d;
            }
            .meta-value {
              font-weight: 600;
            }
            .summary-card {
              background: #e8f5e9;
              border: 1px solid #c8e6c9;
              color: #2e7d32;
            }
            .summary-card h3 {
              color: #2e7d32;
              border-color: #c8e6c9;
            }
            .summary-card .meta-label {
              color: #4caf50;
            }
            .summary-card .meta-value {
              color: #1b5e20;
            }
            .summary-card .remaining-alert {
              color: #c62828;
              font-size: 16px;
              font-weight: 700;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f1f3f5;
              color: #495057;
              text-align: left;
              padding: 10px 12px;
              font-weight: 600;
              border-bottom: 2px solid #dee2e6;
            }
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #dee2e6;
              color: #495057;
            }
            tr:nth-child(even) td {
              background-color: #f8f9fa;
            }
            .section-title {
              font-size: 18px;
              font-weight: 700;
              color: #343a40;
              margin: 40px 0 15px 0;
              border-bottom: 1px solid #dee2e6;
              padding-bottom: 8px;
            }
            .footer {
              margin-top: 60px;
              text-align: center;
              color: #999;
              font-size: 12px;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <header>
            <div class="title">
              <h1>MilkBook Monthly Report</h1>
              <p>Apna dudh, apna hisaab</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: 700; color: #1D9E75;">${monthName}</div>
              <div style="color: #666; font-size: 12px;">Report Generated: ${new Date().toLocaleDateString('en-IN')}</div>
            </div>
          </header>

          <div class="metadata">
            <div class="meta-box">
              <h3>Book Details</h3>
              <div class="meta-row">
                <span class="meta-label">MilkBook Name:</span>
                <span class="meta-value">${book.displayName || book.name}</span>
              </div>
              ${book.phone ? `
              <div class="meta-row">
                <span class="meta-label">Phone Number:</span>
                <span class="meta-value">+91 ${book.phone}</span>
              </div>
              ` : ''}
              <div class="meta-row">
                <span class="meta-label">Role:</span>
                <span class="meta-value">${book.isCreator ? 'Managed Book (Creator)' : 'Shared Book (Viewer)'}</span>
              </div>
            </div>

            <div class="meta-box">
              <h3>Deliveries Breakdown</h3>
              ${breakdownRows || '<p style="color: #999; margin: 0; font-size: 13px;">No entries logged yet.</p>'}
            </div>

            <div class="meta-box summary-card">
              <h3>Billing Summary</h3>
              <div class="meta-row">
                <span class="meta-label">Total Volume:</span>
                <span class="meta-value">${summary.totalLitres.toFixed(1)} Litres</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Total Amount:</span>
                <span class="meta-value">₹${formatPdfAmt(summary.totalAmount)}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Total Paid:</span>
                <span class="meta-value">₹${formatPdfAmt(summary.totalPaid)}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Balance Due:</span>
                <span class="meta-value ${summary.remaining > 0 ? 'remaining-alert' : ''}">₹${formatPdfAmt(summary.remaining)}</span>
              </div>
            </div>
          </div>

          <div class="section-title">Daily Milk Entries</div>
          ${sortedRecords.length === 0 ? `
            <p style="color: #999; font-style: italic;">No records logged for this month.</p>
          ` : `
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Cattle</th>
                  <th>Morning</th>
                  <th>Evening</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                ${recordRows}
              </tbody>
            </table>
          `}

          <div class="section-title">Payments Log</div>
          ${payments.length === 0 ? `
            <p style="color: #999; font-style: italic;">No payments recorded for this month.</p>
          ` : `
            <table style="max-width: 600px;">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount Paid</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                ${paymentRows}
              </tbody>
            </table>
          `}

          <div class="footer">
            Thank you for using MilkBook • Apna dudh, apna hisaab
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  function handleShare() {
    if (!book) return
    const msg = buildWhatsAppBillMessage(book.name, selectedMonth.date, summary, records, getCattlePrice)
    shareOnWhatsApp(book.phone, msg)
  }

  async function handleDeleteRecord(recordId) {
    if (!isCreator) return
    try {
      if (Array.isArray(recordId)) {
        await Promise.all(recordId.map(id => deleteMilkBookRecord(milkbookId, id)))
      } else {
        await deleteMilkBookRecord(milkbookId, recordId)
      }
      loadData()
    } catch {
      toast(t('common.error'), 'error')
    }
  }

  async function handleDeletePayment(paymentId) {
    if (!isCreator) return
    try {
      await deleteMilkBookPayment(milkbookId, paymentId)
      loadData()
    } catch {
      toast(t('common.error'), 'error')
    }
  }

  async function handleDeleteBook() {
    if (!isCreator) return
    setDeletingBook(true)
    try {
      await deleteMilkBook(milkbookId)
      toast('MilkBook deleted', 'success')
      navigate(-1)
    } catch {
      toast(t('common.error'), 'error')
    } finally {
      setDeletingBook(false)
    }
  }

  return (
    <AppShell>
      <TopBar
        title={book?.displayName || book?.name || 'MilkBook Details'}
        action={
          <div className="flex gap-1">
            <button
              onClick={handleDownloadPDF}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Download PDF"
            >
              <Download className="w-4 h-4 text-[#1D9E75]" />
            </button>
            {isCreator && (
              <>
                <button
                  onClick={() => navigate(`/milkbooks/${milkbookId}/edit`)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setShowDeleteBook(v => !v)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Delete confirmation banner */}
      {showDeleteBook && (
        <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between gap-3">
          <p className="text-sm text-red-700 dark:text-red-300">
            Delete this MilkBook permanently? All daily entries and payments will also be deleted.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="danger" loading={deletingBook} onClick={handleDeleteBook}>
              {t('common.delete')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowDeleteBook(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )}

      {/* Month selector */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none border-b border-gray-100 dark:border-gray-800">
        {months.map(m => (
          <button
            key={m.key}
            onClick={() => setSelectedMonth(m)}
            className={clsx(
              'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              selectedMonth.key === m.key
                ? 'bg-[#1D9E75] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3">
        {['records', 'payments'].map(t_ => (
          <button
            key={t_}
            onClick={() => setTab(t_)}
            className={clsx(
              'flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize',
              tab === t_
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {t_ === 'records' ? 'Entries' : 'Payments'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-4">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : tab === 'records' ? (
          <div className="mt-3">
            {isCreator && (
              <div className="flex justify-end mb-3 px-4">
                <Button size="sm" className="w-100" onClick={() => setShowAddEntry(true)}>
                  <Milk className="w-4 h-4" />
                  Add Entry
                </Button>
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 rounded-2xl mx-4 border border-gray-100 dark:border-gray-700 overflow-hidden">
              {cattleRecords.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No records for this month</p>
              ) : (
                cattleRecords.map(r => (
                  <RecordCard key={r.id} record={r} onDelete={isCreator ? handleDeleteRecord : null} />
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="mt-3 px-4">
            {isCreator && (
              <div className="flex justify-end mb-3">
                <Button size="sm" className="w-100" onClick={() => setShowPayment(true)}>
                  <IndianRupee className="w-4 h-4" />
                  {t('seller.billing.addPayment')}
                </Button>
              </div>
            )}
            <PaymentHistory payments={payments} onDelete={isCreator ? handleDeletePayment : null} />
          </div>
        )}
      </div>

      {/* Sticky summary & rate breakdown */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-3 shadow-lg">
        {/* Breakdown details */}
        <div className="space-y-2 mb-3 pb-3 border-b border-gray-50 dark:border-gray-700">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Rate & Deliveries Breakdown</p>
          {activeCattleTypes.length === 0 ? (
            <p className="text-xs text-gray-400">No milk entries recorded</p>
          ) : (
            activeCattleTypes.map(type => {
              const litres = records.filter(r => r.cattleType === type).reduce((sum, r) => sum + (r.total || 0), 0)
              const priceVal = getCattlePrice(type)
              const subtotal = litres * priceVal
              return (
                <div key={type} className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{EMOJIS[type] || '🥛'}</span>
                    <span className="font-semibold capitalize">{type}:</span>
                    <span className="text-gray-500 font-medium">{formatLitres(litres)}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    ₹{priceVal}/L = {formatAmount(subtotal)}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Global Summary Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-base font-bold text-gray-900 dark:text-white">{formatLitres(summary.totalLitres)}</p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{t('common.total')}</p>
          </div>
          <div className="text-center border-x border-gray-100 dark:border-gray-700">
            <p className="text-base font-bold text-gray-900 dark:text-white">{formatAmount(summary.totalAmount)}</p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{t('common.amount')}</p>
          </div>
          <div className="text-center">
            <p className={`text-base font-bold ${summary.remaining > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
              {formatAmount(summary.remaining)}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{t('common.remaining')}</p>
          </div>
        </div>
      </div>

      {isCreator && (
        <>
          <PaymentEntry
            sellerId={user.uid}
            buyerId={null}
            milkbookId={milkbookId}
            open={showPayment}
            onClose={() => setShowPayment(false)}
            onSaved={loadData}
          />

          <RecordEntryModal
            sellerId={user.uid}
            buyer={book}
            milkbookId={milkbookId}
            open={showAddEntry}
            onClose={() => setShowAddEntry(false)}
            onSaved={loadData}
          />
        </>
      )}
    </AppShell>
  )
}
