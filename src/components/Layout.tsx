import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import useAppStore from '@/stores/useAppStore'

export default function Layout() {
  const { selectedSchool } = useAppStore()

  return (
    <SidebarProvider>
      {selectedSchool && <AppSidebar />}
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
        <footer className="py-4 text-center text-sm text-muted-foreground border-t bg-background">
          <p>
            &copy; {new Date().getFullYear()} ALERTIA. Todos os direitos
            reservados.
          </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
