import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/contexts/AppContext'
import { AuthProvider } from '@/hooks/use-auth'
import { useEffect } from 'react'
import useAppStore from '@/stores/useAppStore'

import Layout from '@/components/Layout'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Support from '@/pages/Support'
import PortalHome from '@/pages/public/PortalHome'
import OfficialChannels from '@/pages/public/OfficialChannels'

import CodeOfConduct from '@/pages/public/CodeOfConduct'
import ManagementCommitment from '@/pages/public/ManagementCommitment'
import ComplaintRegistration from '@/pages/public/ComplaintRegistration'
import ComplaintStatus from '@/pages/public/ComplaintStatus'

import InternalContent from '@/pages/collaborator/InternalContent'
import TrainingsPage from '@/pages/trainings/TrainingsPage'
import TrainingDetails from '@/pages/trainings/TrainingDetails'

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
import SupportManager from '@/pages/senior/SupportManager'

import InternalInvestigations from '@/pages/InternalInvestigations'
import ReportGeneration from '@/pages/ReportGeneration'

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import CodeOfConductManager from '@/pages/admin/CodeOfConductManager'
import CommitmentManager from '@/pages/admin/CommitmentManager'
import ComplaintManager from '@/pages/admin/ComplaintManager'
import TrainingManager from '@/pages/admin/TrainingManager'
import Reports from '@/pages/admin/Reports'

// School Admin Routes
import UserManagement from '@/pages/school-admin/UserManagement'
import SchoolComplaints from '@/pages/school-admin/SchoolComplaints'
import StrategicDashboard from '@/pages/school-manager/StrategicDashboard'
import EducationalContentManager from '@/pages/school-manager/EducationalContentManager'

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

const DashboardRouter = () => {
  const { profile } = useAppStore()
  if (profile === 'gestao_escola')
    return <Navigate to="/school-management/dashboard" replace />
  if (profile === 'professor')
    return <Navigate to="/dashboard-professor" replace />
  if (profile === 'colaborador')
    return <Navigate to="/collaborator/training" replace />
  if (profile === 'gestor') return <Navigate to="/manager/risks" replace />
  if (profile === 'SECRETARIA DE EDUCAÇÃO')
    return <Navigate to="/secretary/dashboard" replace />
  if (
    profile === 'administrador' ||
    profile === 'admin_gestor' ||
    profile === 'senior'
  )
    return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/" replace />
}

const ComplianceRouter = () => {
  const { profile } = useAppStore()
  if (profile === 'DIRETOR_COMPLIANCE')
    return <Navigate to="/compliance/director/dashboard" replace />
  if (profile === 'ANALISTA_COMPLIANCE')
    return <Navigate to="/compliance/analyst/dashboard" replace />
  return <Navigate to="/" replace />
}

const App = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('SW registration failed:', err)
      })
    }
  }, [])

  return (
    <AppProvider>
      <AuthProvider>
        <BrowserRouter
          future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
        >
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <PWAInstallPrompt />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/support" element={<Support />} />

                {/* Routing Proxies based on AC */}
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route
                  path="/compliance/dashboard"
                  element={<ComplianceRouter />}
                />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route
                  path="/admin/code-of-conduct"
                  element={<CodeOfConductManager />}
                />
                <Route
                  path="/admin/commitment"
                  element={<CommitmentManager />}
                />
                <Route
                  path="/admin/complaints"
                  element={<ComplaintManager />}
                />
                <Route
                  path="/admin/trainings"
                  element={<Navigate to="/trainings" replace />}
                />
                <Route path="/admin/reports" element={<Reports />} />

                {/* Unified Trainings */}
                <Route path="/trainings" element={<TrainingsPage />} />
                <Route path="/trainings/:id" element={<TrainingDetails />} />

                {/* School Admin Routes */}
                <Route
                  path="/school-admin/users"
                  element={<UserManagement />}
                />
                <Route
                  path="/school-admin/complaints"
                  element={<SchoolComplaints />}
                />
                <Route
                  path="/school-management/dashboard"
                  element={<StrategicDashboard />}
                />
                <Route
                  path="/school-management/educational-content"
                  element={<EducationalContentManager />}
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
                  path="/compliance/director/educational-content"
                  element={<EducationalContentManager />}
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
                <Route
                  path="/public/code-of-conduct"
                  element={<CodeOfConduct />}
                />
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
                <Route
                  path="/public/official-channels"
                  element={<OfficialChannels />}
                />

                {/* Collaborator Pages */}
                <Route
                  path="/collaborator/training"
                  element={<Navigate to="/trainings" replace />}
                />
                <Route
                  path="/collaborator/training/public-list"
                  element={<Navigate to="/trainings" replace />}
                />
                <Route
                  path="/collaborator/content"
                  element={<InternalContent />}
                />
                <Route
                  path="/collaborator/complaints"
                  element={<Navigate to="/trainings" replace />}
                />

                {/* Professor Pages */}
                <Route
                  path="/dashboard-professor"
                  element={<DashboardProfessor />}
                />
                <Route path="/professor/agenda" element={<Agenda />} />
                <Route path="/professor/library" element={<Library />} />
                <Route
                  path="/professor/trainings"
                  element={<Navigate to="/trainings" replace />}
                />
                <Route path="/share" element={<ProfessorShare />} />
                <Route path="/messages" element={<ProfessorMessages />} />
                <Route path="/about" element={<ProfessorAbout />} />

                {/* Manager Pages */}
                <Route path="/manager/risks" element={<RiskDashboard />} />
                <Route path="/manager/audits" element={<Audits />} />
                <Route path="/manager/mediations" element={<Mediations />} />

                {/* Senior Management Pages */}
                <Route path="/senior/dashboard" element={<SeniorDashboard />} />
                <Route
                  path="/senior/users"
                  element={<SeniorUserManagement />}
                />
                <Route
                  path="/senior/consolidated"
                  element={<ConsolidatedData />}
                />
                <Route
                  path="/senior/due-diligence"
                  element={<DueDiligence />}
                />
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
                <Route
                  path="/senior/support-config"
                  element={<SupportManager />}
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
      </AuthProvider>
    </AppProvider>
  )
}

export default App
