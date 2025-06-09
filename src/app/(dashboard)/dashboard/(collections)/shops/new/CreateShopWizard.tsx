"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

export default function CreateShopWizard({ initialTenantId }: { initialTenantId: string }) {
    const router = useRouter();
    const [step, setStep] = useState(1);

    const [shopData, setShopData] = useState({
        tenant: initialTenantId || "",
        name: "",
        slug: "",
        domain: "",
        address: "",
        location: { lat: "", lng: "" },
        showExceptionallyClosedDaysOnOrderPage: false,
        exceptionally_closed_days: [] as { date: string; reason: string }[],
        company_details: {
            company_name: "",
            contact_email: "",
            phone: "",
            street: "",
            house_number: "",
            city: "",
            postal: "",
            vat_nr: "",
            website_url: "",
        },
    });

    const [brandingData, setBrandingData] = useState({
        tenant: initialTenantId || "",
        venueTitle: "",
        primaryColorCTA: "#068b59",
    });

    function handleNext() {
        if (step === 1) {
            if (!shopData.name || !shopData.slug || !shopData.domain) {
                toast.error("Vul minstens naam, slug en domein in.");
                return;
            }
        }
        setStep((prev) => prev + 1);
    }

    function handlePrev() {
        setStep((prev) => prev - 1);
    }

    async function handleFinish() {
        try {
            const shopRes = await fetch("/api/payloadProxy/shops", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(shopData),
            });
            if (!shopRes.ok) throw new Error("Shop aanmaken mislukt");
            const shopResult = await shopRes.json();
            const newShopID = shopResult?.doc?.id || shopResult?.id;
            if (!newShopID) throw new Error("Geen Shop ID ontvangen");

            if (brandingData.venueTitle.trim()) {
                const brandingBody = { ...brandingData, shops: newShopID };
                const brandRes = await fetch("/api/payloadProxy/venue-branding", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(brandingBody),
                });
                if (!brandRes.ok) throw new Error("Branding aanmaken mislukt");
            }

            toast.success("Shop en (optioneel) branding succesvol aangemaakt!");
            router.push(`/dashboard/shops/${newShopID}/settings`);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Er ging iets mis");
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
            <Toaster position="top-center" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Nieuwe Shop aanmaken – Stap {step} van 3
            </h2>

            {step === 1 && <StepOne shopData={shopData} setShopData={setShopData} />}
            {step === 2 && (
                <StepTwo
                    shopData={shopData}
                    setShopData={setShopData}
                    brandingData={brandingData}
                    setBrandingData={setBrandingData}
                />
            )}
            {step === 3 && <StepConfirm shopData={shopData} brandingData={brandingData} />}

            <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-white/[0.05]">
                {step > 1 ? (
                    <button
                        onClick={handlePrev}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                    >
                        Terug
                    </button>
                ) : (
                    <div />
                )}

                {step < 3 ? (
                    <button
                        onClick={handleNext}
                        className="rounded-lg bg-stagepasssecondary px-4 py-2 text-sm text-white hover:opacity-90"
                    >
                        Volgende
                    </button>
                ) : (
                    <button
                        onClick={handleFinish}
                        className="rounded-lg bg-stagepasssecondary px-4 py-2 text-sm text-white hover:opacity-90"
                    >
                        Afronden
                    </button>
                )}
            </div>
        </div>
    );
}

function StepOne({ shopData, setShopData }: any) {
    // Automatically update slug + domain when name changes
    function handleNameChange(value: string) {
        const newSlug = value
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "") // remove invalid chars
            .replace(/\s+/g, "-") // replace spaces with hyphens
            .replace(/--+/g, "-"); // avoid multiple hyphens

        setShopData({
            ...shopData,
            name: value,
            slug: newSlug,
            domain: `https://${newSlug}.stagepass.be`,
        });
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Naam van de shop</label>
                <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    value={shopData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug (automatisch gegenereerd)</label>
                <input
                    type="text"
                    readOnly
                    className="mt-1 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    value={shopData.slug}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Domein</label>
                <input
                    type="text"
                    readOnly
                    className="mt-1 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    value={shopData.domain}
                />
                <p className="text-xs text-gray-400 mt-1">
                    Je kan hier later nog je eigen domeinnaam aan koppelen.
                </p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bedrijfsnaam</label>
                <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    value={shopData.company_details.company_name}
                    onChange={(e) =>
                        setShopData({
                            ...shopData,
                            company_details: {
                                ...shopData.company_details,
                                company_name: e.target.value,
                            },
                        })
                    }
                />
            </div>
        </div>
    );
}

