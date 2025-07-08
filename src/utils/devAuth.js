import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export const requireAuth = (Component) => {
  return (props) => {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
      return <Component {...props} user={{ email: 'dev@test.com', role: 'admin' }} />;
    }
    // Normal auth check here
    const { data: session } = useSession();
    if (!session) {
      redirect('/auth/signin');
    }
    return <Component {...props} />;
  };
}; 