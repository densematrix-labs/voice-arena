import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDeviceStore } from './lib/deviceStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PricingPage from './pages/PricingPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'

function App() {
  const initDevice = useDeviceStore((state) => state.initDevice)

  useEffect(() => {
    initDevice()
  }, [initDevice])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
      </Routes>
    </Layout>
  )
}

export default App
