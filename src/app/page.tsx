'use client';

import { useState, useRef } from 'react';
import CompanySearch from '@/components/CompanySearch';
import RoleSelector from '@/components/RoleSelector';
import ContactList from '@/components/ContactList';
import ExportTable from '@/components/ExportTable';

function downloadCSV(rows: string[][], filename: string) {
  const csvContent = rows.map(row => row.map(field => `"${(field || '').replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function EmailVerifySection() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/verify-email?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data.is_deliverable);
      } else {
        setError('Failed to verify email');
      }
    } catch (e) {
      setError('Failed to verify email');
    }
    setLoading(false);
  };

  return (
    <div className="my-8 p-4 border rounded bg-white max-w-xl mx-auto">
      <h3 className="font-bold mb-2">Check Email Deliverability</h3>
      <div className="flex gap-2 items-center">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="px-2 py-1 border rounded text-black flex-1"
        />
        <button
          onClick={handleVerify}
          disabled={!email || loading}
          className="px-4 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Verify
        </button>
      </div>
      {loading && <div className="mt-2 text-blue-600">Checking...</div>}
      {result !== null && (
        <div className="mt-2">
          Deliverable: {result ? <span className="text-green-700 font-semibold">Yes</span> : <span className="text-red-700 font-semibold">No</span>}
        </div>
      )}
      {error && <div className="mt-2 text-red-600">{error}</div>}
    </div>
  );
}

export default function Home() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [exportContacts, setExportContacts] = useState<any[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [findEmailProgress, setFindEmailProgress] = useState<number>(0);
  const [findEmailTotal, setFindEmailTotal] = useState<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [domain, setDomain] = useState('');
  const [emailChoice, setEmailChoice] = useState<{contactId: string, emails: string[]} | null>(null);

  const handleCompanySearch = async (companyName: string, limit: number, domainValue?: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setContacts([]);
    setError(null);
    setLoading(true);
    setStreaming(false);
    if (!companyName || selectedRoles.length === 0) {
      setLoading(false);
      return;
    }
    const roleQuery = selectedRoles.map(r => r.replace(/_/g, ' ')).join(' OR ');
    const query = encodeURIComponent(`${roleQuery} ${companyName}`);
    const url = `http://127.0.0.1:8000/search?query=${query}&limit=${limit}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;
    setStreaming(true);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setContacts(prev => [...prev, {
          ...data,
          id: data.profile_url || data.name || (data.first_name + data.last_name),
          name: data.first_name + ' ' + data.last_name,
        }]);
        setLoading(false);
      } catch (e) {
        // Ignore parse errors
      }
    };
    eventSource.onerror = () => {
      setError('Failed to fetch results. Please try again.');
      setLoading(false);
      setStreaming(false);
      eventSource.close();
    };
    eventSource.onopen = () => {
      setLoading(false);
    };
  };

  const handleRoleSelect = (roles: string[]) => {
    setSelectedRoles(roles);
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContactIds(prev => prev.includes(contactId)
      ? prev.filter(id => id !== contactId)
      : [...prev, contactId]);
  };

  const handleSelectAllContacts = () => {
    if (selectedContactIds.length === contacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(contacts.map(c => c.id));
    }
  };

  const handleFindEmail = async (source: 'mailscout' | 'hunter') => {
    setFindEmailProgress(0);
    setFindEmailTotal(selectedContactIds.length);
    for (let i = 0; i < selectedContactIds.length; i++) {
      const contact = contacts.find(c => c.id === selectedContactIds[i]);
      if (!contact) continue;
      let url = `http://127.0.0.1:8000/find-email?first_name=${encodeURIComponent(contact.first_name)}&last_name=${encodeURIComponent(contact.last_name)}&company=${encodeURIComponent(contact.company || contact.current_org || '')}&source=${source}`;
      if (source === 'mailscout') {
        if (!domain) {
          alert('Domain is required for mailscout');
          setFindEmailProgress(0);
          setFindEmailTotal(0);
          return;
        }
        url += `&domain=${encodeURIComponent(domain)}`;
      }
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.emails)) {
            if (data.emails.length === 1) {
              setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, emails: data.emails, email: data.emails[0], emailStatus: data.status, emailScore: data.score, domain: data.domain, is_deliverable: data.is_deliverable } : c));
            } else if (data.emails.length > 1) {
              setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, emails: data.emails, emailStatus: data.status, emailScore: data.score, domain: data.domain, is_deliverable: data.is_deliverable } : c));
            }
          }
        }
      } catch (e) {}
      setFindEmailProgress(i + 1);
    }
    setTimeout(() => {
      setFindEmailProgress(0);
      setFindEmailTotal(0);
    }, 1000);
  };

  const handlePickEmail = (email: string) => {
    if (!emailChoice) return;
    setContacts(prev => prev.map(c => c.id === emailChoice.contactId ? { ...c, email } : c));
    setEmailChoice(null);
    setFindEmailProgress(p => p + 1);
  };

  const handleAddToExport = (contactIds: string[]) => {
    let newExports: any[] = [];
    contactIds.forEach(contactId => {
      const contact = contacts.find((c) => c.id === contactId);
      if (!contact) return;
      if (Array.isArray(contact.emails) && contact.emails.length > 0) {
        contact.emails.forEach((email: string) => {
          if (!exportContacts.some(ec => ec.id === contactId && ec.email === email)) {
            newExports.push({
              id: contact.id,
              first_name: contact.first_name,
              last_name: contact.last_name,
              title: contact.title || '',
              company: contact.company || contact.current_org || '',
              linkedInUrl: contact.linkedInUrl || contact.profile_url || '',
              email,
              emailStatus: contact.emailStatus,
            });
          }
        });
      } else if (contact.email && !exportContacts.some(ec => ec.id === contactId && ec.email === contact.email)) {
        newExports.push({
          id: contact.id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          title: contact.title || '',
          company: contact.company || contact.current_org || '',
          linkedInUrl: contact.linkedInUrl || contact.profile_url || '',
          email: contact.email,
          emailStatus: contact.emailStatus,
        });
      }
    });
    if (newExports.length > 0) {
      setExportContacts(prev => [...prev, ...newExports]);
    }
  };

  const handleRemoveFromExport = (contactId: string) => {
    setExportContacts(prev => prev.filter((c) => c.id !== contactId));
  };

  const handleExport = () => {
    const rows = [
      ['Person Linkedin Url', 'Title', 'Company', 'Email'],
      ...exportContacts.map(c => [c.linkedInUrl, c.title, c.company, c.email])
    ];
    downloadCSV(rows, 'exported_contacts.csv');
  };

  const handleExportAll = () => {
    const rows = [
      ['Person Linkedin Url', 'Title', 'Company', 'Email'],
      ...contacts.flatMap(c =>
        Array.isArray(c.emails) && c.emails.length > 0
          ? c.emails.map((email: string) => [c.linkedInUrl || c.profile_url, c.title || '', c.company || c.current_org || '', email])
          : [[c.linkedInUrl || c.profile_url, c.title || '', c.company || c.current_org || '', c.email || '']]
      )
    ];
    downloadCSV(rows, 'all_contacts.csv');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <EmailVerifySection />
        <div className="px-4 py-6 sm:px-0">
          <CompanySearch onSearch={handleCompanySearch} domain={domain} setDomain={setDomain} />
          <div className="mt-8">
            <RoleSelector onRoleSelect={handleRoleSelect} />
          </div>
          {error && (
            <div className="mt-4 text-red-600 font-semibold">{error}</div>
          )}
          {loading && (
            <div className="mt-4 flex items-center space-x-2 text-blue-600">
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span>Loading search results...</span>
            </div>
          )}
          <ContactList
            contacts={contacts}
            selectedContactIds={selectedContactIds}
            onSelectContact={handleSelectContact}
            onSelectAllContacts={handleSelectAllContacts}
            onFindEmailHunter={() => handleFindEmail('hunter')}
            onFindEmailMailscout={() => handleFindEmail('mailscout')}
            findEmailProgress={findEmailProgress}
            findEmailTotal={findEmailTotal}
            onAddSelectedToExport={handleAddToExport}
          />
          {emailChoice && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow max-w-md w-full">
                <h4 className="font-bold mb-2">Select Email for {contacts.find(c => c.id === emailChoice.contactId)?.first_name} {contacts.find(c => c.id === emailChoice.contactId)?.last_name}</h4>
                <ul className="mb-4">
                  {emailChoice.emails.map(email => (
                    <li key={email} className="mb-2">
                      <button className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => handlePickEmail(email)}>{email}</button>
                    </li>
                  ))}
                </ul>
                <button className="mt-2 text-gray-600 underline" onClick={() => setEmailChoice(null)}>Cancel</button>
              </div>
            </div>
          )}
          {streaming && contacts.length > 0 && (
            <div className="mt-2 flex items-center space-x-2 text-gray-500 justify-center">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span>Waiting for more results...</span>
            </div>
          )}
          <ExportTable
            contacts={exportContacts}
            onRemove={handleRemoveFromExport}
            onExport={handleExport}
            onExportAll={handleExportAll}
          />
        </div>
      </main>
    </div>
  );
}
