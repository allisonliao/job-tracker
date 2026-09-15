import { Route, Routes } from 'react-router'
import { Layout } from './components/layout/Layout'
import { ApplicationDetailPage } from './pages/ApplicationDetailPage'
import { ApplicationFormPage } from './pages/ApplicationFormPage'
import { ApplicationsListPage } from './pages/ApplicationsListPage'
import { CompaniesPage } from './pages/CompaniesPage'
import { DashboardPage } from './pages/DashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="applications" element={<ApplicationsListPage />} />
        <Route path="applications/new" element={<ApplicationFormPage />} />
        <Route path="applications/:applicationId" element={<ApplicationDetailPage />} />
        <Route path="applications/:applicationId/edit" element={<ApplicationFormPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App