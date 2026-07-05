import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { UniverseProvider } from './lib/store'
import { Layout } from './components/Layout'
import { UniversePage } from './pages/Universe'
import { TimelinePage } from './pages/Timeline'
import { CharacterPage, CharactersIndexPage } from './pages/Characters'
import { EventPage } from './pages/Event'
import { SourcesPage } from './pages/Sources'
import { IngestPage } from './pages/Ingest'
import { RumorDeskPage } from './pages/RumorDesk'
import { ExplainerPage } from './pages/Explainer'

export default function App() {
  return (
    <UniverseProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<UniversePage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/characters" element={<CharactersIndexPage />} />
            <Route path="/characters/:id" element={<CharacterPage />} />
            <Route path="/events/:id" element={<EventPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/ingest" element={<IngestPage />} />
            <Route path="/rumor-desk" element={<RumorDeskPage />} />
            <Route path="/explainer" element={<ExplainerPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UniverseProvider>
  )
}
