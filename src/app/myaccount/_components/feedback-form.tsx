"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";

interface Ad {
  ads_type: string
  ad_id: number
  ads_name: string
  image_path: string
  industry: string
  score: number
  platforms: string
  uploaded_on: string
  go_nogo?: string
}

interface AdsApiResponse {
  total: number
  limit: number
  offset: number
  ads: Ad[]
}

const FeedbackForm: React.FC = () => {
  const userId = Cookies.get('userId')
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState<Ad[]>([])
  const [feedbackData, setFeedbackData] = useState({
    ad_upload_id: "",
    rating: "",
    comments: "",
  });

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      if (!userId) return;

      const url = `https://adalyzeai.xyz/App/api.php?gofor=fulladsnamelist&user_id=${userId}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.status && Array.isArray(result.data)) {
        setAds(result.data);
      } else {
        setAds([]);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      setAds([]);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const response = await fetch("https://adalyzeai.xyz/App/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gofor: "feedback",
          user_id: userId,
          ad_upload_id: feedbackData.ad_upload_id,
          rating: feedbackData.rating,
          comments: feedbackData.comments,
        }),
      });

      if (response.ok) {
        toast.success("Feedback submitted successfully!");
        setFeedbackData({ ad_upload_id: "", rating: "", comments: "" });
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl bg-black lg:mt-14 w-full p-6 mx-auto flex flex-col items-left justify-left overflow-hidden">
      <h2 className="text-2xl font-bold mb-6 text-white text-left">
        Submit Your Feedback
      </h2>
      <form onSubmit={handleFeedbackSubmit} className="w-full space-y-4">
        <div>
          <label htmlFor="ad_upload_id" className="block text-sm font-medium mb-2 text-white">
            Ad Upload ID (Optional)
          </label>
          <Select
            value={feedbackData.ad_upload_id}
            onValueChange={(value) => setFeedbackData({ ...feedbackData, ad_upload_id: value })}
          >
            <SelectTrigger className="w-full bg-[#171717] border-[#2b2b2b] text-sm sm:text-base">
              <SelectValue placeholder="Select an ad (optional)" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              <SelectItem value="0">No specific ad</SelectItem>
              {ads.map((ad) => (
                <SelectItem key={ad.ad_id} value={String(ad.ad_id)}>
                  {ad.ads_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium mb-2 text-white">
            Rating (1-10)
          </label>
          <Select
            value={feedbackData.rating}
            onValueChange={(value) =>
              setFeedbackData({ ...feedbackData, rating: value })
            }
          >
            <SelectTrigger
              id="rating"
              className="w-full bg-[#171717] border-[#2b2b2b] text-sm sm:text-base text-white"
            >
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {Array.from({ length: 10 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {i + 1} Star{i + 1 > 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="comments" className="block text-sm font-medium mb-2 text-white">
            Comments
          </label>
          <Textarea
            id="comments"
            value={feedbackData.comments}
            onChange={(e) =>
              setFeedbackData({ ...feedbackData, comments: e.target.value })
            }
            className="bg-[#171717] border-[#2b2b2b] min-h-[80px] sm:min-h-[100px] text-sm sm:text-base text-white"
            placeholder="Share your thoughts and suggestions..."
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full text-sm sm:text-base"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </Button>
      </form>
    </Card>
  );
};

export default FeedbackForm;
