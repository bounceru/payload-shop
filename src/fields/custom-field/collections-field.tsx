// src/fields/custom-field/collections-field.tsx
import React from 'react';
import CollectionsAndFieldsTable from './collections-and-fields-table';

const CollectionsField = async ({ payload, doc }: { payload: any, doc: any }) => {
    // Safely get collection names from payload
    const collectionNames = payload?.collections
        ? Object.keys(payload.collections)
        : [];

    // Pass the doc (i.e. the Role doc) to our unified UI
    return (
        <CollectionsAndFieldsTable
            collectionNames={collectionNames}
            doc={doc}
        />
    );
};

export default CollectionsField;
