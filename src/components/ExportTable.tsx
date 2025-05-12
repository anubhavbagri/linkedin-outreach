import { useState } from 'react';

interface ExportContact {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
  email?: string;
  title: string;
  [key: string]: string | undefined;
}

interface ExportTableProps {
  contacts: ExportContact[];
  onRemove: (contactId: string, email?: string) => void;
  onExport: () => void;
  onExportAll: () => void;
  onClear: () => void;
}

const COLUMN_CONFIG = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'company', label: 'Company' },
  { key: 'title', label: 'Title' },
];

export default function ExportTable({ contacts, onRemove, onExport, onExportAll, onClear }: ExportTableProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(COLUMN_CONFIG.map(c => c.key));

  const handleToggleColumn = (key: string) => {
    setSelectedColumns(cols =>
      cols.includes(key) ? cols.filter(c => c !== key) : [...cols, key]
    );
  };

  const handleCopy = () => {
    const rows = contacts.map(row =>
      COLUMN_CONFIG.filter(c => selectedColumns.includes(c.key)).map(c => row[c.key] || '').join('\t')
    );
    const tsv = rows.join('\n');
    navigator.clipboard.writeText(tsv);
  };

  return (
    <div className="mt-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-xl font-semibold text-gray-900">Export List</h2>
          <p className="mt-2 text-sm text-gray-700">
            List of contacts to be exported
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex gap-2">
          <button
            onClick={onExport}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Export to Excel
          </button>
          <button
            onClick={onExportAll}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
          >
            Export All
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:w-auto"
          >
            Copy to Clipboard
          </button>
          <button
            onClick={onClear}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    {COLUMN_CONFIG.map(col => (
                      <th key={col.key} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={selectedColumns.includes(col.key)}
                            onChange={() => handleToggleColumn(col.key)}
                          />
                          {col.label}
                        </label>
                      </th>
                    ))}
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {contacts.map((contact, idx) => (
                    <tr key={contact.id + (contact.email || '') + idx}>
                      {COLUMN_CONFIG.map(col => (
                        <td key={col.key} className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {contact[col.key] || ''}
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        <button
                          onClick={() => onRemove(contact.id, contact.email)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}