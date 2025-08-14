"use client";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod schema for form validation
const formSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name cannot exceed 80 characters.")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Full name must only contain letters, spaces, hyphens, or apostrophes."
    ),

  email: z
    .string()
    .email("Please enter a valid email address.")
    .min(1, "Email is required."),

  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters.")
    .max(100, "Company name cannot exceed 100 characters."),

  services: z.array(z.string()).min(1, "Please select at least one service."),

  budgetUsd: z
    .union([z.number().int("Budget must be an integer."), z.literal("")])
    .optional()
    .refine(
      (val) => val === "" || (val >= 100 && val <= 1000000),
      "Budget must be between 100 and 1,000,000 USD."
    )
    .transform((val) => (val === "" ? undefined : Number(val))),

  projectStartDate: z
    .string()
    .min(1, "Project start date is required.")
    .refine(
      (date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)),
      "Project start date must be today or later."
    ),

  acceptTerms: z
    .boolean()
    .refine((val) => val, "You must accept the terms and conditions."),
});

const SERVICE_OPTIONS = ["UI/UX", "Branding", "Web Dev", "Mobile App"];

function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      companyName: "",
      services: [],
      budgetUsd: "",
      projectStartDate: "",
      acceptTerms: false,
    },
  });

  // Pre-fill from query params (bonus)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      const serviceParam = urlParams.get("service");
      if (
        serviceParam &&
        SERVICE_OPTIONS.includes(decodeURIComponent(serviceParam))
      ) {
        setValue("services", [decodeURIComponent(serviceParam)]);
      }
    }
  }, [setValue]);

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    setIsSubmitted(false);

    // Use the environment variable for the API URL
    const apiUrl = process.env.NEXT_PUBLIC_ONBOARD_URL;

    if (!apiUrl) {
      setSubmissionError(
        "API URL is not configured. Please set the NEXT_PUBLIC_ONBOARD_URL environment variable."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...data,
        budgetUsd: data.budgetUsd ? Number(data.budgetUsd) : undefined,
        projectStartDate: new Date(data.projectStartDate)
          .toISOString()
          .split("T")[0],
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setSubmittedData(payload);
        reset();
      } else {
        setSubmissionError(
          `API Error: ${response.status} - An error occurred.`
        );
      }
    } catch (error) {
      setSubmissionError("Network Error: Could not connect to the API.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Checkbox component using Controller
  const ServiceCheckbox = ({ name, label, control }) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <label className="flex items-center text-gray-700 space-x-2 cursor-pointer transition-colors duration-200 hover:text-blue-600">
          <input
            type="checkbox"
            checked={field.value.includes(label)}
            onChange={(e) => {
              const newServices = e.target.checked
                ? [...field.value, label]
                : field.value.filter((service) => service !== label);
              field.onChange(newServices);
            }}
            className="form-checkbox h-4 w-4 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500"
          />
          <span className="select-none">{label}</span>
        </label>
      )}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-4">
      <div className="bg-white p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Client Onboarding
        </h1>

        {/* Success/Error messages */}
        {isSubmitted && (
          <div
            className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg relative mb-6 animate-fade-in"
            role="alert"
          >
            <strong className="font-semibold">Success!</strong>
            <span className="block sm:inline ml-2">
              Your form has been submitted.
            </span>
            <div className="mt-2 text-sm text-green-800">
              <p>Full Name: {submittedData.fullName}</p>
              <p>Email: {submittedData.email}</p>
              <p>Services: {submittedData.services.join(", ")}</p>
              <p>Project Start: {submittedData.projectStartDate}</p>
            </div>
          </div>
        )}

        {submissionError && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg relative mb-6 animate-fade-in"
            role="alert"
          >
            <strong className="font-semibold">Error!</strong>
            <span className="block sm:inline ml-2">{submissionError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              {...register("fullName")}
              className={`w-full p-3 border rounded-md transition duration-200 bg-gray-50 text-gray-800
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400
                ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className={`w-full p-3 border rounded-md transition duration-200 bg-gray-50 text-gray-800
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400
                ${errors.email ? "border-red-500" : "border-gray-300"}`}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Company name
            </label>
            <input
              id="companyName"
              type="text"
              {...register("companyName")}
              className={`w-full p-3 border rounded-md transition duration-200 bg-gray-50 text-gray-800
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400
                ${errors.companyName ? "border-red-500" : "border-gray-300"}`}
              disabled={isSubmitting}
            />
            {errors.companyName && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Services interested in
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SERVICE_OPTIONS.map((service) => (
                <ServiceCheckbox
                  key={service}
                  name="services"
                  label={service}
                  control={control}
                />
              ))}
            </div>
            {errors.services && (
              <p className="mt-2 text-xs text-red-500 font-medium">
                {errors.services.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="budgetUsd"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Budget (USD, optional)
            </label>
            <input
              id="budgetUsd"
              type="number"
              {...register("budgetUsd", { valueAsNumber: true })}
              className={`w-full p-3 border rounded-md transition duration-200 bg-gray-50 text-gray-800
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400
                ${errors.budgetUsd ? "border-red-500" : "border-gray-300"}`}
              disabled={isSubmitting}
            />
            {errors.budgetUsd && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.budgetUsd.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="projectStartDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Project start date
            </label>
            <input
              id="projectStartDate"
              type="date"
              {...register("projectStartDate")}
              className={`w-full p-3 border rounded-md transition duration-200 bg-gray-50 text-gray-800
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400
                ${
                  errors.projectStartDate ? "border-red-500" : "border-gray-300"
                }`}
              disabled={isSubmitting}
            />
            {errors.projectStartDate && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.projectStartDate.message}
              </p>
            )}
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="acceptTerms"
                type="checkbox"
                {...register("acceptTerms")}
                className={`form-checkbox h-4 w-4 text-blue-600 rounded-md focus:ring-blue-500 border-gray-300 ${
                  errors.acceptTerms ? "border-red-500" : ""
                }`}
                disabled={isSubmitting}
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="acceptTerms"
                className="font-medium text-gray-700"
              >
                I accept the terms and conditions.
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-xs text-red-500 font-medium">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg text-white font-bold tracking-wide shadow-md transform transition-transform duration-200 ease-in-out
              bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105 hover:from-blue-600 hover:to-blue-700
              ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed from-gray-400 to-gray-500 hover:scale-100"
                  : ""
              }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
