import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Router } from './Router.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { OrganizationProvider } from './hooks/organizationContex.tsx'
import './index.css'

const PUBLISHABLE_KEY = 'pk_test_ZW1pbmVudC1wbGF0eXB1cy04OC5jbGVyay5hY2NvdW50cy5kZXYk'
console.log('🔐 VITE_CLERK_PUBLISHABLE_KEY:', PUBLISHABLE_KEY);
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/dashboard/organizations'>
      <BrowserRouter>
        <OrganizationProvider>
          <Router />
        </OrganizationProvider>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
)
