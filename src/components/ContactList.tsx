interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  company: string;
  linkedInUrl: string;
  email?: string;
  emailStatus?: 'valid' | 'invalid' | 'pending';
  is_deliverable?: boolean;
  emails?: string[];
}

interface ContactListProps {
  contacts: Contact[];
  selectedContactIds: string[];
  onSelectContact: (contactId: string) => void;
  onSelectAllContacts: () => void;
  onFindEmailHunter: () => void;
  onFindEmailMailscout: () => void;
  findEmailProgress: number;
  findEmailTotal: number;
  onAddSelectedToExport: (contactIds: string[]) => void;
}

export default function ContactList({
  contacts,
  selectedContactIds,
  onSelectContact,
  onSelectAllContacts,
  onFindEmailHunter,
  onFindEmailMailscout,
  findEmailProgress,
  findEmailTotal,
  onAddSelectedToExport
}: ContactListProps) {
  return (
    <div className="mt-8">
      <div className="flex flex-col">
        <div className="mb-2 flex items-center gap-4">
          <button
            onClick={onFindEmailHunter}
            disabled={selectedContactIds.length === 0 || findEmailProgress > 0}
            className={`px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50`}
          >
            Find Email (Hunter)
          </button>
          <button
            onClick={onFindEmailMailscout}
            disabled={selectedContactIds.length === 0 || findEmailProgress > 0}
            className={`px-4 py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50`}
          >
            Find Email (Mailscout)
          </button>
          <button
            onClick={() => onAddSelectedToExport(selectedContactIds)}
            disabled={selectedContactIds.length === 0}
            className="px-4 py-2 rounded bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            Add Selected to Export
          </button>
          {findEmailProgress > 0 && (
            <span className="text-sm text-gray-600">Finding emails: {findEmailProgress} / {findEmailTotal}</span>
          )}
        </div>
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedContactIds.length === contacts.length && contacts.length > 0}
                        onChange={onSelectAllContacts}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deliverable
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedContactIds.includes(contact.id)}
                          onChange={() => onSelectContact(contact.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            <a
                              href={contact.linkedInUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              {contact.first_name} {contact.last_name}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{contact.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{contact.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Array.isArray(contact.emails) && contact.emails.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {contact.emails.map((email, idx) => (
                                <span key={email} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${contact.emailStatus === 'valid' ? 'bg-green-100 text-green-800' :
                                    contact.emailStatus === 'invalid' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'}`}
                                >
                                  {email}
                                </span>
                              ))}
                            </div>
                          ) : contact.email ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${contact.emailStatus === 'valid' ? 'bg-green-100 text-green-800' :
                                contact.emailStatus === 'invalid' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}`}
                            >
                              {contact.email}
                            </span>
                          ) : (
                            <span className="text-gray-500">Not found</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {contact.email ? (
                            contact.is_deliverable === true ? (
                              <span className="text-green-700 font-semibold">Yes</span>
                            ) : contact.is_deliverable === false ? (
                              <span className="text-red-700 font-semibold">No</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {/* No actions column anymore */}
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