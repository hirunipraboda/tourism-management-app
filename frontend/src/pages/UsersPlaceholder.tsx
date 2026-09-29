import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { MOCK_USERS } from '../mock/users';
import { TableColumn } from '../types/ui';
import { User } from '../types/auth';

export const UsersPlaceholder: React.FC = () => {
  const columns: TableColumn<User>[] = [
    {
      key: 'name',
      header: 'User Account',
      render: item => (
        <div className="flex items-center gap-3">
          <Avatar src={item.avatarUrl} name={item.name} size="md" />
          <div>
            <h4 className="font-bold text-slate-900">{item.name}</h4>
            <span className="text-xs text-slate-400">{item.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: item => (
        <span className="font-extrabold text-[#0B3A53] bg-slate-100 px-2.5 py-1 rounded-md text-xs">
          {item.role}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: item => <span className="text-xs text-slate-600">{item.department || 'General'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: item => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="User & Access Management"
        subtitle="Manage operators, administrators, guides, and platform roles"
        breadcrumbs={[{ label: 'Users' }]}
        actions={
          <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
            Invite User
          </Button>
        }
      />
      <Table columns={columns} data={MOCK_USERS} keyExtractor={item => item.id} />
    </PageContainer>
  );
};
