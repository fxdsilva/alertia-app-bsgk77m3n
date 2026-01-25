import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/contexts/AppContext'

import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import PortalHome from '@/pages/public/PortalHome'

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

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import CodeOfConductManager from '@/pages/admin/CodeOfConductManager'
import CommitmentManager from '@/pages/admin/CommitmentManager'
import ComplaintManager from '@/pages/admin/ComplaintManager'
import Reports from '@/pages/admin/Reports'

// School Admin Pages
import UserManagement from '@/pages/school-admin/UserManagement'
import SchoolComplaints from '@/pages/school-admin/SchoolComplaints'

// Compliance Pages
import TaskDistribution from '@/pages/compliance/TaskDistribution'
import ComplaintTriage from '@/pages/compliance/director/ComplaintTriage'
import AnalystDashboard from '@/pages/compliance/analyst/AnalystDashboard'
import InvestigationWorkspace from '@/pages/compliance/analyst/InvestigationWorkspace'
import TaskDetails from '@/pages/compliance/analyst/TaskDetails'

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

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route
              path="/admin/code-of-conduct"
              element={<CodeOfConductManager />}
            />
            <Route path="/admin/commitment" element={<CommitmentManager />} />
            <Route path="/admin/complaints" element={<ComplaintManager />} />
            <Route path="/admin/reports" element={<Reports />} />

            {/* School Admin Routes */}
            <Route path="/school-admin/users" element={<UserManagement />} />
            <Route
              path="/school-admin/complaints"
              element={<SchoolComplaints />}
            />

            {/* Compliance Director Routes */}
            <Route
              path="/compliance/director/tasks"
              element={<TaskDistribution />}
            />
            <Route
              path="/compliance/director/complaints"
              element={<ComplaintTriage />}
            />

            {/* Compliance Analyst Routes */}
            <Route
              path="/compliance/analyst/dashboard"
              element={<AnalystDashboard />}
            />
            <Route
              path="/compliance/analyst/task/:id"
              element={<TaskDetails />}
            />
            <Route
              path="/compliance/analyst/investigation/:id"
              element={<InvestigationWorkspace />}
            />

            {/* Portal Public Pages */}
            <Route path="/public/portal" element={<PortalHome />} />
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
            />

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
