// NUEVO ARCHIVO: components/RequireRole.tsx
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasRole, isAuthed } from '@/lib/auth';

type Props = {
    allow: string[]; // ejemplo: ['gerente', 'encargado']
    children: ReactNode;
    };

    export default function RequireRole({ allow, children }: Props) {
    const navigate = useNavigate();

    // si no hay token -> mandar a login
    if (!isAuthed()) {
        navigate('/login'); // NUEVO
        return null;
    }

    // si no tiene rol permitido -> mandar a /home
    const ok = hasRole(...allow);
    if (!ok) {
        navigate('/home'); // NUEVO
        return null;
    }

    return <>{children}</>;
    }
