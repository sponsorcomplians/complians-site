// TODO: RE-ENABLE AUTH
// Temporarily bypass useClientSession for development. Always return a dummy session object.
export default function useClientSession() {
  return {
    user: {
      email: 'dev@example.com',
      name: 'Dev User',
      company: 'Dev Company',
      tenant_id: 'dev-tenant-id',
      role: 'Admin',
    },
    is_email_verified: true,
  };
}
