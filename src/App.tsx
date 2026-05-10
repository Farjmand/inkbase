
import { useVaultStore } from './store/vaultStore'
import { Sidebar } from './components/sidebar/Sidebar'
import { PageEditor } from './components/editor/PageEditor'
import { WelcomeScreen } from './components/layout/WelcomeScreen'
import { SearchModal } from './components/search/SearchModal'
import { GraphView } from './components/graph/GraphView'

export default function App() {
  const { vault } = useVaultStore()

  if (!vault) {
    return (
      <div className="flex h-screen">
        <WelcomeScreen />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden">
        <PageEditor />
      </main>
      <SearchModal />
      <GraphView />
    </div>
  )
}
