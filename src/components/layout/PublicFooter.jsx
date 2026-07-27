import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contentApi } from '../../api/content.api.js';
import { queryKeys } from '../../api/query-keys.js';
import { useAuth } from '../../auth/auth-context.jsx';
import { destinationForUser } from '../../utils/route-destination.js';

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
          <h2>{data?.brandName || 'A Plus ICT'}</h2>
          <p>{data?.shortDescription || 'A focused learning space for A/L ICT.'}</p>
        </section>
        <nav aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/student-guide">Student Guide</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to={isAuthenticated ? destinationForUser(user) : '/login'}>
            {isAuthenticated ? 'My Learning' : 'Continue with Google'}
          </Link>
        </nav>
        {data?.socialLinks?.length ? (
          <nav aria-label="Social links">
            {data.socialLinks.map((item) => (
              <a href={item.url} key={item.id}>
                {item.label}
              </a>
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
