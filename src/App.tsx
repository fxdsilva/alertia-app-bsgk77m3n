import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/contexts/AppContext'

import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'

import CodeOfConduct from '@/pages/public/CodeOfConduct'
import ManagementCommitment from '@/pages/public/ManagementCommitment'
import ComplaintRegistration from '@/pages/public/ComplaintRegistration'
import ComplaintStatus from '@/pages/public/ComplaintStatus'

import Training from '@/pages/collaborator/Training'
import InternalContent from '@/pages/collaborator/InternalContent'

import RiskDashboard from '@/pages/manager/RiskDashboard'
import Audits from '@/pages/manager/Audits'
import Mediations from '@/pages/manager/Mediations'

import ConsolidatedData from '@/pages/senior/ConsolidatedData'
import DueDiligence from '@/pages/senior/DueDiligence'
import DisciplinaryDecisions from '@/pages/senior/DisciplinaryDecisions'
import AIReports from '@/pages/senior/AIReports'
import SchoolManagement from '@/pages/senior/SchoolManagement'

import InternalInvestigations from '@/pages/InternalInvestigations'
import ReportGeneration from '@/pages/ReportGeneration'

const App = () => (
  <AppProvider>
    <BrowserRouter
      future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            {/* Public Pages */}
            <Route path="/public/code-of-conduct" element={<CodeOfConduct />} />
            <Route
              path="/public/commitment"
              element={<ManagementCommitment />}
            />
            <Route
              path="/public/complaint/new"
              element={<ComplaintRegistration />}
            />
            <Route
              path="/public/complaint/status"
              element={<ComplaintStatus />}
            />
            {/* Collaborator Pages */}
            <Route path="/collaborator/training" element={<Training />} />
            <Route path="/collaborator/content" element={<InternalContent />} />
            <Route
              path="/collaborator/complaints"
              element={<ComplaintStatus />}
            />{' '}
            {/* Reusing Status Page */}
            {/* Manager Pages */}
            <Route path="/manager/risks" element={<RiskDashboard />} />
            <Route path="/manager/audits" element={<Audits />} />
            <Route path="/manager/mediations" element={<Mediations />} />
            {/* Senior Management Pages */}
            <Route path="/senior/consolidated" element={<ConsolidatedData />} />
            <Route path="/senior/due-diligence" element={<DueDiligence />} />
            <Route
              path="/senior/decisions"
              element={<DisciplinaryDecisions />}
            />
            <Route path="/senior/ai-reports" element={<AIReports />} />
            <Route path="/senior/schools" element={<SchoolManagement />} />
            {/* Shared Pages */}
            <Route
              path="/investigations"
              element={<InternalInvestigations />}
            />
            <Route path="/reports" element={<ReportGeneration />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppProvider>
)

export default App
