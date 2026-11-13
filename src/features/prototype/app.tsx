import { Component, type ReactNode } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router";
import { PrototypeProvider } from "./store";
import { Shell, NotFound } from "./shell";
import HomePage from "./home";
import MethodologyPage from "./methodology";
import { JobsPage, JobPage, CompanyPage } from "./marketplace";
import {
  PersonPicker,
  RequireRole,
  WorkspaceHome,
  ProfilePage,
  SavedPage,
  ApplyPage,
  ApplicationsPage,
  ApplicationDetail,
} from "./workspace";
import { EmployerJobs, EmployerJobEditor, CompanyEditor } from "./employer";
import { SettingsPage, PrivacyPage } from "./settings";
import { CasePage } from "./case";
function AppRoutes() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<HomePage />} />
        <Route path="oferty" element={<JobsPage />} />
        <Route path="oferty/:slug" element={<JobPage />} />
        <Route path="firmy/:slug" element={<CompanyPage />} />
        <Route path="metodologia" element={<MethodologyPage />} />
        <Route path="polityka-prywatnosci" element={<PrivacyPage />} />
        <Route path="auth/:mode" element={<PersonPicker />} />
        <Route
          path="aplikuj/:slug"
          element={
            <RequireRole role="candidate">
              <ApplyPage />
            </RequireRole>
          }
        />
        <Route
          path="app"
          element={
            <RequireRole>
              <WorkspaceHome />
            </RequireRole>
          }
        />
        <Route path="app/onboarding" element={<Navigate to="/app/profil" replace />} />
        <Route
          path="app/profil"
          element={
            <RequireRole role="candidate">
              <ProfilePage />
            </RequireRole>
          }
        />
        <Route
          path="app/profil/podglad"
          element={
            <RequireRole role="candidate">
              <ProfilePage preview />
            </RequireRole>
          }
        />
        <Route
          path="app/zapisane"
          element={
            <RequireRole role="candidate">
              <SavedPage />
            </RequireRole>
          }
        />
        <Route
          path="app/aplikacje"
          element={
            <RequireRole role="candidate">
              <ApplicationsPage />
            </RequireRole>
          }
        />
        <Route
          path="app/aplikacje/:id"
          element={
            <RequireRole role="candidate">
              <ApplicationDetail />
            </RequireRole>
          }
        />
        <Route
          path="app/aplikacje/:id/wyslano"
          element={
            <RequireRole role="candidate">
              <ApplicationDetail />
            </RequireRole>
          }
        />
        <Route
          path="app/oferty"
          element={
            <RequireRole role="employer">
              <EmployerJobs />
            </RequireRole>
          }
        />
        <Route
          path="app/oferty/:id"
          element={
            <RequireRole role="employer">
              <EmployerJobEditor />
            </RequireRole>
          }
        />
        <Route
          path="app/organizacja"
          element={
            <RequireRole role="employer">
              <CompanyEditor />
            </RequireRole>
          }
        />
        <Route
          path="app/kandydaci"
          element={
            <RequireRole role="employer">
              <ApplicationsPage employer />
            </RequireRole>
          }
        />
        <Route
          path="app/kandydaci/:id"
          element={
            <RequireRole role="employer">
              <ApplicationDetail employer />
            </RequireRole>
          }
        />
        <Route
          path="app/case"
          element={
            <RequireRole role="operator">
              <CasePage />
            </RequireRole>
          }
        />
        <Route path="app/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
export class PrototypeErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    // Deliberately do not log private free text or user input (AGENTS.md standard).
  }
  render() {
    if (this.state.hasError) {
      return (
        <main className="prototype-section max-w-2xl p-6">
          <h1>Wystąpił nieoczekiwany błąd wyświetlania</h1>
          <p className="my-4">
            Aplikacja napotkała błąd techniczny. Twoje dane zapisane w tej przeglądarce pozostały
            nienaruszone i nie zostały nigdzie wysłane.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#/app/settings"
              onClick={() => this.setState({ hasError: false })}
              className="underline"
            >
              Przejdź do ustawień i eksportu danych
            </a>
            <button type="button" onClick={() => window.location.reload()} className="underline">
              Odśwież stronę
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <PrototypeErrorBoundary>
      <PrototypeProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </PrototypeProvider>
    </PrototypeErrorBoundary>
  );
}
