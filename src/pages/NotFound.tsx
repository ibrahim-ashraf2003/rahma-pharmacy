import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 text-center">
      <SEO title="Page Not Found" />
      <h1 className="text-9xl font-black font-headline text-gray-200 select-none">404</h1>
      <h2 className="text-3xl font-bold uppercase tracking-tighter mt-4 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you are looking for does not exist, has been removed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="h-14 px-8 bg-black text-white rounded-2xl flex items-center justify-center font-bold uppercase tracking-widest hover:bg-tertiary transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
