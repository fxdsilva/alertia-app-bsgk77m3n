import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/contexts/AppContext'

import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Support from '@/pages/Support'
import PortalHome from '@/pages/public/PortalHome'

import CodeOfConduct from '@/pages/public/CodeOfConduct'
import ManagementCommitment from '@/pages/public/ManagementCommitment'
import ComplaintRegistration from '@/pages/public/ComplaintRegistration'
import ComplaintStatus from '@/pages/public/ComplaintStatus'

import Training from '@/pages/collaborator/Training'
import TrainingList from '@/pages/collaborator/TrainingList'
import InternalContent from '@/pages/collaborator/InternalContent'

import RiskDashboard from '@/pages/manager/RiskDashboard'
import Audits from '@/pages/manager/Audits'
import Mediations from '@/pages/manager/Mediations'

import ConsolidatedData from '@/pages/senior/ConsolidatedData'
import DueDiligence from '@/pages/senior/DueDiligence'
import DisciplinaryDecisions from '@/pages/senior/DisciplinaryDecisions'
import AIReports from '@/pages/senior/AIReports'
import SchoolManagement from '@/pages/senior/SchoolManagement'
import SeniorDashboard from '@/pages/senior/SeniorDashboard'
import SeniorUserManagement from '@/pages/senior/UserManagement'
import AuditLogs from '@/pages/senior/AuditLogs'
import PendingReports from '@/pages/senior/PendingReports'
import NetworkWorkflow from '@/pages/senior/NetworkWorkflow'
import WorkflowDetailMaster from '@/pages/senior/WorkflowDetailMaster'

import InternalInvestigations from '@/pages/InternalInvestigations'
import ReportGeneration from '@/pages/ReportGeneration'

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import CodeOfConductManager from '@/pages/admin/CodeOfConductManager'
import CommitmentManager from '@/pages/admin/CommitmentManager'
import ComplaintManager from '@/pages/admin/ComplaintManager'
import Reports from '@/pages/admin/Reports'

// School Admin Routes
import UserManagement from '@/pages/school-admin/UserManagement'
import SchoolComplaints from '@/pages/school-admin/SchoolComplaints'
import StrategicDashboard from '@/pages/school-manager/StrategicDashboard'

// Compliance Pages
import TaskDistribution from '@/pages/compliance/TaskDistribution'
import ComplaintTriage from '@/pages/compliance/director/ComplaintTriage'
import AnalystDashboard from '@/pages/compliance/analyst/AnalystDashboard'
import ComplaintsDashboard from '@/pages/compliance/analyst/ComplaintsDashboard'
import InvestigationWorkspace from '@/pages/compliance/analyst/InvestigationWorkspace'
import TaskDetails from '@/pages/compliance/analyst/TaskDetails'
import DirectorDashboard from '@/pages/compliance/DirectorDashboard'
import AnalystManagement from '@/pages/compliance/director/AnalystManagement'
import ComplaintWorkflow from '@/pages/compliance/director/ComplaintWorkflow'
import WorkflowDetail from '@/pages/compliance/director/WorkflowDetail'
import WorkflowTask from '@/pages/compliance/analyst/WorkflowTask'
import AuditingDashboard from '@/pages/compliance/analyst/AuditingDashboard'
import DueDiligenceDashboard from '@/pages/compliance/analyst/DueDiligenceDashboard'
import RiskManagementDashboard from '@/pages/compliance/analyst/RiskManagementDashboard'

// Secretary Page
import SecretaryDashboard from '@/pages/secretary/SecretaryDashboard'

