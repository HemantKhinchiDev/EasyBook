import React from 'react';
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
    minCharge: z.number().min(0, "Minimum charge cannot be negative"),
    breakDuration: z.number().min(0, "Break duration cannot be negative").default(0),
    timeSlots: z.array(timeSlotSchema)
        .min(1, "At least one time slot is required")
        .max(4, "Maximum 4 time slots allowed"),
});

type ShopFormValues = z.infer<typeof shopFormSchema>;

// --- Components ---
export default function ShopRegistrationForm() {
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
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "timeSlots",
    });

    const onSubmit = async (data: ShopFormValues) => {
        console.log("Submitting:", data);
        // TODO: Integrate with Google Apps Script
        try {
            // Simulation
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert("Form submitted successfully! (Check console for data)");
        } catch (error) {
            console.error(error);
            alert("Error submitting form");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">

                {/* Header */}
                <div className="bg-indigo-600 px-8 py-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <Store className="w-8 h-8" />
                        <h1 className="text-2xl font-bold">Register Your Shop</h1>
                    </div>
                    <p className="text-indigo-100">Set up your profile and booking slots.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">

                    {/* Section 1: Basic Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">Shop Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Shop Name</label>
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
                                <label className="text-sm font-medium text-slate-700">Owner Name</label>
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
                                <label className="text-sm font-medium text-slate-700">Phone Number</label>
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
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
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
                    </div>

                    {/* Section 2: Service Details */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">Service Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-slate-400" />
                                    Min. Service Charge (₹)
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
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Coffee className="w-4 h-4 text-slate-400" />
                                    Break Duration (Minutes)
                                </label>
                                <input
                                    {...register("breakDuration", { valueAsNumber: true })}
                                    type="number"
                                    className={cn(
                                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                                        errors.breakDuration ? "border-red-500 bg-red-50" : "border-slate-300"
                                    )}
                                    placeholder="e.g. 15"
                                />
                                <p className="text-[10px] text-slate-500">Gap between bookings.</p>
                                {errors.breakDuration && <p className="text-xs text-red-500">{errors.breakDuration.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Time Slots */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-600" />
                                Available Time Slots
                            </h2>
                            <button
                                type="button"
                                onClick={() => append({ start: "09:00", end: "17:00" })}
                                disabled={fields.length >= 4}
                                className="text-sm text-indigo-600 font-bold hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add Slot
                            </button>
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
                                    <Save className="w-5 h-5" /> Register Shop
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
