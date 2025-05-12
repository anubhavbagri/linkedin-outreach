'use client';

import { useState } from "react";

interface Role {
  id: string;
  name: string;
  category: 'recruiter' | 'manager' | 'executive';
}

interface RoleSelectorProps {
  onRoleSelect: (roles: string[]) => void;
}

const AVAILABLE_ROLES: Role[] = [
  { id: 'recruiter', name: 'Recruiter', category: 'recruiter' },
  { id: 'hr', name: 'HR', category: 'recruiter' },
  { id: 'tech_talent', name: 'Tech Talent Acquisition', category: 'recruiter' },
  { id: 'hiring_manager', name: 'Hiring Manager', category: 'manager' },
  { id: 'eng_manager', name: 'Engineering Manager', category: 'manager' },
  { id: 'eng_vp', name: 'Engineering VP', category: 'manager' },
  { id: 'cto', name: 'CTO', category: 'executive' },
  { id: 'ceo', name: 'CEO', category: 'executive' },
];

export default function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const handleRoleToggle = (roleId: string) => {
    const newSelectedRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter((id: string) => id !== roleId)
      : [...selectedRoles, roleId];

    setSelectedRoles(newSelectedRoles);
    onRoleSelect(newSelectedRoles);
  };

  const handleTalentCultureToggle = () => {
    const roleId = 'talent_and_culture';
    const newSelectedRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter((id: string) => id !== roleId)
      : [...selectedRoles, roleId];
    setSelectedRoles(newSelectedRoles);
    onRoleSelect(newSelectedRoles);
  };

  const handleTalentToggle = () => {
    const roleId = 'talent';
    const newSelectedRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter((id: string) => id !== roleId)
      : [...selectedRoles, roleId];
    setSelectedRoles(newSelectedRoles);
    onRoleSelect(newSelectedRoles);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Select Roles to Search</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AVAILABLE_ROLES.map((role) => (
          <div key={role.id} className="flex items-center">
            <input
              type="checkbox"
              id={role.id}
              checked={selectedRoles.includes(role.id)}
              onChange={() => handleRoleToggle(role.id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={role.id} className="ml-2 block text-sm text-gray-900">
              {role.name}
            </label>
          </div>
        ))}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="talent_and_culture"
            checked={selectedRoles.includes('talent_and_culture')}
            onChange={handleTalentCultureToggle}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="talent_and_culture" className="ml-2 block text-sm text-gray-900">
            Talent and Culture
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="talent"
            checked={selectedRoles.includes('talent')}
            onChange={handleTalentToggle}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="talent" className="ml-2 block text-sm text-gray-900">
            Talent
          </label>
        </div>
      </div>
    </div>
  );
}