"use client";

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Store, Clock, Coffee, DollarSign, Save } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Schema ---
const timeSlotSchema = z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
}).refine((data) => {
    return data.end > data.start;
}, {
    message: "End time must be after start time",
    path: ["end"],
});

const shopFormSchema = z.object({
    shopName: z.string().min(2, "Shop name is required"),
    ownerName: z.string().min(2, "Owner name is required"),
    phone: z.string().regex(/^\d{10}$/, "Invalid phone number (10 digits)"),
    email: z.string().email("Invalid email address"),
    address: z.string().min(5, "Address is required"),
    mapLink: z.string().url("Invalid Google Map URL").optional().or(z.literal("")),
    telegram: z.string().min(2, "Telegram username is required"),
    minCharge: z.number().min(0, "Minimum charge cannot be negative"),
    upiId: z.string().optional(),
    breakDuration: z.number().min(0, "Break duration cannot be negative").default(0),
    timeSlots: z.array(timeSlotSchema)
        .min(1, "At least one time slot is required")
        .max(4, "Maximum 4 time slots allowed"),
});

type ShopFormValues = z.infer<typeof shopFormSchema>;

// --- Components ---
export default function ShopRegistrationForm() {
    const [successData, setSuccessData] = useState<{ qrLink: string; bookingLink: string } | null>(null);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ShopFormValues>({
        resolver: zodResolver(shopFormSchema),
        defaultValues: {
            minCharge: 0,
            breakDuration: 0,
            timeSlots: [{ start: "09:00", end: "17:00" }],
            mapLink: "",
            telegram: "",
            upiId: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "timeSlots",
    });

    // TODO: Replace with your actual Google Apps Script Web App URL after deployment
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby7XBKGFEEF6x1gtNltHOX4RfzLt-SlhFYRvUrt6Fe62TqURBsUESZuFVUq5CUa2BCoAQ/exec";

    const onSubmit = async (data: ShopFormValues) => {
        console.log("Submitting:", data);
        try {
            // Use text/plain to avoid CORS preflight issues with simple requests
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Success:", result);
                setSuccessData({
                    qrLink: result.qrLink,
                    bookingLink: result.bookingLink
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                throw new Error("Network response was not ok");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Error submitting form. Please check the console and ensure the Script URL is correct.");
        }
    };

    if (successData) {
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Store className="w-10 h-10 text-green-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900">Registration Successful!</h1>

                    {successData.qrLink && (
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <img src={successData.qrLink} alt="Shop QR Code" className="w-48 h-48 mb-2" />
                            <p className="text-sm text-slate-500 font-medium">Scan to Book Appointment</p>
                        </div>
                    )}

                    <div className="space-y-4 text-left bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="font-semibold text-lg text-slate-800">Next Steps:</h3>
                        <ol className="list-decimal list-inside space-y-3 text-slate-600">
                            <li className="pl-2">
                                <span className="font-medium text-slate-900">Check your Email:</span> We have sent you a confirmation email with your unique QR Code.
                            </li>
                            <li className="pl-2">
                                <span className="font-medium text-slate-900">Download QR Code:</span> Save the QR code image from the email to your phone/computer.
                            </li>
                            <li className="pl-2">
                                <span className="font-medium text-slate-900">Upload to Google Maps:</span> Go to your shop's Google Maps listing and upload this QR code as a photo so customers can scan it to book appointments.
                            </li>
                        </ol>
                        {successData.bookingLink && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">Your Booking Link:</p>
                                <a href={successData.bookingLink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline break-all text-sm">
                                    {successData.bookingLink}
                                </a>
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-slate-500">
                        Once your shop is verified by the admin, your booking link will active.
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Register Another Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">

                {/* Header */}
                <div className="bg-indigo-600 px-8 py-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <Store className="w-8 h-8" />
                        <h1 className="text-2xl font-bold">Get My Shop QR Code</h1>
                    </div>
                    <p className="text-indigo-100">Get Free QR and set up your profile.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">

                    {/* Section 1: Basic Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">Shop Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Shop Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("shopName")}
                                    className={cn(
                                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                                        errors.shopName ? "border-red-500 bg-red-50" : "border-slate-300"
                                    )}
                                    placeholder="e.g. Royal Salon"
                                />
                                {errors.shopName && <p className="text-xs text-red-500">{errors.shopName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Owner Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("ownerName")}
                                    className={cn(
                                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                                        errors.ownerName ? "border-red-500 bg-red-50" : "border-slate-300"
                                    )}
                                    placeholder="e.g. Rajesh Kumar"
                                />
                                {errors.ownerName && <p className="text-xs text-red-500">{errors.ownerName.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("phone")}
                                    type="tel"
                                    className={cn(
                                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                                        errors.phone ? "border-red-500 bg-red-50" : "border-slate-300"
                                    )}
                                    placeholder="e.g. 9876543210"
                                />
                                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("email")}
                                    type="email"
                                    className={cn(
                                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                                        errors.email ? "border-red-500 bg-red-50" : "border-slate-300"
                                    )}
                                    placeholder="e.g. shop@example.com"
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                {...register("address")}
                                rows={3}
                                className={cn(
                                    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none",
                                    errors.address ? "border-red-500 bg-red-50" : "border-slate-300"
                                )}
                                placeholder="Full shop address..."
                            />
                            {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Google Map Link</label>
                                <input
                                    {...register("mapLink")}
                                    className={cn(
                                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                                        errors.mapLink ? "border-red-500 bg-red-50" : "border-slate-300"
                                    )}
                                    placeholder="https://maps.google.com/..."
                                />
                                {errors.mapLink && <p className="text-xs text-red-500">{errors.mapLink.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Telegram Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("telegram")}
                                    className={cn(
                                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                                        errors.telegram ? "border-red-500 bg-red-50" : "border-slate-300"
                                    )}
                                    placeholder="@username"
                                />
                                {errors.telegram && <p className="text-xs text-red-500">{errors.telegram.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Service Details */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">Service Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-slate-400" />
                                    Min. Service Charge (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("minCharge", { valueAsNumber: true })}
                                    type="number"
                                    className={cn(
                                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                                        errors.minCharge ? "border-red-500 bg-red-50" : "border-slate-300"
                                    )}
                                    placeholder="0"
                                />
                                {errors.minCharge && <p className="text-xs text-red-500">{errors.minCharge.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">UPI ID</label>
                                <input
                                    {...register("upiId")}
                                    className={cn(
                                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                                        errors.upiId ? "border-red-500 bg-red-50" : "border-slate-300"
                                    )}
                                    placeholder="user@upi"
                                />
                                {errors.upiId && <p className="text-xs text-red-500">{errors.upiId.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Time Slots */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2 gap-4">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-600" />
                                Available Time Slots
                            </h2>
                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                        <Coffee className="w-4 h-4 text-slate-400" />
                                        <span className="hidden sm:inline">Break (mins):</span>
                                        <span className="sm:hidden">Break:</span>
                                    </label>
                                    <input
                                        {...register("breakDuration", { valueAsNumber: true })}
                                        type="number"
                                        className={cn(
                                            "w-16 px-2 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                                            errors.breakDuration ? "border-red-500 bg-red-50" : "border-slate-300"
                                        )}
                                        placeholder="15"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => append({ start: "09:00", end: "17:00" })}
                                    disabled={fields.length >= 4}
                                    className="text-sm text-indigo-600 font-bold hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
                                >
                                    <Plus className="w-4 h-4" /> Add Slot
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-2 gap-4 flex-1">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Start Time</label>
                                            <input
                                                type="time"
                                                {...register(`timeSlots.${index}.start`)}
                                                className={cn(
                                                    "w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none",
                                                    errors.timeSlots?.[index]?.start ? "border-red-500" : "border-slate-300"
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">End Time</label>
                                            <input
                                                type="time"
                                                {...register(`timeSlots.${index}.end`)}
                                                className={cn(
                                                    "w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none",
                                                    errors.timeSlots?.[index]?.end ? "border-red-500" : "border-slate-300"
                                                )}
                                            />
                                        </div>
                                        {errors.timeSlots?.[index]?.end && (
                                            <p className="text-xs text-red-500 col-span-2">{errors.timeSlots[index]?.end?.message}</p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                        className="mt-6 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            {errors.timeSlots && <p className="text-xs text-red-500">{errors.timeSlots.message}</p>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">Saving...</span>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" /> Register Shop Now
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
