import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => (
  <div className="container-page py-20 text-center">
    <p className="eyebrow">Page not found</p>
    <h1 className="mt-3 text-4xl">We couldn’t find that page</h1>
    <p className="mx-auto mt-4 max-w-lg text-lg text-ink-muted">
      The link may be out of date, or the address may have a typo.
    </p>
    <Link to="/" className="btn-primary mt-8">
      Go to the home page
    </Link>
  </div>
);
