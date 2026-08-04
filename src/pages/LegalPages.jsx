import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../api/content.api.js';
import { queryKeys } from '../api/query-keys.js';
import { usePageSeo } from '../seo/use-page-seo.js';

const policies = {
  privacy: {
    title: 'Privacy Policy', path: '/privacy-policy', sections: [
      ['Information we collect', 'When you use Google sign-in, we receive the account information needed to identify your account. We may also collect student profile details, parent or guardian contact details where provided, learning progress, quiz and assignment information, order and payment information, and uploaded payment evidence where applicable.'],
      ['Why we use it', 'We use this information to provide learning access, support students and parents, maintain progress records, process and investigate orders, prevent misuse, and improve the service. Cookies or analytics may be used to understand site operation and improve the experience.'],
      ['Protection and payment processing', 'We apply reasonable technical and organisational safeguards and limit access to authorised personnel and service providers. A Plus ICT does not store card details. When online payment is enabled, card or bank payment processing may be handled by an approved third-party payment provider.'],
      ['Your choices', 'You may ask us to correct or delete information where applicable, subject to legal, security, and record-keeping requirements. Contact us through the published A Plus ICT support channel for privacy questions or requests.']
    ]
  },
  terms: {
    title: 'Terms and Conditions', path: '/terms', sections: [
      ['Eligibility and accounts', 'Students and parents must provide accurate information and protect access to their Google account. Accounts may be suspended where there is misuse, unauthorised sharing, or a breach of these terms.'],
      ['Learning access and content', 'A Plus ICT provides free and premium ICT learning content for Sri Lankan school students. Access duration, included content, and any delivery details are stated with the relevant offer. Content is licensed for personal learning only and may not be copied, shared, resold, or used to create competing materials.'],
      ['Payments and services', 'Premium access requires payment confirmation. Internet connectivity, devices, Google services, and other third-party services are outside our direct control. We may change, suspend, or discontinue content where reasonably necessary.'],
      ['Law and disputes', 'These terms are governed by the laws of Sri Lanka. Please contact A Plus ICT first with any concern so that we can try to resolve it fairly.']
    ]
  },
  refund: {
    title: 'Refund Policy', path: '/refund-policy', sections: [
      ['When a refund may be considered', 'We review duplicate payments, a confirmed payment where the purchased access was not granted, an incorrect package purchase reported promptly before use, and verified technical faults. Please provide the order number, transaction reference, payment evidence, and a clear description of the issue.'],
      ['Digital access', 'Digital premium access that has already been activated or materially accessed is normally not refundable, except where required by law or where a verified technical fault prevents delivery.'],
      ['Printed or delivered materials', 'Printed tutes or other delivered materials may be considered for cancellation or refund before dispatch. Once dispatched, refunds are not normally available unless the material is faulty or the order was fulfilled incorrectly.'],
      ['Review and payment', 'We assess eligible requests within a reasonable time and aim to process approved refunds within 7–14 business days. Refunds are normally returned to the original payment method or another appropriate method agreed with the customer; they are not instant or guaranteed before review.']
    ]
  },
  cancellation: {
    title: 'Cancellation Policy', path: '/cancellation-policy', sections: [
      ['Digital orders', 'A digital order may be cancelled before premium access is activated. After activation, cancellation is normally unavailable because the digital content has been supplied.'],
      ['Printed orders', 'An order for printed or delivered materials may be cancelled before dispatch. After dispatch, cancellation is normally unavailable except where the Refund Policy applies.'],
      ['How to request cancellation', 'Contact A Plus ICT promptly with the order number and transaction reference. A cancellation is not confirmed until we acknowledge it.']
    ]
  },
  payment: {
    title: 'Payment Policy', path: '/payment-policy', sections: [
      ['Pricing and methods', 'Prices are shown in LKR unless otherwise stated. Available payment methods are presented at checkout or in the order instructions. Payment confirmation is required before premium access is activated.'],
      ['Payment security', 'A Plus ICT does not store full card credentials. Online payments may be securely processed through an approved third-party payment provider when that option is enabled.'],
      ['Payment issues', 'Keep your transaction reference and order number. If a payment succeeds but access is not granted, contact A Plus ICT with those details and payment evidence so that we can investigate. Transaction references are used to match and review payments.']
    ]
  }
};

const LegalIdentity = () => {
  const profile = useQuery({ queryKey: queryKeys.content.siteProfile, queryFn: ({ signal }) => contentApi.siteProfile(signal), retry: false });
  const identity = profile.data?.data;
  if (!identity) return null;
  const address = identity.registeredAddress;
  return <section><h2>Service provider</h2><p><strong>{identity.legalBusinessName}</strong>, operating the {identity.brandName} educational project.</p><p>{identity.relationshipStatement}<br />Company Registration No: {identity.companyRegistrationNumber}<br />{address.line1}, {address.line2}, {address.city}, {address.country}</p></section>;
};

const LegalPage = ({ kind }) => {
  const policy = policies[kind];
  usePageSeo({ title: policy.title, description: `${policy.title} for A Plus ICT students and visitors.`, path: policy.path });
  return <section className="prose-page"><h1>{policy.title}</h1><p>Effective date: 4 August 2026</p><LegalIdentity />{policy.sections.map(([heading, content]) => <section key={heading}><h2>{heading}</h2><p>{content}</p></section>)}</section>;
};

export const PrivacyPolicyPage = () => <LegalPage kind="privacy" />;
export const TermsPage = () => <LegalPage kind="terms" />;
export const RefundPolicyPage = () => <LegalPage kind="refund" />;
export const CancellationPolicyPage = () => <LegalPage kind="cancellation" />;
export const PaymentPolicyPage = () => <LegalPage kind="payment" />;
