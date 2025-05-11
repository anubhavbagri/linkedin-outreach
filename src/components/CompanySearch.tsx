'use client';

import { useState } from 'react';

interface CompanySearchProps {
  onSearch: (companyName: string, limit: number, domain?: string) => void;
  domain: string;
  setDomain: (domain: string) => void;
}

export default function CompanySearch({ onSearch, domain, setDomain }: CompanySearchProps) {
  const [companyName, setCompanyName] = useState('');
  const [limit, setLimit] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(companyName, limit, domain);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <div className="mt-1 flex rounded-md shadow-sm gap-2">
            <input
              type="text"
              name="company"
              id="company"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Enter company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <input
              type="text"
              name="domain"
              id="domain"
              className="w-40 px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Domain (e.g. example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <input
              type="number"
              name="limit"
              id="limit"
              min={1}
              max={100}
              className="w-20 px-2 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-black"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Limit (default 10). Domain is required for mailscout.</p>
        </div>
      </form>
    </div>
  );
}