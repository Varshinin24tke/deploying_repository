"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("@/components/MapClient"), {
  ssr: false,
  loading: () => <div>Loading Map...</div>,
});

const UserIdWrapper = dynamic(() => import("@/components/UserIdWrapper"), {
  ssr: false,
  loading: () => <div>Loading user info...</div>,
});

const SearchParamsWrapper = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
};

const ReportContent = () => {
  const searchParams = useSearchParams();
  const [page, setPage] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [description, setDescription] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    setPage(searchParams.get("page"));

    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        setSelectedLocation({ lat, lng });
      }
    }
  }, [searchParams]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const fullQuery = `${searchQuery}, India`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setSelectedLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setSearchError("");
      } else {
        setSearchError("Location not found.");
      }
    } catch (err) {
      console.error(err);
      setSearchError("Search failed. Please try again.");
    }
  };

  const handleUseMyLocation = () => {
    if (!selectedLocation) {
      setSearchError("No lat/lng found in URL. Cannot use location.");
    }
  };

  const handleSubmit = async () => {
    const validUserId = userId || "00000000-0000-0000-0000-000000000000";
    if (!description || !selectedLocation) {
      setSubmitMessage("Please fill all fields and select location.");
      return;
    }

    const body = {
      userid: validUserId,
      description,
      latt: selectedLocation.lat,
      long: selectedLocation.lng,
      pageSource: page,
    };

    try {
      setSubmitting(true);
      const response = await fetch(
        "https://yashdb18-hersafety.hf.space/app/save_review",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        setSubmitMessage("Report submitted successfully.");
        setDescription("");
      } else {
        setSubmitMessage("Failed to submit the report.");
      }
    } catch (error) {
      console.error(error);
      setSubmitMessage("An error occurred while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 md:p-6 max-w-xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-emerald-700">
        Report a Location - {page}
      </h1>

      <p className="text-sm text-gray-600 mb-2">Reporting from page: {page}</p>

      <Suspense fallback={<div>Loading user info...</div>}>
        <UserIdWrapper onUserId={setUserId} />
      </Suspense>

      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input
          type="text"
          placeholder="Search location"
          className="text-black p-2 rounded border w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {searchError && (
        <p className="text-red-500 font-medium mb-2">{searchError}</p>
      )}

      <button
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded mb-4 w-full"
        onClick={handleUseMyLocation}
      >
        Use My Location
      </button>

      <MapClient
        onLocationSelect={setSelectedLocation}
        currentLocation={selectedLocation}
      />

      {selectedLocation && (
        <p className="text-gray-700 font-medium mt-2">
          Selected: {selectedLocation.lat.toPrecision(15)},{" "}
          {selectedLocation.lng.toPrecision(15)}
        </p>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <textarea
            className="w-full p-2 border rounded text-black"
            placeholder="Describe the issue here..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            className={`bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded w-full ${
              submitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
          {submitMessage && (
            <p className="text-sm font-medium text-center text-gray-700">
              {submitMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ReportPage = () => {
  return (
    <SearchParamsWrapper>
      <ReportContent />
    </SearchParamsWrapper>
  );
};

export default ReportPage;