// Professor Pages
import DashboardProfessor from '@/pages/professor/DashboardProfessor'
import Agenda from '@/pages/professor/Agenda'
import Library from '@/pages/professor/Library'
import {
  ProfessorShare,
  ProfessorMessages,
  ProfessorAbout,
} from '@/pages/professor/Placeholders'

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
            <Route path="/support" element={<Support />} />

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
            <Route
              path="/school-management/dashboard"
              element={<StrategicDashboard />}
            />

            {/* Secretary Route */}
            <Route
              path="/secretary/dashboard"
              element={<SecretaryDashboard />}
            />

            {/* Compliance Director Routes */}
            <Route
              path="/compliance/director/dashboard"
              element={<DirectorDashboard />}
            />
            <Route
              path="/compliance/director/tasks"
              element={<TaskDistribution />}
            />
            <Route
              path="/compliance/director/complaints"
              element={<ComplaintTriage />}
            />
            <Route
              path="/compliance/director/analysts"
              element={<AnalystManagement />}
            />
            {/* New Workflow Routes */}
            <Route
              path="/compliance/director/workflow"
              element={<ComplaintWorkflow />}
            />
            <Route
              path="/compliance/director/workflow/:id"
              element={<WorkflowDetail />}
            />

            {/* Compliance Analyst Routes */}
            <Route
              path="/compliance/analyst/dashboard"
              element={<AnalystDashboard />}
            />
            <Route
              path="/compliance/analyst/complaints"
              element={<ComplaintsDashboard />}
            />
            <Route
              path="/compliance/analyst/task/:id"
              element={<TaskDetails />}
            />
            <Route
              path="/compliance/analyst/investigation/:id"
              element={<InvestigationWorkspace />}
            />
            <Route
              path="/compliance/analyst/workflow/:id"
              element={<WorkflowTask />}
            />
            <Route
              path="/compliance/analyst/auditing"
              element={<AuditingDashboard />}
            />
            <Route
              path="/compliance/analyst/due-diligence"
              element={<DueDiligenceDashboard />}
            />
            <Route
              path="/compliance/analyst/risk-management"
              element={<RiskManagementDashboard />}
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
            <Route
              path="/collaborator/training/public-list"
              element={<TrainingList />}
            />
            <Route path="/collaborator/content" element={<InternalContent />} />
            <Route
              path="/collaborator/complaints"
              element={<Navigate to="/collaborator/training" replace />}
            />

            {/* Professor Pages */}
            <Route
              path="/dashboard-professor"
              element={<DashboardProfessor />}
            />
            <Route path="/professor/agenda" element={<Agenda />} />
            <Route path="/professor/library" element={<Library />} />
            <Route path="/professor/trainings" element={<Training />} />
            <Route path="/share" element={<ProfessorShare />} />
            <Route path="/messages" element={<ProfessorMessages />} />
            <Route path="/about" element={<ProfessorAbout />} />

            {/* Manager Pages */}
            <Route path="/manager/risks" element={<RiskDashboard />} />
            <Route path="/manager/audits" element={<Audits />} />
            <Route path="/manager/mediations" element={<Mediations />} />

            {/* Senior Management Pages */}
            <Route path="/senior/dashboard" element={<SeniorDashboard />} />
            <Route path="/senior/users" element={<SeniorUserManagement />} />
            <Route path="/senior/consolidated" element={<ConsolidatedData />} />
            <Route path="/senior/due-diligence" element={<DueDiligence />} />
            <Route
              path="/senior/decisions"
              element={<DisciplinaryDecisions />}
            />
            <Route path="/senior/ai-reports" element={<AIReports />} />
            <Route path="/senior/schools" element={<SchoolManagement />} />
            <Route path="/senior/audit-logs" element={<AuditLogs />} />
            <Route
              path="/senior/pending-reports"
              element={<PendingReports />}
            />
            <Route path="/senior/workflow" element={<NetworkWorkflow />} />
            <Route
              path="/senior/workflow/:id"
              element={<WorkflowDetailMaster />}
            />

            {/* Shared Pages */}
            <Route
              path="/investigations"
              element={<InternalInvestigations />}
            />
            <Route path="/reports" element={<ReportGeneration />} />

            {/* Redirects for direct sidebar access */}
            <Route path="/home" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppProvider>
)

export default App
