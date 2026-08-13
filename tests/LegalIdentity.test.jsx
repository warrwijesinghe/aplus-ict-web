import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { contentApi } from '../src/api/content.api.js';
import { AuthContext } from '../src/auth/auth-context.jsx';
import { PublicFooter } from '../src/components/layout/PublicFooter.jsx';
import { PrivacyPolicyPage, RefundPolicyPage, TermsPage } from '../src/pages/LegalPages.jsx';

const identity = { brandName: 'A Plus ICT', legalBusinessName: 'Miracle Network and Solutions (Pvt) Ltd', companyRegistrationNumber: 'PV00201205', relationshipStatement: 'A Plus ICT is an educational project of Miracle Network and Solutions (Pvt) Ltd.', registeredAddress: { line1: 'No 6B, Spring Field', line2: 'Galahitiyawa', city: 'Kuliyapitiya', country: 'Sri Lanka' }, contactChannels: [{ id: 'whatsapp-contact', label: 'WhatsApp: 071 710 5837', publicUrl: 'https://wa.me/94717105837' }], socialLinks: [{ id: 'facebook', platform: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/APlusICTclass' }, { id: 'youtube', platform: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@aplusictclass' }, { id: 'tiktok', platform: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@aplus.ict' }, { id: 'instagram', platform: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/aplusict' }, { id: 'whatsapp', platform: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/94717105837' }] };
const wrap = (ui) => render(<MemoryRouter><AuthContext.Provider value={{ isAuthenticated: false, user: null }}><QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider></AuthContext.Provider></MemoryRouter>);

test('footer shows the brand and central legal identity', async () => {
  vi.spyOn(contentApi, 'siteProfile').mockResolvedValue({ data: identity });
  wrap(<PublicFooter />);
  expect(screen.getByRole('img', { name: 'A Plus ICT' })).toBeInTheDocument();
  expect(await screen.findByText(identity.relationshipStatement)).toBeInTheDocument();
  expect(screen.getByText((_, element) => element?.tagName === 'P' && element.textContent.includes('Company Registration No: PV00201205'))).toBeInTheDocument();
  expect(screen.getByText(/No 6B, Spring Field/)).toBeInTheDocument();
  expect(screen.getByText('© 2026 Miracle Network & Solutions (Pvt) Ltd. All rights reserved.')).toBeInTheDocument();
  ['Privacy Policy', 'Terms & Conditions', 'Refund Policy'].forEach((label) => expect(screen.getByRole('link', { name: label })).toBeInTheDocument());
  ['Facebook', 'YouTube', 'TikTok', 'Instagram', 'WhatsApp'].forEach((label) => expect(screen.getAllByRole('link', { name: label }).length).toBeGreaterThan(0));
  expect(document.querySelector('.social-link circle')).not.toBeInTheDocument();
  expect(document.querySelector('.footer-grid')).toHaveClass('footer-grid');
});

test.each([[PrivacyPolicyPage, 'Privacy Policy'], [TermsPage, 'Terms & Conditions'], [RefundPolicyPage, 'Refund Policy']])('%s renders its required policy route content', (Page, title) => {
  vi.spyOn(contentApi, 'siteProfile').mockResolvedValue({ data: identity });
  wrap(<Page />);
  expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
});
