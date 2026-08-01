import { usePageSeo } from '../seo/use-page-seo.js';

const LegalPage = ({ kind }) => {
  const privacy = kind === 'privacy';
  const title = privacy ? 'Privacy Policy' : 'Terms of Use';
  usePageSeo({
    title: `${title} | A Plus ICT`,
    description: `${title} for A Plus ICT students and visitors.`,
    path: privacy ? '/privacy-policy' : '/terms'
  });
  return <section className="prose-page"><h1>{title}</h1><p>This page explains the current terms for using A Plus ICT. Detailed policy content will be maintained by the platform owner.</p></section>;
};

export const PrivacyPolicyPage = () => <LegalPage kind="privacy" />;
export const TermsPage = () => <LegalPage kind="terms" />;
