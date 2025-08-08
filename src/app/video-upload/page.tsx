"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalyzingOverlay } from "../../components/analyzing-overlay";
import { FileUploader } from "./_components/video-file-uploader";
import { extractScreenshots, ScreenshotData } from "@/lib/videoScreenshots";
import cookies from "js-cookie";
import toast from "react-hot-toast";
import UserLayout from "@/components/layouts/user-layout";
import useFetchUserDetails from "@/hooks/useFetchUserDetails";

// Types for country/state
interface Country {
  id: string;
  name: string;
  iso3: string;
  numeric_code: string;
  iso2: string;
  phonecode: string;
  region_id: string;
  subregion_id: string;
  created_at: string;
  updated_at: string;
  flag: string;
}
interface State {
  id: string;
  name: string;
  country_id: string;
  country_code: string;
  fips_code: string;
  iso2: string;
  type: string;
  latitude: string;
  longitude: string;
  created_at: string;
  updated_at: string;
  flag: string;
  wikiDataId: string;
}

export default function VideoUploadPage() {
  const { userDetails } = useFetchUserDetails();
  const router = useRouter();

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [adName, setAdName] = useState("");
  const [platform, setPlatform] = useState("");
  const [industry, setIndustry] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedVideoPath, setUploadedVideoPath] = useState<string | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);

  // Screenshots and Preview states
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<ScreenshotData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ScreenshotData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingScreenshots, setIsProcessingScreenshots] = useState(false);

  // Country/State selectors
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);

  const userId = cookies.get("userId") || "";

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);
  // Fetch states when country changes
  useEffect(() => {
    if (country) {
      fetchStates(country);
      setState("");       // Reset
      setStateSearch(""); // Reset
    } else {
      setStates([]);
      setState("");
      setStateSearch("");
    }
  }, [country]);

  // Filter countries/states on search input
  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );
  const filteredStates = states.filter((s) =>
    s.name.toLowerCase().includes(stateSearch.toLowerCase())
  );

  // Fetch countries
  async function fetchCountries() {
    setLoadingCountries(true);
    try {
      const response = await fetch(
        "https://techades.com/App/api.php?gofor=countrieslist"
      );
      const data: Country[] = await response.json();
      setCountries(data);
    } catch (error) {
      toast.error("Failed to load countries");
    } finally {
      setLoadingCountries(false);
    }
  }
  // Fetch states
  async function fetchStates(countryId: string) {
    setLoadingStates(true);
    try {
      const response = await fetch(
        `https://techades.com/App/api.php?gofor=stateslist&country_id=${countryId}`
      );
      const data: State[] = await response.json();
      setStates(data);
    } catch (error) {
      toast.error("Failed to load states");
    } finally {
      setLoadingStates(false);
    }
  }

  // ----- Handle File Upload (called by FileUploader) -----
  const handleFileChange = async (file: File | null) => {
    setFile(file);
    setScreenshots([]);
    setSelectedImage(null);
    setLocalVideoUrl(file ? URL.createObjectURL(file) : null);
    setScreenshotUrls([]);

    if (file) {
      setIsProcessing(true);
      try {
        const frames = await extractScreenshots(file, 4); // Returns ScreenshotData[]
        setScreenshots(frames);
        setScreenshotUrls(frames.map((frame) => frame.base64));
      } catch (err) {
        toast.error("Screenshot extraction failed: " + (err as Error).message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // ----- Video File Upload (optional: to server, not required for screenshot) -----
  async function uploadFile(fileToUpload: File) {
    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("user_id", userId);

      const response = await fetch("https://adalyzeai.xyz/App/vidupl.php", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
      const result = await response.json();

      if (result.status === "Video Uploaded Successfully" && result.fileUrl) {
        setUploadedVideoPath(result.fileUrl);
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Video upload error: " + (err as Error).message);
    }
  }

  // ----- Form Submit -----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !localVideoUrl) {
      toast.error("Please upload a video file first");
      return;
    }
    setIsAnalyzing(true);

    try {
      const selectedCountry = countries.find((c) => c.id === country);
      const selectedState = states.find((s) => s.id === state);
      const analyzeData = {
        videoPath: localVideoUrl,
        videoFile: file.name,
        user_id: userId,
        ads_name: adName || file.name.split(".")[0],
        industry: industry || "",
        platform: platform || "",
        age: age || "",
        gender: gender || "",
        country: selectedCountry?.name || "",
        state: selectedState?.name || "",
        screenshots: screenshots.map((s) => s.base64),
      };
      console.log("Video analysis data:", analyzeData);
      toast.success("Video analysis completed successfully!");
      // router.push(`/results?ad_id=${Date.now()}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to analyze video ad"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ----- Render -----
  return (
    <UserLayout userDetails={userDetails}>
      <div className="min-h-screen text-white">
        {isAnalyzing && <AnalyzingOverlay />}

        <main className="container mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">
              Upload Video Ad Creative
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Upload your video ad creative for AI-powered analysis and get actionable insights to improve your video ad performance.
            </p>
          </div>

          {/* Main Upload Card */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-[#000000] border-none rounded-3xl shadow-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* File Uploader - your UI */}
                  <FileUploader file={file} onFileChange={handleFileChange} />

                  {/* Processing Status */}
                  {isProcessing && (
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent"></div>
                          <span className="text-blue-400 font-medium">
                            Extracting High-Quality Video Frames...
                          </span>
                        </div>
                        <div className="text-sm text-blue-300 text-center max-w-md">
                          Please wait while we capture clear, high-resolution screenshots from your video for analysis. This process ensures optimal image quality.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Screenshot Success */}
                  {screenshotUrls.length > 0 && !isProcessing && (
                    <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-4 w-4 rounded-full bg-green-400"></div>
                        <span className="text-green-400 text-sm">
                          {screenshotUrls.length} high-quality video frames extracted and ready for analysis
                        </span>
                      </div>
                      <div className="text-xs text-green-300 mt-2 ml-7">
                        Screenshots captured with enhanced clarity and optimal timing
                      </div>
                    </div>
                  )}

                  {/* Video Preview Section always (if needed) */}
                  {localVideoUrl && (
                    <div className="space-y-4">
                      <div className="border-t border-[#2b2b2b] pt-6">
                        <h3 className="text-lg font-semibold text-gray-300 mb-4">
                          Video Preview
                        </h3>
                      </div>
                      <div className="bg-[#121212] border border-[#2b2b2b] rounded-xl p-4">
                        <video
                          src={localVideoUrl}
                          controls
                          className="w-full max-w-md mx-auto rounded-lg"
                          style={{ maxHeight: "300px" }}
                        >
                          Your browser does not support the video tag.
                        </video>
                        <p className="text-sm text-gray-400 text-center mt-2">
                          {file?.name} • {(file ? file.size / 1024 / 1024 : 0).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-3">
                    <Label htmlFor="adName" className="text-gray-300 font-semibold">
                      Video Ad Name
                    </Label>
                    <Input
                      id="adName"
                      placeholder="Enter a name for your video ad"
                      value={adName}
                      onChange={(e) => setAdName(e.target.value)}
                      className="bg-[#121212] border-[#2b2b2b] text-white placeholder-gray-500 rounded-2xl h-12 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="industry" className="text-gray-300 font-semibold">
                        Industry Category
                      </Label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger
                          id="industry"
                          className="w-full bg-[#121212] border-[#2b2b2b] text-white rounded-2xl py-6 focus:border-blue-500 focus:ring-blue-500"
                        >
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                          <SelectItem value="retail">Retail & E-commerce</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance & Banking</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="travel">Travel & Hospitality</SelectItem>
                          <SelectItem value="food">Food & Beverage</SelectItem>
                          <SelectItem value="entertainment">Entertainment & Media</SelectItem>
                          <SelectItem value="automotive">Automotive</SelectItem>
                          <SelectItem value="real-estate">Real Estate</SelectItem>
                          <SelectItem value="service">Service & Cleaning</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="platform" className="text-gray-300 font-semibold">
                        Platform Target
                      </Label>
                      <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger
                          id="platform"
                          className="w-full bg-[#121212] border-[#2b2b2b] text-white rounded-2xl py-6 focus:border-blue-500 focus:ring-blue-500"
                        >
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="twitter">Twitter/X</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="youtube-shorts">YouTube Shorts</SelectItem>
                          <SelectItem value="snapchat">Snapchat</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Demographics */}
                  <div className="space-y-6">
                    <div className="border-t border-[#2b2b2b] pt-6">
                      <h3 className="text-lg font-semibold text-gray-300 mb-4">Target Demographics</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="age" className="text-gray-300 font-semibold">
                          Age Group
                        </Label>
                        <Select value={age} onValueChange={setAge}>
                          <SelectTrigger
                            id="age"
                            className="w-full bg-[#121212] border-[#2b2b2b] text-white rounded-2xl py-6 focus:border-blue-500 focus:ring-blue-500"
                          >
                            <SelectValue placeholder="Select age group" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                            <SelectItem value="13-17">13-17 years</SelectItem>
                            <SelectItem value="18-24">18-24 years</SelectItem>
                            <SelectItem value="25-34">25-34 years</SelectItem>
                            <SelectItem value="35-44">35-44 years</SelectItem>
                            <SelectItem value="45-54">45-54 years</SelectItem>
                            <SelectItem value="55-64">55-64 years</SelectItem>
                            <SelectItem value="65+">65+ years</SelectItem>
                            <SelectItem value="all">All Ages</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="gender" className="text-gray-300 font-semibold">
                          Gender
                        </Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger
                            id="gender"
                            className="w-full bg-[#121212] border-[#2b2b2b] text-white rounded-2xl py-6 focus:border-blue-500 focus:ring-blue-500"
                          >
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                            <SelectItem value="all">All Genders</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* Country/State */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="country" className="text-gray-300 font-semibold">
                          Country
                        </Label>
                        <Select
                          value={country}
                          onValueChange={setCountry}
                          disabled={loadingCountries}
                        >
                          <SelectTrigger
                            id="country"
                            className="w-full bg-[#121212] border-[#2b2b2b] text-white rounded-2xl py-6 focus:border-blue-500 focus:ring-blue-500"
                          >
                            <SelectValue placeholder={loadingCountries ? "Loading countries..." : "Select country"} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b] max-h-60">
                            <div className="p-2">
                              <Input
                                placeholder="Search countries..."
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                className="bg-[#121212] border-[#2b2b2b] text-white placeholder-gray-500 h-8 text-sm"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {filteredCountries.length > 0 ? (
                                filteredCountries.map((countryItem) => (
                                  <SelectItem
                                    key={countryItem.id}
                                    value={countryItem.id}
                                    className="text-white hover:bg-gray-800"
                                  >
                                    {countryItem.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-gray-400 text-sm">No countries found</div>
                              )}
                            </div>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="state" className="text-gray-300 font-semibold">
                          State/Province
                        </Label>
                        <Select
                          value={state}
                          onValueChange={setState}
                          disabled={!country || loadingStates}
                        >
                          <SelectTrigger
                            id="state"
                            className="w-full bg-[#121212] border-[#2b2b2b] text-white rounded-2xl py-6 focus:border-blue-500 focus:ring-blue-500"
                          >
                            <SelectValue placeholder={
                              !country
                                ? "Select country first"
                                : loadingStates
                                  ? "Loading states..."
                                  : "Select state"
                            } />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b] max-h-60">
                            {states.length > 0 && (
                              <div className="p-2">
                                <Input
                                  placeholder="Search states..."
                                  value={stateSearch}
                                  onChange={(e) => setStateSearch(e.target.value)}
                                  className="bg-[#121212] border-[#2b2b2b] text-white placeholder-gray-500 h-8 text-sm"
                                />
                              </div>
                            )}
                            <div className="max-h-48 overflow-y-auto">
                              {filteredStates.length > 0 ? (
                                filteredStates.map((stateItem) => (
                                  <SelectItem
                                    key={stateItem.id}
                                    value={stateItem.id}
                                    className="text-white hover:bg-gray-800"
                                  >
                                    {stateItem.name}
                                  </SelectItem>
                                ))
                              ) : states.length > 0 ? (
                                <div className="p-2 text-gray-400 text-sm">No states found</div>
                              ) : null}
                            </div>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-center mt-8">
                    <Button
                      type="submit"
                      size="lg"
                      className="text-white px-12 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      disabled={!file || !localVideoUrl || isAnalyzing || isProcessing}
                    >
                      {isAnalyzing
                        ? "Analyzing Video..."
                        : isProcessing
                        ? "Processing Screenshots..."
                        : "Analyze Video Now"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Screenshots Preview Section */}
          {screenshots.length > 0 && (
            <div className="space-y-4">
              <div className="border-t border-[#2b2b2b] pt-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Extracted Video Frames</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {screenshots.map((screenshot, index) => (
                  <div key={index} className="relative group">
                    <div className="bg-[#121212] border border-[#2b2b2b] rounded-xl p-3">
                      <div className="relative overflow-hidden rounded-lg mb-2">
                        <img
                          src={screenshot.base64}
                          alt={`Video frame ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer"
                          style={{
                            imageRendering: "high-quality",
                            filter: "contrast(1.05) brightness(1.02)",
                          }}
                          loading="lazy"
                          onClick={() => setSelectedImage(screenshot)}
                        />
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          {screenshot.timestamp.toFixed(1)}s
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 text-center">
                        Frame {index + 1} • High Quality
                      </div>
                    </div>
                    {/* Optional: Hover preview */}
                    <div className="absolute inset-0 bg-black/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                      <div
                        className="bg-white p-2 rounded-lg shadow-2xl"
                        style={{ maxWidth: "300px", maxHeight: "200px" }}
                      >
                        <img
                          src={screenshot.base64}
                          alt={`Video frame ${index + 1} preview`}
                          className="w-full h-full object-contain rounded"
                          style={{
                            imageRendering: "high-quality",
                            filter: "contrast(1.05) brightness(1.02) saturate(1.1)",
                          }}
                        />
                        <div className="text-xs text-gray-700 text-center mt-1 font-medium">
                          {screenshot.timestamp.toFixed(1)}s - Frame {index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Image Modal */}
          {selectedImage && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
              <div className="relative max-w-5xl w-full max-h-screen overflow-auto">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 text-white text-3xl font-bold z-50"
                >
                  &times;
                </button>
                {/* Full Image */}
                <img
                  src={selectedImage.base64}
                  alt="Full preview"
                  className="w-full h-auto rounded-lg border border-gray-700 shadow-xl"
                  style={{
                    imageRendering: "high-quality",
                    filter: "contrast(1.05) brightness(1.02) saturate(1.1)",
                  }}
                />
                {/* Caption */}
                <div className="text-sm text-gray-300 text-center mt-2">
                  {selectedImage.timestamp.toFixed(1)}s - Full Frame View
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </UserLayout>
  );
}
