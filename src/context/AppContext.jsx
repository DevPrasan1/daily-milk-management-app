import { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext(null)

const initialState = {
  toasts: [],
  selectedBuyerId: null,
  selectedMonth: null,
  selectedCattle: 'cow',
  panchang: null,
}

function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: Date.now(), ...action.payload }] }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) }
    case 'SET_SELECTED_BUYER':
      return { ...state, selectedBuyerId: action.id }
    case 'SET_SELECTED_MONTH':
      return { ...state, selectedMonth: action.month }
    case 'SET_SELECTED_CATTLE':
      return { ...state, selectedCattle: action.cattle }
    case 'SET_PANCHANG':
      return { ...state, panchang: action.payload }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    fetch('/panchang.json')
      .then(res => res.json())
      .then(data => dispatch({ type: 'SET_PANCHANG', payload: data }))
      .catch(err => console.error('Failed to load panchang:', err))
  }, [])

  function toast(message, type = 'info') {
    const id = Date.now()
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } })
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 3500)
  }

  return (
    <AppContext.Provider value={{ state, dispatch, toast }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
