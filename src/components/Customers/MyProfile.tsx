import React, { useEffect, useState } from 'react';
import { useAuth } from '@payloadcms/ui';

const MyProfile: React.FC = () => {
    const { user } = useAuth();
    const [doc, setDoc] = useState<any>(null);

    useEffect(() => {
        if (!user?.id) return;

        // Example REST fetch for the customer doc by user.id
        // (assuming your API endpoint is something like /api/customers/{id})
        fetch(`/api/customers/${user.id}?depth=0`, {
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => setDoc(data))
            .catch((err) => console.error('Error fetching profile:', err));
    }, [user?.id]);

    if (!user) {
        return <div>Please log in.</div>;
    }

    if (!doc) {
        return <div>Loading your profile...</div>;
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h1>Welcome, {doc.firstname}!</h1>
            <p><strong>Email:</strong> {doc.email}</p>
            <p><strong>First Name:</strong> {doc.firstname}</p>
            <p><strong>Last Name:</strong> {doc.lastname}</p>
            <p><strong>Company:</strong> {doc.company_name || 'N/A'}</p>
        </div>
    );
};

export default MyProfile;
