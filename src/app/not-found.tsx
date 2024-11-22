'use client';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8 rounded-lg">
        <h1 className="text-4xl font-bold text-[#0052CC] mb-4">404</h1>
        <p className="text-gray-600 mb-4">Page not found</p>
        <a 
          href="/"
          className="text-[#0052CC] hover:underline"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
} 