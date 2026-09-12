import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contentApi } from '../../api/content.api.js';
import { queryKeys } from '../../api/query-keys.js';
import { useAuth } from '../../auth/auth-context.jsx';
import { destinationForUser } from '../../utils/route-destination.js';
import { BrandLogo } from './BrandLogo.jsx';

const PlatformIcon = ({ platform }) => {
  const icons = {
    facebook: <path d="M14.3 8.2h2.4V4.3c-.4-.1-1.8-.2-3.3-.2-3.3 0-5.5 2-5.5 5.8v3.2H4.3v4.4h3.6V24h4.4v-6.5h3.6l.6-4.4h-4.2V10c0-1.3.4-1.8 1.6-1.8Z" />,
    youtube: <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />,
    tiktok: <path d="M15.7 2c.3 2.4 1.7 3.9 4.1 4.1v3.3a8.5 8.5 0 0 1-4.1-1.2v7.2a6.2 6.2 0 1 1-5.4-6.1v3.3a2.9 2.9 0 1 0 2.1 2.8V2h3.3Z" />,
    instagram: <path d="M7.2 0h9.6A7.2 7.2 0 0 1 24 7.2v9.6a7.2 7.2 0 0 1-7.2 7.2H7.2A7.2 7.2 0 0 1 0 16.8V7.2A7.2 7.2 0 0 1 7.2 0Zm-.3 2.4a4.5 4.5 0 0 0-4.5 4.5v10.2a4.5 4.5 0 0 0 4.5 4.5h10.2a4.5 4.5 0 0 0 4.5-4.5V6.9a4.5 4.5 0 0 0-4.5-4.5H6.9Zm11.2 1.8a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8ZM12 5.8A6.2 6.2 0 1 1 12 18.2 6.2 6.2 0 0 1 12 5.8Zm0 2.4a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />,
    whatsapp: <path d="M20.5 3.5A11.8 11.8 0 0 0 2 17.7L.5 23.5l6-1.6A11.8 11.8 0 1 0 20.5 3.5ZM12 21.4c-1.8 0-3.5-.5-5-1.5l-.4-.2-3.5.9.9-3.4-.2-.4a9.4 9.4 0 1 1 8.2 4.6Zm5.2-7.1c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.2-.6.1a7.7 7.7 0 0 1-2.3-1.4 8.6 8.6 0 0 1-1.6-2c-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.5l-1-2.3c-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.1 3 .2.3.3.5a10.6 10.6 0 0 0 4.1 3.6c.6.3 1 .5 1.4.6.6.2 1.2.2 1.6.1.5-.1 1.8-.7 2-1.4s.3-1.3.2-1.4-.2-.2-.5-.4Z"
    />
  };
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">{icons[platform] || icons.whatsapp}</svg>;
};

const SocialLink = ({ item }) => <a aria-label={item.label || item.platform} className="social-link" href={item.url} rel="noreferrer" target="_blank"><PlatformIcon platform={item.platform} /><span>{item.label || item.platform}</span></a>;

export const PublicFooter = () => {
  const { isAuthenticated, user } = useAuth();
  const profile = useQuery({ queryKey: queryKeys.content.siteProfile, queryFn: ({ signal }) => contentApi.siteProfile(signal), retry: false });
  const data = profile.data?.data;
  const socialLinks = data?.socialLinks?.filter((item) => item.url && item.url !== '#') || [];
  const address = data?.registeredAddress;
  return <footer className="footer"><div className="footer-inner"><div className="footer-grid"><section className="footer-brand-column"><Link className="footer-brand" to="/"><BrandLogo brandName={data?.brandName} variant="light" /></Link><p>Structured online ICT learning for Sri Lankan students from Grade 6 to G.C.E. A/L.</p></section><section><h2>Learn</h2><nav aria-label="Learn"><Link to="/school-ict">Grades 6–9</Link><Link to="/ol-ict">O/L ICT</Link><Link to="/al-ict">A/L ICT</Link><Link to="/resources">Free Resources</Link></nav></section><section><h2>Student Support</h2><nav aria-label="Student support"><Link to="/student-guide">Student Guide</Link>{isAuthenticated ? <Link to={destinationForUser(user)}>My Learning</Link> : <a href={`/login?returnTo=/`}>My Learning</a>}<Link to="/contact">Contact</Link></nav></section><section><h2>Contact</h2>{data?.contactChannels?.map((item) => <p className="footer-contact" key={item.id}>{item.publicUrl ? <a href={item.publicUrl}>{item.label}</a> : item.label}</p>)}<nav aria-label="Social links">{socialLinks.map((item) => <SocialLink item={item} key={item.id} />)}</nav></section></div><section className="footer-legal-bar">{data?.legalBusinessName ? <div className="footer-legal-copy"><h2>Operated by</h2><p><strong>{data.legalBusinessName}</strong><br />Company Registration No: {data.companyRegistrationNumber}<br />{address?.line1}, {address?.line2}, {address?.city}, {address?.country}</p><p>{data.relationshipStatement}</p></div> : <div className="footer-legal-copy"><h2>Operated by</h2><p><strong>Miracle Network &amp; Solutions (Pvt) Ltd</strong><br />A Plus ICT is an online educational service.</p></div>}<nav aria-label="Legal policies" className="footer-policy-links"><Link to="/privacy-policy">Privacy Policy</Link><Link to="/terms-and-conditions">Terms &amp; Conditions</Link><Link to="/refund-policy">Refund Policy</Link></nav></section><p className="footer-copyright">© 2026 Miracle Network &amp; Solutions (Pvt) Ltd. All rights reserved.</p></div></footer>;
};
