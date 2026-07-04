import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import RegionPage from './pages/RegionPage'
import GetYourCard from './pages/GetYourCard'
import AboutPage from './pages/AboutPage'
import FAQPage from './pages/FAQPage'
import PartnerPage from './pages/PartnerPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="regions/:slug" element={<RegionPage />} />
          <Route path="get-your-card" element={<GetYourCard />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="partner" element={<PartnerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
