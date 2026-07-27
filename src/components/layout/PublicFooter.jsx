import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contentApi } from '../../api/content.api.js';
import { queryKeys } from '../../api/query-keys.js';
import { useAuth } from '../../auth/auth-context.jsx';
import { destinationForUser } from '../../utils/route-destination.js';
import { serviceUrls } from '../../api/service-urls.js';
import { BrandLogo } from './BrandLogo.jsx';

const socialGlyphs = {
  facebook: 'f',
  instagram: '◎',
  linkedin: 'in',
  tiktok: '♪',
  youtube: '▶',
  whatsapp: '◔'
};

const SocialLink = ({ item }) => {
  const glyph = socialGlyphs[item.platform?.toLowerCase()] || '↗';
  return (
    <a
      aria-label={item.label || item.platform}
      className="social-link"
      href={item.url}
      rel="noreferrer"
      target="_blank"
    >
      <span aria-hidden="true">{glyph}</span>
      <span>{item.label || item.platform}</span>
    </a>
  );
};

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
          <Link className="footer-brand" to="/">
            <BrandLogo brandName={data?.brandName} resourceId={data?.logoResourceId} />
          </Link>
          <p>{data?.shortDescription || 'A focused learning space for A/L ICT.'}</p>
        </section>
        <nav aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/student-guide">Student Guide</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          {isAuthenticated ? (
            <Link to={destinationForUser(user)}>My Learning</Link>
          ) : (
            <a href={`${serviceUrls.auth}/api/v1/auth/google?returnTo=/courses`}>
              Continue with Google
            </a>
          )}
        </nav>
        {data?.socialLinks?.length ? (
          <nav aria-label="Social links">
            {data.socialLinks.map((item) => (
              <SocialLink item={item} key={item.id} />
            ))}
          </nav>
        ) : null}
        {data?.contactChannels?.length ? (
          <section>
            <h2>Contact</h2>
            {data.contactChannels.map((item) => (
              <p key={item.id}>
                {item.publicUrl ? <a href={item.publicUrl}>{item.label}</a> : item.label}
              </p>
            ))}
          </section>
        ) : null}
      </div>
      <p>© {new Date().getFullYear()} A Plus ICT</p>
    </footer>
  );
};
