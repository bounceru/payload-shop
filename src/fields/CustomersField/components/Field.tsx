// File: src/fields/CustomersField/components/Field.tsx

import React from 'react';
import { CustomersFieldComponentClient } from './Field.client';

type Props = {
    path: string;
    readOnly?: boolean;
    field?: any;
    data?: any;
};

// Named export: "CustomersFieldComponent"
export const CustomersFieldComponent: React.FC<Props> = async (props) => {
    const { path, readOnly, data } = props;

    // If you want to filter by doc.shops, for example:
    const docShops = data?.shops;
    const isMulti = true; // you can make this dynamic if you want

    return (
        <CustomersFieldComponentClient
            path={path}
            readOnly={Boolean(readOnly)}
            isMulti={isMulti}
            shops={docShops}
        />
    );
};
