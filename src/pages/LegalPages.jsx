import { Link } from 'react-router-dom';
import { usePageSeo } from '../seo/use-page-seo.js';

const lastUpdated = '13 August 2026';
const contactPage = <Link to="/contact">Contact page</Link>;

const policies = {
  privacy: {
    title: 'Privacy Policy',
    path: '/privacy-policy',
    description: 'How A Plus ICT collects, uses and protects student and customer information.',
    sections: [
      [
        'About this policy',
        <>
          A Plus ICT is an online educational service operated by Miracle Network &amp; Solutions
          (Pvt) Ltd. This policy applies when you visit the website, create an account, learn, make
          a purchase, or contact us.
        </>
      ],
      [
        'Information we collect',
        <>
          <p>
            We collect information needed to operate the platform and provide educational services.
            Depending on how you use A Plus ICT, this may include:
          </p>
          <ul>
            <li>your name, email address, telephone number, account and profile information;</li>
            <li>
              student profile details and parent or guardian contact information where provided;
            </li>
            <li>
              course enrolment, lesson access, learning progress, quiz and assignment information;
            </li>
            <li>
              order, transaction, payment-reference and submitted payment-evidence information; and
            </li>
            <li>support communications and device, browser, IP-address and security records.</li>
          </ul>
        </>
      ],
      [
        'Payments',
        <>
          Online payments may be processed through PayHere or another authorised payment provider
          made available by A Plus ICT. Sensitive payment credentials, including full card numbers
          and CVV details, are handled through the payment provider&apos;s systems; A Plus ICT does
          not store them.
        </>
      ],
      [
        'How we use information',
        <>
          We use information to create and manage student accounts, provide course and lesson
          access, process and investigate orders, maintain learning and access records, provide
          support, prevent fraud and misuse, administer and improve the platform, send important
          account or service communications, and meet applicable legal, accounting or regulatory
          obligations.
        </>
      ],
      [
        'Sharing information',
        <>
          We do not sell personal information. We share it only where necessary with providers for
          payment processing, hosting and infrastructure, email or SMS delivery where used, or
          technical services, and with authorities where legally required.
        </>
      ],
      [
        'Cookies and technical data',
        <>
          We use essential cookies and similar session technologies for sign-in, authentication,
          security and website operation. Technical information may also help us protect the
          platform and investigate misuse. We do not use this policy to claim advertising or
          analytics tracking that is not part of the service.
        </>
      ],
      [
        'Data security and retention',
        <>
          We use reasonable technical and organisational safeguards to protect information, although
          no internet system can guarantee absolute security. Information is retained only for as
          long as reasonably necessary to provide services, maintain account or order records,
          protect the platform, and meet legal or accounting requirements.
        </>
      ],
      [
        'Your requests',
        <>
          You may contact A Plus ICT through the official details on our {contactPage} to correct
          account information, ask privacy questions, or make a reasonable request relating to your
          personal information. As the platform supports school students, students and parents or
          guardians are encouraged to contact us when they need help.
        </>
      ]
    ]
  },
  terms: {
    title: 'Terms & Conditions',
    path: '/terms-and-conditions',
    description: 'Terms and Conditions for A Plus ICT educational services and purchases.',
    sections: [
      [
        'About A Plus ICT',
        <>
          A Plus ICT is an online educational service operated by Miracle Network &amp; Solutions
          (Pvt) Ltd. It provides ICT education, including free and paid lessons, LMS/course access,
          recorded lessons, digital resources, PDFs/tutorials, and printed materials where offered.
        </>
      ],
      [
        'Acceptance of terms',
        <>
          By using the website or an A Plus ICT account, or by purchasing a service, you agree to
          these Terms and our <Link to="/privacy-policy">Privacy Policy</Link>.
        </>
      ],
      [
        'Accounts',
        <>
          Users must provide accurate information, protect their login credentials and not share
          accounts with unauthorised persons. Users are responsible for activity carried out using
          their accounts, subject to applicable law and relevant security circumstances.
        </>
      ],
      [
        'Student and educational use',
        <>
          The platform provides educational materials intended to support learning. A Plus ICT does
          not guarantee examination results, grades, admission or any other academic outcome.
        </>
      ],
      [
        'Course and lesson access',
        <>
          Free and paid content may be offered. Paid content requires successful purchase or
          enrolment. Access periods, included content and delivery details follow the information
          shown at the time of purchase. Course structures and content may be reasonably updated as
          educational requirements evolve.
        </>
      ],
      [
        'Pricing',
        <>
          Prices are displayed in the applicable currency, typically LKR where shown. The current
          price displayed at checkout governs a completed transaction, subject to correction of
          obvious system errors. Promotions or discounts may have separate conditions, and prices
          may change for future purchases without changing an already completed valid purchase.
        </>
      ],
      [
        'Payments',
        <>
          Online payments may be processed using PayHere or other authorised payment providers made
          available by A Plus ICT. Users must provide accurate transaction information. An order or
          access is treated as successfully paid only when payment confirmation is received through
          the application&apos;s payment flow. Payment data may be handled by the payment processor.
          Fraudulent or unauthorised transactions may be investigated and access may be suspended
          where reasonably necessary.
        </>
      ],
      [
        'Refunds and printed materials',
        <>
          Refunds are handled under our <Link to="/refund-policy">Refund Policy</Link>. Where
          printed materials are offered, availability, delivery information, and damaged or
          incorrect-item review follow the relevant product information and that policy.
        </>
      ],
      [
        'Intellectual property',
        <>
          Videos, recorded lessons, PDFs, tutorials, questions, explanations, graphics, website
          content, course materials and A Plus ICT branding are protected. Purchase provides a
          personal educational right to use content, not ownership of it. Except where applicable
          law permits, you must not copy, record, redistribute, resell, publicly upload, republish
          or share paid materials or accounts.
        </>
      ],
      [
        'Acceptable use',
        <>
          You must not gain unauthorised access, attack or attempt to compromise the platform,
          scrape protected paid content, misuse accounts, make fraudulent payments, or redistribute
          protected course material.
        </>
      ],
      [
        'Service availability and third parties',
        <>
          We make reasonable efforts to keep the service available, but maintenance, network issues,
          hosting failures, security work, third-party services and circumstances outside our
          reasonable control may cause temporary interruptions. Parts of the service may depend on
          payment, video or content-hosting, infrastructure and other service providers.
        </>
      ],
      [
        'Limitation of liability',
        <>
          To the extent permitted by law, A Plus ICT is not responsible for indirect or
          consequential loss arising from use of the service. Nothing in these Terms excludes rights
          or liabilities that cannot lawfully be excluded.
        </>
      ],
      [
        'Suspension and termination',
        <>
          We may reasonably suspend or terminate access for fraudulent activity, a significant
          breach of these Terms, unauthorised content sharing, security threats or abuse of the
          service.
        </>
      ],
      [
        'Changes and governing law',
        <>
          These Terms may be updated from time to time and this page will show the revised
          last-updated date. They are governed by the applicable laws of Sri Lanka.
        </>
      ],
      [
        'Contact',
        <>
          Questions about these Terms can be sent through the official details on our {contactPage}.
        </>
      ]
    ]
  },
  refund: {
    title: 'Refund Policy',
    path: '/refund-policy',
    description: 'Refund Policy for A Plus ICT courses, lessons and educational products.',
    sections: [
      [
        'Scope',
        <>
          A Plus ICT is an online educational service operated by Miracle Network &amp; Solutions
          (Pvt) Ltd. This policy applies to paid online lessons, course/LMS access, digital learning
          materials, other educational products or services offered through the website, and printed
          educational materials where offered.
        </>
      ],
      [
        'Digital course and lesson access',
        <>
          Digital educational content may become available immediately after successful payment.
          Once course or lesson access is successfully activated and the content has been accessed,
          refunds are generally not provided merely because a customer changes their mind, no longer
          wishes to study, does not complete a course, or does not use the purchased access. This
          does not limit rights available under applicable law.
        </>
      ],
      [
        'Eligible refund situations',
        <>
          <p>After review, a refund request may be considered where there is:</p>
          <ul>
            <li>a duplicate payment;</li>
            <li>an incorrect amount caused by a system or payment error;</li>
            <li>a successful payment where the purchased access cannot be provided;</li>
            <li>
              a significant technical failure attributable to A Plus ICT that prevents delivery and
              cannot reasonably be resolved; or
            </li>
            <li>another case A Plus ICT determines is valid after review.</li>
          </ul>
        </>
      ],
      [
        'Failed or pending payments',
        <>
          A failed payment does not create successful course access. If a payment appears deducted
          but has not been confirmed, please request verification first and do not repeatedly make
          payments while the status is uncertain. A Plus ICT may verify the transaction with PayHere
          or the relevant payment provider before taking further action.
        </>
      ],
      [
        'Printed materials',
        <>
          Where printed tutorials or materials are offered, cancellation before dispatch may be
          possible where reasonably practical. Damaged or incorrect items should be reported
          promptly for replacement or refund review. Delivery or shipping charges, where applicable,
          are reviewed according to the order and applicable law.
        </>
      ],
      [
        'Requesting a refund',
        <>
          Contact A Plus ICT through the official details on our {contactPage}, normally within 7
          days of the transaction. Please include your name, registered email address or telephone
          number, order or reference number, payment reference, course or lesson purchased, and the
          reason for the request. We investigate duplicate-payment, incorrect-charge and
          failed-delivery issues even where they become apparent later.
        </>
      ],
      [
        'Refund processing',
        <>
          Approved refunds are normally returned through the appropriate or original payment method
          where supported. Banking or payment-provider processing times may apply after A Plus ICT
          initiates an approved refund.
        </>
      ]
    ]
  }
};

const LegalPage = ({ kind }) => {
  const policy = policies[kind];
  usePageSeo({ title: policy.title, description: policy.description, path: policy.path });

  return (
    <article className="prose-page legal-policy-page">
      <h1>{policy.title}</h1>
      <p className="legal-last-updated">Last updated: {lastUpdated}</p>
      {policy.sections.map(([heading, content]) => (
        <section key={heading}>
          <h2>{heading}</h2>
          <div>{content}</div>
        </section>
      ))}
    </article>
  );
};

export const PrivacyPolicyPage = () => <LegalPage kind="privacy" />;
export const TermsPage = () => <LegalPage kind="terms" />;
export const RefundPolicyPage = () => <LegalPage kind="refund" />;
