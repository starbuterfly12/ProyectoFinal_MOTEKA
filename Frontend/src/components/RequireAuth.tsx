import { Navigate } from 'react-router-dom';
import { isAuthed } from '@/lib/auth';

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  if (!isAuthed()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
