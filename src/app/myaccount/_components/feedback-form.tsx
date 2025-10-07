"use client";

import React, { useState } from "react";
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

const FeedbackForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    ad_upload_id: "",
    rating: "",
    comments: "",
  });

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const userId = Cookies.get("userId");

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
    <Card className="rounded-2xl bg-black lg:mt-10 w-full p-6 mx-auto flex flex-col items-left justify-left overflow-hidden">
      <h2 className="text-2xl font-bold mb-6 text-white text-left">
        Submit Your Feedback
      </h2>
      <form onSubmit={handleFeedbackSubmit} className="w-full space-y-4">
        <div>
          <label htmlFor="ad_upload_id" className="block text-sm font-medium mb-2 text-white">
            Ad Upload ID (Optional)
          </label>
          <Input
            id="ad_upload_id"
            value={feedbackData.ad_upload_id}
            onChange={(e) =>
              setFeedbackData({ ...feedbackData, ad_upload_id: e.target.value })
            }
            className="bg-[#171717] border-[#2b2b2b] text-sm sm:text-base text-white"
            placeholder="Enter ad upload ID if applicable"
          />
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
            <SelectContent>
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
