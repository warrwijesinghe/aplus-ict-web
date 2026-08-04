import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contentApi } from '../../api/content.api.js';
import { queryKeys } from '../../api/query-keys.js';
import { useAuth } from '../../auth/auth-context.jsx';
import { destinationForUser } from '../../utils/route-destination.js';
import { serviceUrls } from '../../api/service-urls.js';
import { BrandLogo } from './BrandLogo.jsx';

const SocialIcon = () => (
  <svg aria-hidden="true" fill="none" focusable="false" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8.5 12h7M12 8.5v7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
  </svg>
);

const SocialLink = ({ item }) => (
  <a aria-label={item.label || item.platform} className="social-link" href={item.url} rel="noreferrer" target="_blank">
    <span aria-hidden="true"><SocialIcon /></span>
    <span>{item.label || item.platform}</span>
  </a>
);

export const PublicFooter = () => {
  const { isAuthenticated, user } = useAuth();
  const profile = useQuery({
    queryKey: queryKeys.content.siteProfile,
    queryFn: ({ signal }) => contentApi.siteProfile(signal),
    retry: false
  });
  const data = profile.data?.data;
  return (
    <footer className="footer">
      <div className="footer-grid">
        <section>
          <Link className="footer-brand" to="/"><BrandLogo brandName={data?.brandName} variant="light" /></Link>
          <p>{data?.shortDescription || 'Structured Sinhala and English Medium ICT learning from Grade 6 to A/L.'}</p>
        </section>
        <section><h2>Learn</h2><nav aria-label="Learn"><Link to="/school-ict">Grades 6–9</Link><Link to="/ol-ict">O/L ICT</Link><Link to="/al-ict">A/L ICT</Link><Link to="/resources">Free Resources</Link></nav></section>
        <section><h2>Student Support</h2><nav aria-label="Student support"><Link to="/student-guide">Student Guide</Link>{isAuthenticated ? <Link to={destinationForUser(user)}>My Learning</Link> : <a href={`${serviceUrls.auth}/api/v1/auth/google?returnTo=/`}>Student Login</a>}<Link to="/contact">Contact</Link></nav></section>
        <section><h2>A Plus ICT</h2><nav aria-label="A Plus ICT"><Link to="/about">About</Link><Link to="/privacy-policy">Privacy Policy</Link><Link to="/terms">Terms and Conditions</Link><Link to="/refund-policy">Refund Policy</Link><Link to="/cancellation-policy">Cancellation Policy</Link><Link to="/payment-policy">Payment Policy</Link></nav></section>
        {data?.contactChannels?.length || data?.socialLinks?.filter((item) => item.url && item.url !== '#').length ? <section><h2>Contact</h2>{data?.contactChannels?.map((item) => <p key={item.id}>{item.publicUrl ? <a href={item.publicUrl}>{item.label}</a> : item.label}</p>)}{data?.socialLinks?.filter((item) => item.url && item.url !== '#').length ? <nav aria-label="Social links">{data.socialLinks.filter((item) => item.url && item.url !== '#').map((item) => <SocialLink item={item} key={item.id} />)}</nav> : null}</section> : null}
        {data?.legalBusinessName ? <section className="footer-legal"><h2>Legal identity</h2><p>{data.relationshipStatement}</p><p>Company Registration No: {data.companyRegistrationNumber}</p><p>{data.registeredAddress?.line1},<br />{data.registeredAddress?.line2}, {data.registeredAddress?.city},<br />{data.registeredAddress?.country}</p></section> : null}
      </div>
      <p>© {new Date().getFullYear()} A Plus ICT</p>
    </footer>
  );
};
