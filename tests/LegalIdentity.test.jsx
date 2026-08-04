import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { contentApi } from '../src/api/content.api.js';
import { AuthContext } from '../src/auth/auth-context.jsx';
import { PublicFooter } from '../src/components/layout/PublicFooter.jsx';
import { CancellationPolicyPage, PaymentPolicyPage, PrivacyPolicyPage, RefundPolicyPage, TermsPage } from '../src/pages/LegalPages.jsx';

const identity = { brandName: 'A Plus ICT', legalBusinessName: 'Miracle Network and Solutions (Pvt) Ltd', companyRegistrationNumber: 'PV00201205', relationshipStatement: 'A Plus ICT is an educational project of Miracle Network and Solutions (Pvt) Ltd.', registeredAddress: { line1: 'No 6B, Spring Field', line2: 'Galahitiyawa', city: 'Kuliyapitiya', country: 'Sri Lanka' }, contactChannels: [], socialLinks: [] };
const wrap = (ui) => render(<MemoryRouter><AuthContext.Provider value={{ isAuthenticated: false, user: null }}><QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider></AuthContext.Provider></MemoryRouter>);

test('footer shows the brand and central legal identity', async () => {
  vi.spyOn(contentApi, 'siteProfile').mockResolvedValue({ data: identity });
  wrap(<PublicFooter />);
  expect(await screen.findByText(identity.relationshipStatement)).toBeInTheDocument();
  expect(screen.getByText('Company Registration No: PV00201205')).toBeInTheDocument();
  expect(screen.getByText(/No 6B, Spring Field/)).toBeInTheDocument();
});

test.each([[PrivacyPolicyPage, 'Privacy Policy'], [TermsPage, 'Terms and Conditions'], [RefundPolicyPage, 'Refund Policy'], [CancellationPolicyPage, 'Cancellation Policy'], [PaymentPolicyPage, 'Payment Policy']])('%s renders its required policy route content', (Page, title) => {
  vi.spyOn(contentApi, 'siteProfile').mockResolvedValue({ data: identity });
  wrap(<Page />);
  expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
});
