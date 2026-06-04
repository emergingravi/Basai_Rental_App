import React, { useState, useRef } from "react";
import {
  MapPin,
  Upload,
  Check,
  Info,
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import {
  AMENITIES_LIST,
  Listing as UiListing,
  ROOM_CATEGORIES,
} from "../../data/appSchema";
import MapPicker from "../listings/MapPicker";
import { uploadToCloudinary } from "../../lib/cloudinary";
import listingsLib from "../../lib/listings";
import { getOwnerSession } from "../../lib/supabase";
import { mapDbListingToUiListing } from "../../lib/listingAdapter";

interface AddListingScreenProps {
  onListingCreated?: (listing: UiListing) => void;
}

export const AddListingScreen: React.FC<AddListingScreenProps> = ({
  onListingCreated,
}) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("Premium Residential Flat");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [roomType, setRoomType] = useState(ROOM_CATEGORIES[3]);
  const [rent, setRent] = useState("28000");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "water",
    "parking",
    "wifi",
  ]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Hidden file input reference to trigger camera/device browser
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleAmenity = (id: string) => {
    if (selectedAmenities.includes(id)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== id));
    } else {
      setSelectedAmenities([...selectedAmenities, id]);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      if (!cloudName || !preset) throw new Error("Cloudinary not configured");
      const res: any = await uploadToCloudinary(file, preset, cloudName);
      if (res.secure_url) {
        setPhotos((p) => [...p, res.secure_url]);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Upload failed", err);
      throw err;
    }
  };

  const handleFilesSelected = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        try {
          await handleFileUpload(f);
        } catch (e) {
          // continue with next file
        }
      }
    } finally {
      setUploading(false);
      // Reset input value so the same image can be picked/uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Triggered when clicking anywhere on the custom stylized upload card
  const onUploadZoneClick = () => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocation("Geolocation is not supported on this device.");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation(
          `Lat ${coords.latitude.toFixed(5)}, Lon ${coords.longitude.toFixed(5)}`,
        );
        setLat(coords.latitude);
        setLng(coords.longitude);
        setIsDetectingLocation(false);
      },
      () => {
        setLocation(
          "Unable to fetch location. Please check device permissions.",
        );
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const parseLatLngFromLocationString = () => {
    const m = location.match(/([-+]?[0-9]*\.?[0-9]+)\D+([-+]?[0-9]*\.?[0-9]+)/);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      if (!Number.isNaN(a) && !Number.isNaN(b)) {
        setLat(a);
        setLng(b);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) {
      // eslint-disable-next-line no-alert
      alert("Please wait until image uploads finish.");
      return;
    }

    try {
      const owner = getOwnerSession();
      const owner_id = owner?.id ? String(owner.id) : null;
      if (!owner_id) {
        // eslint-disable-next-line no-alert
        alert(
          "Owner session not found. Please sign in again before publishing a listing.",
        );
        return;
      }

      const result = await listingsLib.createListing({
        title,
        description: title,
        price: Number(rent),
        images: photos,
        lat: lat ?? undefined,
        lng: lng ?? undefined,
        owner_id,
      });
      if ((result as any)?.error) {
        throw new Error(
          (result as any).error.message || "Failed to create listing.",
        );
      }
      const createdRow = Array.isArray((result as any).data)
        ? (result as any).data[0]
        : null;
      if (createdRow && onListingCreated) {
        onListingCreated(mapDbListingToUiListing(createdRow));
      }

      setIsSubmitted(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Listing create failed", err);
      // eslint-disable-next-line no-alert
      alert("Failed to publish listing. See console for details.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-6 text-center space-y-4 pt-12 pb-24 page-shell">
        <div className="w-16 h-16 bg-[#1D9E75]/10 text-[#1D9E75] rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white">
          Listing submitted successfully
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
          Your room details have been saved and the uploaded photos are ready
          for preview.
        </p>

        <div className="surface-card bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-left border border-gray-100 dark:border-gray-700 text-xs space-y-1.5 mx-auto max-w-sm">
          <p>
            <strong>Title:</strong> {title}
          </p>
          <p>
            <strong>Location:</strong> {location}
          </p>
          <p>
            <strong>Type:</strong> {roomType}
          </p>
          <p>
            <strong>Rent:</strong> NPR {Number(rent).toLocaleString()}/month
          </p>
          <p>
            <strong>Amenities tagged:</strong> {selectedAmenities.length}{" "}
            selected
          </p>
        </div>

        <button
          onClick={() => {
            setIsSubmitted(false);
            setStep(2);
          }}
          className="mt-6 w-full py-3 bg-[#1D9E75] text-white font-semibold text-xs rounded-xl hover:bg-[#147B5A] max-w-sm mx-auto block"
        >
          Add another room listing
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 page-shell">
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 pt-4 pb-3 pr-18 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                title="Previous step"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-base font-bold font-display text-gray-900 dark:text-white">
              List your property
            </h1>
          </div>

          <span className="text-xs font-bold text-[#1D9E75] bg-[#1D9E75]/10 px-2.5 py-1 rounded-full">
            Step {step} of 3
          </span>
        </div>

        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden mt-2">
          <div
            className="bg-[#1D9E75] h-full transition-all duration-500 rounded-full"
            style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
          <span className={step >= 1 ? "text-[#1D9E75] font-bold" : ""}>
            Basic Info
          </span>
          <span className={step >= 2 ? "text-[#1D9E75] font-bold" : ""}>
            Details & Rent
          </span>
          <span className={step >= 3 ? "text-[#1D9E75] font-bold" : ""}>
            Photos & Finish
          </span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-5">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="surface-card bg-teal-50 dark:bg-gray-800 p-3 rounded-xl border border-teal-100 dark:border-gray-700 text-xs">
              Tip: clear, accurate titles bring more direct inquiries.
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Listing title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Spacious Sunny 2BHK Apartment"
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1D9E75] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Detailed location
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Street name, landmark, city"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1D9E75] focus:outline-none"
                  required
                />

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="p-3 bg-[#1D9E75]/10 text-[#1D9E75] hover:bg-[#1D9E75]/20 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs transition-colors space-x-2"
                  title="Detect current location"
                >
                  {isDetectingLocation ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      <span className="text-[11px]">Current</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Use the map pin to fetch your current device coordinates.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                parseLatLngFromLocationString();
                setStep(2);
              }}
              className="w-full py-3 bg-[#1D9E75] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 mt-4"
            >
              <span>Continue to room setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                  Room type
                </label>
                <select
                  value={roomType}
                  onChange={(e) =>
                    setRoomType(
                      e.target.value as (typeof ROOM_CATEGORIES)[number],
                    )
                  }
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#1D9E75] focus:outline-none cursor-pointer"
                >
                  {ROOM_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                  Monthly rent (NPR)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[11px] font-bold text-gray-400 pointer-events-none">
                    NPR
                  </span>
                  <input
                    type="number"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    placeholder="25000"
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold font-display text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1D9E75] focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Interactive amenities
                </label>
                <span className="text-[10px] text-[#1D9E75] font-medium">
                  Tap items below to toggle
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {AMENITIES_LIST.map((item) => {
                  const isChecked = selectedAmenities.includes(item.id);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleAmenity(item.id)}
                      className={`surface-card p-2.5 rounded-xl border text-left flex items-start space-x-2 transition-all ${
                        isChecked
                          ? "bg-teal-50/80 dark:bg-teal-950/40 border-[#1D9E75] text-gray-900 dark:text-white shadow-2xs"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border text-white transition-colors shrink-0 ${
                          isChecked
                            ? "bg-[#1D9E75] border-[#1D9E75]"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-[11px] font-medium leading-tight select-none">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  parseLatLngFromLocationString();
                  setStep(3);
                }}
                className="w-2/3 py-3 bg-[#1D9E75] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2"
              >
                <span>Continue to upload</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Photo upload zone
              </label>

              {/* Entire zone is now clickable and acts as the upload trigger */}
              <div
                onClick={onUploadZoneClick}
                className={`surface-card border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#1D9E75] rounded-2xl p-6 text-center bg-gray-50/50 dark:bg-gray-800/40 transition-all group ${
                  uploading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <div className="w-12 h-12 bg-[#1D9E75]/10 text-[#1D9E75] rounded-full flex items-center justify-center mx-auto mb-2 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  {uploading ? "Uploading..." : "Tap here to add photos"}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Take a new picture or select files from your device.
                </p>

                {/* Completely hidden input field managed by useRef */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading && (
                  <div className="text-[11px] text-[#1D9E75] font-medium mt-2 animate-pulse">
                    Uploading images…
                  </div>
                )}
              </div>
            </div>

            {photos.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">
                  Uploaded gallery ({photos.length} photos)
                </span>
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {photos.map((url, i) => (
                    <div
                      key={i}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0"
                    >
                      <img
                        src={url}
                        alt={`preview-${i}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotos(photos.filter((_, index) => index !== i));
                        }}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 text-white rounded-full text-[9px] flex items-center justify-center hover:bg-rose-600"
                        title="Remove photo"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="surface-card p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-[11px] text-gray-500 dark:text-gray-400 flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Review your type, rent, and location before publishing the
                listing.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Pick on map
              </label>
              <MapPicker
                lat={lat}
                lng={lng}
                onChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                  setLocation(
                    `Lat ${newLat.toFixed(5)}, Lon ${newLng.toFixed(5)}`,
                  );
                }}
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Drag the marker to set listing coordinates.
              </p>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="w-2/3 py-3 bg-[#1D9E75] text-white rounded-xl font-bold text-xs hover:bg-[#147B5A] active:scale-[0.99] transition-all shadow-xs disabled:opacity-60"
              >
                {uploading ? "Uploading images..." : "Publish to marketplace"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
