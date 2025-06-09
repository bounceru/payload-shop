"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

export default function CreateCustomerWizard({
    initialTenantId = "",
}: {
    initialTenantId?: string;
}) {
    const router = useRouter();
    const [step, setStep] = useState(1);

    const [customerData, setCustomerData] = useState({
        tenant: initialTenantId,
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        date_of_birth: "",
        enabled: true,
        password: "",
    });

    function nextStep() {
        if (step === 1) {
            if (!customerData.firstname.trim() || !customerData.lastname.trim()) {
                toast.error("Voornaam & Achternaam zijn vereist.");
                return;
            }
            if (!customerData.email.trim()) {
                toast.error("E-mailadres is vereist.");
                return;
            }
        }
        setStep((s) => s + 1);
    }

    function prevStep() {
        setStep((s) => s - 1);
    }

    async function handleFinish() {
        try {
            // If user left password blank => generate random
            if (!customerData.password.trim()) {
                customerData.password = randomPassword(10);
            }
            const res = await fetch("/api/payloadProxy/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(customerData),
            });
            if (!res.ok) throw new Error("Aanmaken van klant is mislukt.");

            const result = await res.json();
            const newID = result?.doc?.id || result.id;
            if (!newID) throw new Error("Geen ID terug van de server.");

            toast.success("Klant succesvol aangemaakt!");
            router.push(`/dashboard/customers/${newID}`);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Kon nieuwe klant niet aanmaken.");
        }
    }

    return (

        <div className="max-w-xl mx-auto space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <Toaster position="top-center" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Nieuwe klant – Stap {step} van 3
            </h2>

            {step === 1 && (

                <StepOne customerData={customerData} setCustomerData={setCustomerData} />
            )}
            {step === 2 && (
                <StepTwo customerData={customerData} setCustomerData={setCustomerData} />
            )}
            {step === 3 && <StepConfirm customerData={customerData} />}

            <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-white/[0.05]">
                {step > 1 ? (
                    <button
                        onClick={prevStep}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                    >
                        Terug
                    </button>
                ) : (
                    <div />
                )}

                {step < 3 ? (
                    <button
                        onClick={nextStep}
                        className="rounded-lg bg-stagepasssecondary px-4 py-2 text-sm text-white hover:bg-stagepasssecondary-700 hover:scale-105"
                    >
                        Volgende
                    </button>
                ) : (
                    <button
                        onClick={handleFinish}
                        className="rounded-lg bg-stagepasssecondary px-4 py-2 text-sm text-white hover:bg-stagepasssecondary-700 hover:scale-105"
                    >
                        Afronden
                    </button>
                )}
            </div>
        </div>
    );
}

function StepOne({
    customerData,
    setCustomerData,
}: {
    customerData: any;
    setCustomerData: React.Dispatch<React.SetStateAction<any>>;
}) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Stap 1: Vul de basisgegevens in.
            </p>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Voornaam
                </label>
                <input
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    value={customerData.firstname}
                    onChange={(e) =>
                        setCustomerData((prev: any) => ({ ...prev, firstname: e.target.value }))
                    }
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Achternaam
                </label>
                <input
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    value={customerData.lastname}
                    onChange={(e) =>
                        setCustomerData((prev: any) => ({ ...prev, lastname: e.target.value }))
                    }
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    E-mailadres
                </label>
                <input
                    type="email"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    value={customerData.email}
                    onChange={(e) =>
                        setCustomerData((prev: any) => ({ ...prev, email: e.target.value }))
                    }
                />
            </div>
        </div>
    );
}

function StepTwo({
    customerData,
    setCustomerData,
}: {
    customerData: any;
    setCustomerData: React.Dispatch<React.SetStateAction<any>>;
}) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Stap 2: Meer informatie over de klant.
            </p>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Telefoonnummer
                </label>
                <input
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    value={customerData.phone}
                    onChange={(e) =>
                        setCustomerData((prev: any) => ({ ...prev, phone: e.target.value }))
                    }
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Geboortedatum
                </label>
                <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    value={customerData.date_of_birth}
                    onChange={(e) =>
                        setCustomerData((prev: any) => ({
                            ...prev,
                            date_of_birth: e.target.value,
                        }))
                    }
                />
            </div>

            <div className="flex items-center gap-2 pt-2">
                <input
                    type="checkbox"
                    id="enabled"
                    checked={customerData.enabled}
                    onChange={(e) =>
                        setCustomerData((prev: any) => ({
                            ...prev,
                            enabled: e.target.checked,
                        }))
                    }
                />
                <label htmlFor="enabled" className="text-sm text-gray-700 dark:text-gray-300">
                    Actief
                </label>
            </div>
        </div>
    );
}

function StepConfirm({ customerData }: { customerData: any }) {
    return (
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">
                    Overzicht klantgegevens
                </h4>
                <p><strong>Voornaam:</strong> {customerData.firstname}</p>
                <p><strong>Achternaam:</strong> {customerData.lastname}</p>
                <p><strong>E-mailadres:</strong> {customerData.email}</p>
                <p><strong>Telefoonnummer:</strong> {customerData.phone || "—"}</p>
                <p><strong>Geboortedatum:</strong> {customerData.date_of_birth || "—"}</p>
                <p><strong>Actief:</strong> {customerData.enabled ? "Ja" : "Nee"}</p>
            </div>
        </div>
    );
}

/** Minimal random password generator (letters + digits). */
function randomPassword(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