function StepTwo({ shopData, setShopData, brandingData, setBrandingData }: any) {
    function toggleClosedDays() {
        setShopData({
            ...shopData,
            showExceptionallyClosedDaysOnOrderPage: !shopData.showExceptionallyClosedDaysOnOrderPage,
        });
    }

    function addClosedDay() {
        setShopData({
            ...shopData,
            exceptionally_closed_days: [...(shopData.exceptionally_closed_days || []), { date: "", reason: "" }],
        });
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adres</label>
                <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    value={shopData.address}
                    onChange={(e) => setShopData({ ...shopData, address: e.target.value })}
                />

                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            value={shopData.location.lat}
                            onChange={(e) =>
                                setShopData({ ...shopData, location: { ...shopData.location, lat: e.target.value } })
                            }
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            value={shopData.location.lng}
                            onChange={(e) =>
                                setShopData({ ...shopData, location: { ...shopData.location, lng: e.target.value } })
                            }
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={shopData.showExceptionallyClosedDaysOnOrderPage}
                        onChange={toggleClosedDays}
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                        Toon uitzonderlijke sluitingsdagen op de bestelpagina
                    </label>
                </div>

                {shopData.showExceptionallyClosedDaysOnOrderPage && (
                    <div className="space-y-2">
                        <button
                            onClick={addClosedDay}
                            className="rounded bg-gray-100 px-2 py-1 text-sm hover:bg-gray-200"
                        >
                            + Sluitingsdag toevoegen
                        </button>
                        {shopData.exceptionally_closed_days.map((day: any, idx: number) => (
                            <div key={idx} className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="date"
                                    className="rounded border border-gray-300 p-2 text-sm"
                                    value={day.date}
                                    onChange={(e) => {
                                        const copy = [...shopData.exceptionally_closed_days];
                                        copy[idx].date = e.target.value;
                                        setShopData({ ...shopData, exceptionally_closed_days: copy });
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Reden"
                                    className="flex-1 rounded border border-gray-300 p-2 text-sm"
                                    value={day.reason}
                                    onChange={(e) => {
                                        const copy = [...shopData.exceptionally_closed_days];
                                        copy[idx].reason = e.target.value;
                                        setShopData({ ...shopData, exceptionally_closed_days: copy });
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titel van locatie</label>
                <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    value={brandingData.venueTitle}
                    onChange={(e) => setBrandingData({ ...brandingData, venueTitle: e.target.value })}
                />

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Primaire kleur (CTA)</label>
                <input
                    type="color"
                    className="h-10 w-14 rounded border border-gray-300 p-1"
                    value={brandingData.primaryColorCTA}
                    onChange={(e) => setBrandingData({ ...brandingData, primaryColorCTA: e.target.value })}
                />
            </div>
        </div>
    );
}

function StepConfirm({ shopData, brandingData }: { shopData: any; brandingData: any }) {
    return (
        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="rounded bg-gray-50 p-4 dark:bg-gray-800">
                <h4 className="mb-2 font-semibold">Samenvatting Shop</h4>
                <p>Naam: {shopData.name}</p>
                <p>Slug: {shopData.slug}</p>
                <p>Domein: {shopData.domain}</p>
                <p>Bedrijfsnaam: {shopData.company_details.company_name}</p>
            </div>

            <div className="rounded bg-gray-50 p-4 dark:bg-gray-800">
                <h4 className="mb-2 font-semibold">Samenvatting Branding</h4>
                {brandingData.venueTitle ? (
                    <>
                        <p>Titel zaal: {brandingData.venueTitle}</p>
                        <p>Primaire kleur: {brandingData.primaryColorCTA}</p>
                    </>
                ) : (
                    <p className="italic text-gray-500">Geen brandinggegevens opgegeven.</p>
                )}
            </div>
        </div>
    );
}
