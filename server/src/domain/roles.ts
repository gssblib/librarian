import { AuthRole, AuthRoleRepository } from './auth';

const crud = ['create', 'read', 'update', 'delete'];

export const roleRepository: AuthRoleRepository = new Map<string, AuthRole>([
  ['anonymous', {permissions: []}],
  [
    'borrower',
    {
      permissions: [
        {
          resource: 'items',
          operations: ['read'],
        },
        {
          resource: 'ordercycles',
          operations: ['read'],
        },
        {
          resource: 'profile',
          operations: ['read'],
        },
        {
          resource: 'items',
          operations: ['order'],
          restrictions: [
            (user, permission, action) => {
              return parseInt(user.id, 10) ===
                  parseInt(action.params.borrower, 10);
            },
          ],
        },
      ]
    },
  ],
  [
    'clerk',
    {
      permissions: [
        {
          resource: 'items',
          operations: ['read', 'checkin', 'checkout', 'renew'],
        },
        {
          resource: 'borrowers',
          operations: ['read', 'payFees', 'renewAllItems'],
        },
      ]
    },
  ],
  [
    'librarian',
    {
      permissions: [
        {
          resource: 'items',
          operations: [...crud, 'checkin', 'checkout', 'renew', 'order'],
        },
        {
          resource: 'borrowers',
          operations: [...crud, 'payFees', 'renewAllItems', 'sendEmail'],
        },
        {
          resource: 'fees',
          operations: crud,
        },
        {
          resource: 'checkouts',
          operations: crud,
        },
        {
          resource: 'reports',
          operations: crud,
        },
        {
          resource: 'ordercycles',
          operations: crud,
        },
        {
          resource: 'orders',
          operations: crud,
        },
      ]
    },
  ],
  [
    'admin',
    {
      permissions: [
        {
          resource: 'users',
          operations: crud,
        },
        {
          resource: 'admin',
          operations: ['sync_antolin', 'load_families'],
        },
        {
          resource: 'labels_print_queue',
          operations: crud,
        },
      ]
    },
  ],
  [
    'printer',
    {
      permissions: [
        {
          resource: 'labels_print_queue',
          operations: crud,
        },
      ]
    },
  ],
]);
