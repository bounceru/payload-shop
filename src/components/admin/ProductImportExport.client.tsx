"use client";

import React, { useState } from "react";
import Papa from "papaparse";

type Props = {
    tenantCookie?: string; // The tenant ID from server
};

export default function ProductImportExportClient({ tenantCookie }: Props) {
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0); // percentage or row count

    const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
    const api = "/api";

    // ----------------------------------------------------------------
    // 1) Export a single CSV row as a "template"
    // ----------------------------------------------------------------
    const handleExportTemplate = () => {
        const exampleRow = {
            _id: "", // if empty => new product on import
            tenant: "",
            shops: "SHOPID123,SHOPID456",
            categories: "CATID1,CATID2",
            productpopups: "POPUPID1:0|POPUPID2:2",
            image: "MEDIAID123",
            name_nl: "Example Product NL",
            name_en: "Example Product EN",
            name_de: "Example Product DE",
            name_fr: "Example Product FR",
            description_nl: "Description in Dutch",
            description_en: "Description in English",
            description_de: "Description in German",
            description_fr: "Description in French",
            allergens: "milk,gluten",
            exclude_category_popups: "false",
            menuOrder: "0",
            price_unified: "true",
            price: "9.99",
            isPromotion: "false",
            old_price: "",
            tax: "6",
            tax_dinein: "12",
            price_dinein: "",
            price_takeaway: "",
            price_delivery: "",
            barcode: "",
            enable_stock: "false",
            quantity: "",
            posshow: "true",
            webshopshow: "true",
            webshoporderable: "true",
            pointscost: "0",
            modtime: "",
            cloudPOSId: "",
            status: "enabled",
        };

        const csv = Papa.unparse([exampleRow]);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const urlObject = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = urlObject;
        link.setAttribute("download", "products_template.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    // ----------------------------------------------------------------
    // 2) Export all existing products for the current tenant
    // ----------------------------------------------------------------
    const handleExportAll = async () => {
        try {
            if (!tenantCookie) {
                alert("No tenant cookie found — cannot export.");
                return;
            }
            const url = `${serverURL}${api}/products?limit=9999&where[tenant][equals]=${encodeURIComponent(
                tenantCookie
            )}`;

            const res = await fetch(url, {
                method: "GET",
                credentials: "include",
            });
            if (!res.ok) {
                console.error("Failed to fetch products for CSV export:", await res.text());
                return;
            }

            const data = await res.json();
            const docs = data.docs || [];

            const transformedDocs = docs.map((doc: any) => {
                const shops = Array.isArray(doc.shops)
                    ? doc.shops.map((s: any) => (typeof s === "object" && s !== null ? s.id : s)).join(",")
                    : "";
                const categories = Array.isArray(doc.categories)
                    ? doc.categories.map((c: any) => (typeof c === "object" && c !== null ? c.id : c)).join(",")
                    : "";
                const tenant =
                    typeof doc.tenant === "object" && doc.tenant !== null ? doc.tenant.id : doc.tenant;

                let productpopups = "";
                if (Array.isArray(doc.productpopups)) {
                    productpopups = doc.productpopups
                        .map((pp: any) => {
                            const popupId =
                                typeof pp.popup === "object" && pp.popup !== null ? pp.popup.id : pp.popup;
                            return `${popupId}:${pp.order}`;
                        })
                        .join("|");
                }

                const image =
                    typeof doc.image === "object" && doc.image !== null ? doc.image.id : doc.image;

                return {
                    _id: doc.id,
                    tenant,
                    shops,
                    categories,
                    productpopups,
                    image,
                    name_nl: doc.name_nl,
                    name_en: doc.name_en,
                    name_de: doc.name_de,
                    name_fr: doc.name_fr,
                    description_nl: doc.description_nl,
                    description_en: doc.description_en,
                    description_de: doc.description_de,
                    description_fr: doc.description_fr,
                    allergens: Array.isArray(doc.allergens) ? doc.allergens.join(",") : "",
                    exclude_category_popups: doc.exclude_category_popups,
                    menuOrder: doc.menuOrder,
                    price_unified: doc.price_unified,
                    price: doc.price,
                    isPromotion: doc.isPromotion,
                    old_price: doc.old_price,
                    tax: doc.tax,
                    tax_dinein: doc.tax_dinein,
                    price_dinein: doc.price_dinein,
                    price_takeaway: doc.price_takeaway,
                    price_delivery: doc.price_delivery,
                    barcode: doc.barcode,
                    enable_stock: doc.enable_stock,
                    quantity: doc.quantity,
                    posshow: doc.posshow,
                    webshopshow: doc.webshopshow,
                    webshoporderable: doc.webshoporderable,
                    pointscost: doc.pointscost,
                    modtime: doc.modtime,
                    cloudPOSId: doc.cloudPOSId,
                    status: doc.status,
                };
            });

            const csv = Papa.unparse(transformedDocs);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const urlObject = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = urlObject;
            link.setAttribute("download", "products_export.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error exporting CSV:", error);
        }
    };

    // ----------------------------------------------------------------
    // 3) Handle CSV IMPORT (with progress bar)
    // ----------------------------------------------------------------
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setImportProgress(0); // reset progress to 0

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results: Papa.ParseResult<Record<string, string>>) => {
                console.log("Parsed CSV:", results.data);

                const totalRows = results.data.length;
                let currentCount = 0;

                for (const row of results.data) {
                    try {
                        const newProductData: Record<string, any> = {};

                        const parseField = (key: string, val: string): any => {
                            if (val === "") return undefined; // skip => don't update

                            switch (key) {
                                case "shops":
                                case "categories":
                                    return val.split(",").map((x) => x.trim()).filter(Boolean);
                                case "allergens":
                                    return val.split(",").map((x) => x.trim()).filter(Boolean);
                                case "productpopups":
                                    return val.split("|").map((pair) => {
                                        const [popupId, orderStr] = pair.split(":");
                                        return {
                                            popup: popupId.trim(),
                                            order: parseInt(orderStr || "0", 10),
                                        };
                                    });
                                case "exclude_category_popups":
                                case "price_unified":
                                case "isPromotion":
                                case "enable_stock":
                                case "posshow":
                                case "webshopshow":
                                case "webshoporderable": {
                                    const lower = val.toLowerCase();
                                    return lower === "true";
                                }
                                case "price":
                                case "old_price":
                                case "tax":
                                case "tax_dinein":
                                case "price_dinein":
                                case "price_takeaway":
                                case "price_delivery":
                                case "quantity":
                                case "pointscost":
                                case "menuOrder":
                                    return parseFloat(val);
                                case "modtime":
                                    return parseInt(val, 10);
                                default:
                                    return val; // direct assignment
                            }
                        };

                        for (const key of Object.keys(row)) {
                            const rawValue = row[key];
                            const parsed = parseField(key, rawValue);
                            if (parsed !== undefined) {
                                newProductData[key] = parsed;
                            }
                        }

                        // If no tenant was provided, but we have tenantCookie => set it
                        if (!newProductData.tenant && tenantCookie) {
                            newProductData.tenant = tenantCookie;
                        }

                        const productId = row["_id"];
                        let method = "POST";
                        let endpoint = `${serverURL}${api}/products`;
                        if (productId) {
                            method = "PATCH";
                            endpoint = `${serverURL}${api}/products/${productId}`;
                        }

                        const res = await fetch(endpoint, {
                            method,
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify(newProductData),
                        });

                        if (!res.ok) {
                            console.error("Error updating product from row:", row, await res.text());
                        } else {
                            console.log("Imported CSV row => product:", row);
                        }
                    } catch (err) {
                        console.error("Error creating/updating product from CSV row:", row, err);
                    }

                    // Update progress each row
                    currentCount += 1;
                    const progress = Math.round((currentCount / totalRows) * 100);
                    setImportProgress(progress);
                }

                setIsImporting(false);
                alert("CSV import complete!");
            },
            error: (err) => {
                console.error("Error parsing CSV:", err);
                setIsImporting(false);
                setImportProgress(0);
            },
        });
    };

    return (
        <div style={{ padding: "1rem", border: "1px solid #ccc" }}>
            <h3>CSV Import/Export</h3>

            {/* Export Template Button */}
            <button
                onClick={handleExportTemplate}
                style={{
                    marginBottom: "1rem",
                    padding: "6px 12px",
                    backgroundColor: "#0073e6",
                    color: "#fff",
                    borderRadius: 4,
                    marginRight: "1rem",
                }}
            >
                Export Template
            </button>

            {/* Export All Button */}
            <button
                onClick={handleExportAll}
                style={{
                    marginBottom: "1rem",
                    padding: "6px 12px",
                    backgroundColor: "#0073e6",
                    color: "#fff",
                    borderRadius: 4,
                    marginRight: "1rem",
                }}
            >
                Export CSV
            </button>

            {/* Import Button */}
            <label
                style={{
                    display: "inline-block",
                    cursor: "pointer",
                    padding: "6px 12px",
                    backgroundColor: "#0073e6",
                    color: "#fff",
                    borderRadius: 4,
                }}
            >
                Import CSV
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    disabled={isImporting}
                />
            </label>

            {/* Display progress info */}
            {isImporting && (
                <div style={{ marginTop: "1rem" }}>
                    <p>Importing... {importProgress}%</p>
                    <div
                        style={{
                            width: "100%",
                            height: "10px",
                            background: "#eee",
                            borderRadius: "4px",
                            marginTop: "0.5rem",
                        }}
                    >
                        <div
                            style={{
                                width: `${importProgress}%`,
                                height: "100%",
                                background: "#0073e6",
                                borderRadius: "4px",
                                transition: "width 0.2s ease",
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
