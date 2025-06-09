"use client";
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import type { SeatMap, Shop, EventTicketType, Tenant } from '@/payload-types';
import { getAllVenue, getTicketType, saveSeatMap } from "./api";

interface SeatMapProps {
    doc?: SeatMap; // doc includes doc.id, doc.name, doc.fields
}

interface Seat {
    row: string;
    seat: string;
    /**
     * Defines the ticket type for this seat (VIP, Regular, etc.)
     */
    ticketType: string | EventTicketType;
    priceModifier?: number | null;
    locks?:
    | {
        eventId: string;
        lockedUntil: string;
        id?: string | null;
    }[]
    | null;
    status?: string | null;
    id?: string | null;
}
export default function SeatMapFields({
    doc,
}: SeatMapProps) {

    // Modal
    const [openModal, setOpenModal] = useState<boolean>(false);

    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [seatMapName, setseatMapName] = useState<string | null>(doc?.name || "");
    const [initialseatMapName] = useState<string | null>(doc?.name || "");

    // Add new state for bulk update
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
    const [selectedBulkTicketType, setSelectedBulkTicketType] = useState<string>("");

    //Venue-related state
    const [venues, setVenues] = useState<Shop[]>([]);
    const [selectedVenue, setSelectedVenue] = useState<string | null>(doc?.venue.toString() || "");

    //Row and Column
    const [seatMapRows, setSeatMapRows] = useState<number>(doc?.rows || 0);
    const [seatMapColumns, setSeatMapColumns] = useState<number>(doc?.columns || 0);

    const [curve, setCurve] = useState<number>(doc?.curve || 24);
    const [isDefault, setIsDefault] = useState<boolean>(doc?.isDefault || false);
    const [isFormChanged, setIsFormChanged] = useState<boolean>(false);

    // Seat
    const [seats, setSeats] = useState<Seat[]>(
        (doc?.seats || []).map(seat => ({
            ticketType: 'ticketType' in seat ? (seat as any).ticketType ?? "" : "",
            priceModifier: 'priceModifier' in seat ? (seat as any).priceModifier ?? null : null,

            locks: seat.locks ?? [],
            status: seat.status ?? null,
            id: seat.id ?? null,
            // Copy any other properties if needed
            ...seat,
        }))
    );
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

    //Venue-related state
    const [ticketTypes, setTicketTypes] = useState<EventTicketType[]>([]);

    // ---------------------------
    // Track if form changed
    // ---------------------------
    // Form change tracking
    useEffect(() => {
        const nameChanged = seatMapName !== initialseatMapName;
        setIsFormChanged(
            nameChanged ||
            selectedVenue !== "" ||
            seatMapRows !== (doc?.rows || 0) ||
            seatMapColumns !== (doc?.columns || 0) ||
            isDefault !== (doc?.isDefault || false) ||
            seats.length !== ((doc?.seats?.length) || 0)
        );
    }, [seats, initialseatMapName, seatMapName, selectedVenue, seatMapRows, seatMapColumns, isDefault, doc?.rows, doc?.columns, doc?.isDefault, doc?.seats]);


    // ---------------------------
    // Seat Map Name Handler
    // ---------------------------
    function handleseatMapNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        setseatMapName(e.target.value);
    }

    // ---------------------------
    // Venue Handler
    //  ---------------------------
    function handleVenueChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedVenue(e.target.value);
    }

    // ---------------------------
    // Menu Handler
    // ---------------------------
    const handleMenuClick = (statusType: 'Seat' | 'Empty' | 'Hallway' | 'Stage', seatId: string | null | undefined) => {
        setSeats((prev) =>
            prev.map((seat) =>
                seat.id === seatId
                    ? { ...seat, status: statusType } // add or update `status`
                    : seat
            )
        );
        setOpenMenu(null); // optionally close the menu
    };
    // ---------------------------
    // Fetch all fields on mount
    // ---------------------------
    useEffect(() => {
        async function fetchAll() {
            try {
                const data = await getAllVenue(); // returns { docs: [...] }
                setVenues(data.docs);

                const tenantId = typeof doc?.tenant === 'string' ? doc.tenant : doc?.tenant?.id ?? "";

                const { docs } = await getTicketType();

                // Filter the list to only include ticket types with matching tenant ID
                const filteredTicketTypes = docs.filter((tt: { tenant: Tenant; }) => tt.tenant?.id === tenantId);
                setTicketTypes(filteredTicketTypes);


            } catch (err) {
                console.error("Failed to fetch venues:", err);
            }
        }
        fetchAll();
    }, [doc?.tenant]);

    // ---------------------------
    // Resize Seats Array
    // ---------------------------
    useEffect(() => {
        const iLen: number = seatMapColumns * seatMapRows;

        if (iLen !== seats.length) {
            if (seats.length > iLen) {
                setSeats(prevSeats => prevSeats.slice(0, iLen));
            } else {
                setSeats(() => {
                    const newSeats = [];
                    for (let i = 0; i < iLen; i++) {
                        const rowIndex = Math.floor(i / seatMapColumns) + 1;
                        const columnIndex = (i % seatMapColumns) + 1;
                        newSeats.push({
                            id: `row${rowIndex}-col${columnIndex}`, // unique id for each seat
                            row: `row${rowIndex}`,
                            seat: `${columnIndex}`,
                            ticketType: ticketTypes[0],
                            priceModifier: 10,
                            locks: [],
                        });
                    }
                    return newSeats;
                });
            }
        }

    }, [seatMapColumns, seatMapRows, seats.length, ticketTypes]);


    // ---------------------------
    // Determine the color for a seat based on its status
    // ---------------------------
    const getSeatColor = (status: string | null) => {
        switch (status) {
            case 'Seat':
                return 'bg-green-500'; // green for Seat
            case 'Empty':
                return 'bg-gray-300'; // gray for Empty
            case 'Hallway':
                return 'bg-blue-500'; // blue for Hallway
            case 'Stage':
                return 'bg-yellow-500'; // yellow for Stage
            default:
                return 'bg-white'; // default to white if no status
        }
    };


    // ---------------------------
    // Function to handle double-click on seat
    // ---------------------------
    const handleSeatDoubleClick = (seat: Seat) => {
        if (seat.status === 'Seat' || seat.status === undefined) {
            setSelectedSeat(seat);
            // Open the modal
            setOpenModal(true);
        }
    };


    // ---------------------------
    // Update function that will update the seat
    // ---------------------------
    const updateSeat = (updatedSeat: Seat) => {
        setSeats((prevSeats) =>
            prevSeats.map((seat) =>
                seat.id === updatedSeat.id ? updatedSeat : seat
            )
        );
    };

    // ---------------------------
    // Update function that will update the seat
    // ---------------------------
    async function handleSave() {
        if (!seatMapName?.trim()) {
            toast.error("Site Map Name is required");
            return;
        }
        try {
            await saveSeatMap(doc?.id, {
                name: seatMapName,
                tenant: doc?.tenant ?? "",
                venue: selectedVenue ?? null,
                rows: seatMapRows,
                columns: seatMapColumns,
                seats: seats,

                isDefault: isDefault,
                curve: curve

            });
            setIsFormChanged(false);
            // optional reload/redirect
            setTimeout(() => {
                window.location.replace("/admin/collections/seatMaps");
            }, 800);
        } catch (error) {
            console.error("Error saving role:", error);
        }
    }

    // ---------------------------
    // Bulk Update Functions
    // ---------------------------
    const updateEntireRow = (rowIndex: number, status: 'Seat' | 'Empty' | 'Hallway' | 'Stage') => {
        setSeats((prev) =>
            prev.map((seat, index) => {
                const currentRow = Math.floor(index / seatMapColumns) + 1;
                return currentRow === rowIndex
                    ? { ...seat, status }
                    : seat;
            })
        );
    };

    const updateEntireColumn = (columnIndex: number, status: 'Seat' | 'Empty' | 'Hallway' | 'Stage') => {
        setSeats((prev) =>
            prev.map((seat, index) => {
                const currentColumn = (index % seatMapColumns) + 1;
                return currentColumn === columnIndex
                    ? { ...seat, status }
                    : seat;
            })
        );
    };

    const updateAllTiles = (status: 'Seat' | 'Empty' | 'Hallway' | 'Stage') => {
        setSeats((prev) =>
            prev.map((seat) => ({
                ...seat,
                status,
            }))
        );
    };

    // Bulk set ticket type for row
    const setRowTicketType = (rowIndex: number, ticketTypeId: string) => {
        setSeats((prev) =>
            prev.map((seat, index) => {
                const currentRow = Math.floor(index / seatMapColumns) + 1;
                return currentRow === rowIndex
                    ? { ...seat, ticketType: ticketTypeId }
                    : seat;
            })
        );
    };
    // Bulk set ticket type for column
    const setColumnTicketType = (columnIndex: number, ticketTypeId: string) => {
        setSeats((prev) =>
            prev.map((seat, index) => {
                const currentColumn = (index % seatMapColumns) + 1;
                return currentColumn === columnIndex
                    ? { ...seat, ticketType: ticketTypeId }
                    : seat;
            })
        );
    };
    // Bulk set ticket type for all seats
    const setAllTicketType = (ticketTypeId: string) => {
        setSeats((prev) =>
            prev.map((seat) => ({
                ...seat,
                ticketType: ticketTypeId,
            }))
        );
    };

    // ---------------------------
    // Render
    // ---------------------------
    return (
        <div className="flex flex-col gap-4 p-8">
            <Toaster position="top-center" />
            {/* Row with Seat Map Name and Venue */}

            {openModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-[400px]">
                        <h2 className="text-lg font-semibold mb-4">Edit Seat</h2>

                        {/* Row Input */}
                        <label htmlFor="row" className="mb-1 text-sm font-medium">Row</label>
                        <input
                            id="row"
                            value={selectedSeat?.row}
                            onChange={(e) =>
                                setSelectedSeat({ ...selectedSeat!, row: e.target.value })
                            }
                            placeholder="Row"
                            className="rounded-xl border p-2 mb-2 w-full"
                        />

                        {/* Seat Number Input */}
                        <label htmlFor="seat" className="mb-1 text-sm font-medium">Seat Number</label>
                        <input
                            id="seat"
                            value={selectedSeat?.seat}
                            onChange={(e) =>
                                setSelectedSeat({ ...selectedSeat!, seat: e.target.value })
                            }
                            placeholder="Seat Number"
                            className="rounded-xl border p-2 mb-2 w-full"
                        />

                        {/* Ticket Type Select */}
                        <label htmlFor="ticket-type" className="mb-1 text-sm font-medium">Ticket Type</label>
                        <select
                            id="ticket-type"
                            value={
                                typeof selectedSeat?.ticketType === 'string'
                                    ? selectedSeat.ticketType
                                    : selectedSeat?.ticketType?.id ?? ''
                            }
                            onChange={(e) =>
                                setSelectedSeat({
                                    ...selectedSeat!,
                                    ticketType: e.target.value,
                                })
                            }
                            className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2 px-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">

                            {ticketTypes?.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name} -- {type.price} €
                                </option>
                            ))}
                        </select>

                        {/* Price Modifier Input */}
                        <label htmlFor="price-modifier" className="mb-1 text-sm font-medium">Extra Charge (€)</label>
                        <input
                            id="price-modifier"
                            value={selectedSeat?.priceModifier ?? 0}
                            onChange={(e) =>
                                setSelectedSeat({
                                    ...selectedSeat!,
                                    priceModifier: e.target.value === '' ? null : parseFloat(e.target.value),
                                })
                            }
                            placeholder="Price Modifier"
                            className="rounded-xl border p-2 mb-2 w-full"
                        />

                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setOpenModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                            <button
                                onClick={() => {
                                    if (selectedSeat) {
                                        updateSeat(selectedSeat);  // Update seat in parent state
                                        setOpenModal(false);  // Close the modal after saving
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded">Update</button>
                        </div>
                    </div>
                </div>
            )
            }


            <div className="flex justify-between items-center mb-4 mt-2">
                <h1 className="text-2xl font-bold">Seat Map</h1>
                <button
                    onClick={handleSave}
                    disabled={!isFormChanged}
                    className={`px-4 py-2 rounded-lg transition-colors ${isFormChanged
                        ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    Save Changes
                </button>
            </div>

            {/* Row with Seat Map Name and Venue */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Seat Map Name */}
                <div className="flex flex-col flex-1 gap-2">
                    <h2>Seat Map Name:</h2>
                    <input
                        type="text"
                        value={seatMapName ?? ""}
                        onChange={handleseatMapNameChange}
                        className="border border-gray-300 rounded-xl p-2 focus-visible:outline-none w-full"
                    />
                    <p className="text-sm text-gray-500">Internal name (e.g., Theaterzaal Standaard)</p>
                </div>

                {/* Venue */}
                <div className="flex flex-col flex-1 gap-2">
                    <h2>Venue:</h2>
                    <select
                        value={selectedVenue ?? ""}
                        onChange={handleVenueChange}
                        className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2 px-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {venues.map((venue) => (
                            <option key={venue.id} value={venue.id}>
                                {venue.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {/* Rows and Columns */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col flex-1 gap-2">
                    <h2>Rows:</h2>
                    <input
                        type="number"
                        value={seatMapRows}
                        onChange={(e) => setSeatMapRows(Number(e.target.value))}
                        className="border border-gray-300 rounded-xl p-2 focus-visible:outline-none w-full"
                        min={0}
                    />
                </div>

                <div className="flex flex-col flex-1 gap-2">
                    <h2>Columns:</h2>
                    <input
                        type="number"
                        value={seatMapColumns}
                        onChange={(e) => setSeatMapColumns(Number(e.target.value))}
                        className="border border-gray-300 rounded-xl p-2 focus-visible:outline-none w-full"
                        min={0}
                    />
                </div>
            </div>
            {/* Base Price and Is Default */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">


                <div className="flex flex-col flex-1 gap-2">
                    <h2>Curve:</h2>
                    <input
                        type="number"
                        className="border border-gray-300 rounded-xl p-2 focus-visible:outline-none w-full"
                        min="-60"
                        max="60"
                        value={curve}
                        onChange={(e) => setCurve(Number(e.target.value))}
                    />
                </div>

                <div className="flex flex-1 mb-4">
                    <div className="flex place-items-end gap-2">
                        <input
                            id="isDefault"
                            type="checkbox"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-2 focus:ring-blue-300"
                        />
                        <label htmlFor="isDefault" className="text-sm text-gray-700">Default Map for This Venue</label>
                    </div>
                </div>
            </div>
            {
                seats && (
                    <div className="flex flex-col gap-4">
                        {/* Bulk Update Controls */}
                        <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Row:</label>
                                <select
                                    value={selectedRow || ''}
                                    onChange={(e) => setSelectedRow(Number(e.target.value))}
                                    className="rounded-xl border p-2"
                                >
                                    <option value="">Select Row</option>
                                    {Array.from({ length: seatMapRows }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            Row {i + 1}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => selectedRow && updateEntireRow(selectedRow, 'Seat')}
                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Set as Seats
                                </button>
                                <button
                                    onClick={() => selectedRow && updateEntireRow(selectedRow, 'Hallway')}
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Set as Hallway
                                </button>
                                <select
                                    value={selectedBulkTicketType}
                                    onChange={e => setSelectedBulkTicketType(e.target.value)}
                                    className="rounded-xl border p-2"
                                >
                                    <option value="">Set Ticket Type</option>
                                    {ticketTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => selectedRow && selectedBulkTicketType && setRowTicketType(selectedRow, selectedBulkTicketType)}
                                    className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                                    disabled={!selectedRow || !selectedBulkTicketType}
                                >
                                    Set Row Ticket Type
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Column:</label>
                                <select
                                    value={selectedColumn || ''}
                                    onChange={(e) => setSelectedColumn(Number(e.target.value))}
                                    className="rounded-xl border p-2"
                                >
                                    <option value="">Select Column</option>
                                    {Array.from({ length: seatMapColumns }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            Column {i + 1}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => selectedColumn && updateEntireColumn(selectedColumn, 'Seat')}
                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Set as Seats
                                </button>
                                <button
                                    onClick={() => selectedColumn && updateEntireColumn(selectedColumn, 'Hallway')}
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Set as Hallway
                                </button>
                                <select
                                    value={selectedBulkTicketType}
                                    onChange={e => setSelectedBulkTicketType(e.target.value)}
                                    className="rounded-xl border p-2"
                                >
                                    <option value="">Set Ticket Type</option>
                                    {ticketTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => selectedColumn && selectedBulkTicketType && setColumnTicketType(selectedColumn, selectedBulkTicketType)}
                                    className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                                    disabled={!selectedColumn || !selectedBulkTicketType}
                                >
                                    Set Column Ticket Type
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => updateAllTiles('Seat')}
                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Set All as Seats
                                </button>
                                <button
                                    onClick={() => updateAllTiles('Hallway')}
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Set All as Hallway
                                </button>
                                <select
                                    value={selectedBulkTicketType}
                                    onChange={e => setSelectedBulkTicketType(e.target.value)}
                                    className="rounded-xl border p-2"
                                >
                                    <option value="">Set Ticket Type</option>
                                    {ticketTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => selectedBulkTicketType && setAllTicketType(selectedBulkTicketType)}
                                    className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                                    disabled={!selectedBulkTicketType}
                                >
                                    Set All Ticket Type
                                </button>
                            </div>
                        </div>

                        <div
                            className="grid gap-4 overflow-x-auto max-w-full"
                            style={{ gridTemplateColumns: `repeat(${seatMapColumns}, minmax(70px, 1fr))` }}
                        >
                            {seats.map((seat, index) => (
                                <div
                                    key={index}
                                    onDoubleClick={() => handleSeatDoubleClick(seat)}
                                    className={`min-w-[70px] mr-2 relative text-white text-center cursor-pointer rounded p-2 ${getSeatColor(seat.status ?? "Seat")}`}>
                                    {/* Three-dot menu trigger */}
                                    <div className="absolute top-1 right-1">
                                        <button
                                            onClick={() => setOpenMenu(openMenu === index ? null : index)}
                                            className="text-white hover:bg-green-600 rounded-full w-6 h-6 flex items-center justify-center"
                                        >
                                            ⋯
                                        </button>
                                    </div>

                                    {/* Seat label */}
                                    <div className="mt-4">
                                        {seat.status === 'Seat' || seat.status === undefined ? (
                                            <div className="flex flex-col items-center text-xs">
                                                <div>{`${seat.row}-${seat.seat}`}</div>
                                                <div className="text-[10px] mt-1">
                                                    {typeof seat.ticketType === 'string'
                                                        ? ticketTypes.find(t => t.id === seat.ticketType)?.name === 'Standard'
                                                            ? 'S'
                                                            : ticketTypes.find(t => t.id === seat.ticketType)?.name
                                                        : seat.ticketType?.name === 'Standard'
                                                            ? 'S'
                                                            : seat.ticketType?.name}
                                                </div>

                                                <div className="text-[10px]">
                                                    {seat.priceModifier ? `+${seat.priceModifier}€` : ''}
                                                </div>
                                            </div>
                                        ) : (
                                            seat.status
                                        )}
                                    </div>

                                    {/* Menu */}
                                    {openMenu === index && (
                                        <ul
                                            role="menu"
                                            data-popover="menu-1"
                                            data-popover-placement="bottom"
                                            className="absolute z-10 min-w-[180px] overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg focus:outline-none"
                                        >
                                            <li
                                                role="menuitem"
                                                onClick={() => handleMenuClick('Seat', seat.id)}
                                                className="cursor-pointer text-slate-800 text-sm flex w-full items-center rounded-md p-3 transition-all hover:bg-slate-100"
                                            >
                                                Seat
                                            </li>
                                            <li
                                                role="menuitem"
                                                onClick={() => handleMenuClick('Empty', seat.id)}
                                                className="cursor-pointer text-slate-800 text-sm flex w-full items-center rounded-md p-3 transition-all hover:bg-slate-100"
                                            >
                                                Empty (gap)
                                            </li>
                                            <li
                                                role="menuitem"
                                                onClick={() => handleMenuClick('Hallway', seat.id)}
                                                className="cursor-pointer text-slate-800 text-sm flex w-full items-center rounded-md p-3 transition-all hover:bg-slate-100"
                                            >
                                                Hallway
                                            </li>
                                            <li
                                                role="menuitem"
                                                onClick={() => handleMenuClick('Stage', seat.id)}
                                                className="cursor-pointer text-slate-800 text-sm flex w-full items-center rounded-md p-3 transition-all hover:bg-slate-100"
                                            >
                                                Stage marker
                                            </li>
                                        </ul>

                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
}
