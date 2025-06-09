"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MagicLoginPage() {
    const params = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const token = params.get('token');
        if (!token) return;
        fetch('/api/customerMagicLogin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        })
            .then(res => {
                if (res.ok) router.push('/account');
                else router.push('/customer-login');
            })
            .catch(() => router.push('/customer-login'));
    }, [params, router]);

    return <div className="p-8 text-center">Logging in...</div>;
}
