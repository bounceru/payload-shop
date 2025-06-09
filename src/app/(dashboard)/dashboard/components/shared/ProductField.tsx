// File: src/app/(dashboard)/dashboard/components/form/ProductField.tsx
"use client";

import React, {
    useState,
    useEffect,
    useRef,
    ChangeEvent,
    FocusEvent,
    FC,
} from "react";
import SpinnerOne from "@/app/(dashboard)/dashboard/(admin)/(ui-elements)/spinners/SpinnerOne";
import { Tooltip } from "@/app/(dashboard)/dashboard/components/ui/tooltip/Tooltip";

/** Example product doc shape */
type ProductDoc = {
    id: string;
    name_nl: string;
    internal_name?: string;
};

/** Main props */
interface ProductFieldProps {
    /** Tenant ID for filtering products. */
    tenantID: string;

    /** Currently-selected product ID (or empty if none). */
    value: string;

    /** Called when user picks a product => new ID. */
    onChange: (newValue: string) => void;

    /** If true => user can't pick a new product. */
    disabled?: boolean;

    /** Label & tooltip for the search field. */
    label?: string;
    tooltipContent?: string;

    /** Mark the search input required? */
    required?: boolean;
}

/**
 * <ProductField> displays:
 *   1) A "Currently selected" block if `value` is set
 *   2) A search input => user types => we fetch /api/products?where[name_nl][like]=...
 *   3) A dropdown of results => picking calls onChange(product.id)
 */
export default function ProductField({
    tenantID,
    value,
    onChange,
    disabled,
    label,
    tooltipContent,
    required = false,
}: ProductFieldProps) {
    // This local state holds the doc for the currently-selected product (if any).
    const [selectedDoc, setSelectedDoc] = useState<ProductDoc | null>(null);

    // The search bar + dropdown states
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<ProductDoc[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // ---------------------------------------------------------
    // 1) If 'value' (product ID) changes => fetch that doc => display above search bar
    // ---------------------------------------------------------
    useEffect(() => {
        if (!value) {
            setSelectedDoc(null);
            return;
        }
        if (!tenantID) return;

        // fetch product by ID
        setLoading(true);
        fetch(`/api/products/${value}?depth=0`, {
            credentials: "include",
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(`Failed to fetch product ${value}: ${res.status}`);
                const doc = (await res.json()) as ProductDoc;
                setSelectedDoc(doc);
            })
            .catch((err) => {
                console.error("Could not load selected product doc:", err);
                setSelectedDoc(null);
            })
            .finally(() => setLoading(false));
    }, [value, tenantID]);

    // ---------------------------------------------------------
    // 2) Whenever user types => fetch matching products
    // ---------------------------------------------------------
    useEffect(() => {
        if (!tenantID) return;
        if (!searchTerm) {
            setResults([]);
            return;
        }

        setLoading(true);
        const qs = new URLSearchParams();
        qs.set("limit", "20");
        qs.set("where[tenant][equals]", tenantID);
        qs.set("where[name_nl][like]", searchTerm);

        fetch(`/api/products?${qs.toString()}`, {
            credentials: "include",
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
                const data = await res.json();
                return data.docs as ProductDoc[];
            })
            .then((docs) => {
                setResults(docs);
            })
            .catch((err) => {
                console.error(err);
                setResults([]);
            })
            .finally(() => {
                setLoading(false);
                setShowDropdown(true);
            });
    }, [searchTerm, tenantID]);

    // ---------------------------------------------------------
    // 3) Clicking outside => close dropdown
    // ---------------------------------------------------------
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /** Called when user picks a product from the dropdown. */
    function handleSelectProduct(prod: ProductDoc) {
        onChange(prod.id); // parent sets the 'value' => triggers the 'selectedDoc' fetch above
        setSearchTerm(""); // optionally clear the search field
        setShowDropdown(false);
    }

    /** The search bar onChange => update local text. */
    function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
        setSearchTerm(e.target.value);
    }

    /** On focus => if we have some results => show them */
    function handleFocus(_e: FocusEvent<HTMLInputElement>) {
        if (results.length > 0) {
            setShowDropdown(true);
        }
    }

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* 1) If we have a selected doc, show it above the search bar */}
            {selectedDoc && (
                <div className="mb-2 rounded border border-gray-300 bg-gray-100 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90">
                    <strong></strong> {selectedDoc.name_nl || selectedDoc.internal_name}
                </div>
            )}

            {/* 2) The search input for picking or changing the product */}
            <SearchInput
                label={label}
                tooltipContent={tooltipContent}
                placeholder="Search product name..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleFocus}
                disabled={disabled}
                required={required}
            />

            {/* 3) If loading => spinner on the right side */}
            {loading && (
                <div className="absolute right-3 top-[45px]">
                    <SpinnerOne />
                </div>
            )}

            {/* 4) Show the dropdown list if we have results */}
            {showDropdown && !loading && results.length > 0 && (
                <div
                    className="
            absolute left-0 top-[73px] z-50 w-full
            rounded-md border border-gray-200 bg-white
            shadow-md dark:border-gray-700 dark:bg-gray-800
          "
                >
                    {results.map((prod) => {
                        const label = prod.name_nl || prod.internal_name || prod.id;
                        return (
                            <button
                                key={prod.id}
                                type="button"
                                className="
                  block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100
                  dark:text-white/90 dark:hover:bg-gray-700
                "
                                onClick={() => handleSelectProduct(prod)}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* 5) If typed something but no results */}
            {showDropdown && !loading && results.length === 0 && searchTerm && (
                <div
                    className="
            absolute left-0 top-[73px] z-50 w-full
            rounded-md border border-gray-200 bg-white px-3 py-2
            text-sm text-gray-500 shadow-md
            dark:border-gray-700 dark:bg-gray-800 dark:text-white/70
          "
                >
                    No products found.
                </div>
            )}
        </div>
    );
}

/**
 * Minimal custom input with a label + tooltip, to match your styling.
 */
interface SearchInputProps {
    label?: string;
    tooltipContent?: string;
    placeholder?: string;
    value?: string;
    disabled?: boolean;
    required?: boolean;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
}

const SearchInput: FC<SearchInputProps> = ({
    label,
    tooltipContent,
    placeholder,
    value,
    disabled = false,
    required = false,
    onChange,
    onFocus,
}) => {
    let inputClasses =
        "h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm " +
        "shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 " +
        "bg-transparent text-gray-800 border-gray-300 " +
        "focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 " +
        "dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 " +
        "dark:focus:border-brand-800";

    if (disabled) {
        inputClasses +=
            " text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed " +
            "dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }

    return (
        <div className="mb-4">
            {label && (
                <label className="mb-1 block font-medium text-gray-700 dark:text-white/90">
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                    {tooltipContent && (
                        <Tooltip content={tooltipContent} position="right">
                            <span className="ml-1 text-gray-400 cursor-help">?</span>
                        </Tooltip>
                    )}
                </label>
            )}

            <input
                type="text"
                placeholder={placeholder}
                className={inputClasses}
                value={value || ""}
                onChange={onChange}
                onFocus={onFocus}
                disabled={disabled}
                required={required}
            />
        </div>
    );
};
