// campaigns.ts

import axios from "axios";

export default async function handler(req: any, res: any) {
  const { token, accountId } = req.query; // from frontend or DB

  try {
    // 1️⃣ Fetch campaigns
    const campaignsResponse = await axios.get(
      `https://graph.facebook.com/v17.0/${accountId}/campaigns`,
      {
        params: {
          fields: "id,name,status,objective,start_time,end_time",
          access_token: token,
        },
      }
    );

    const campaigns = campaignsResponse.data.data;

    // 2️⃣ Fetch insights for each campaign
    const campaignsWithInsights = await Promise.all(
      campaigns.map(async (c: any) => {
        const insightsResponse = await axios.get(
          `https://graph.facebook.com/v17.0/${c.id}/insights`,
          {
            params: {
              fields: "impressions,clicks,spend,ctr,cpc,reach",
              access_token: token,
            },
          }
        );
        return { ...c, insights: insightsResponse.data.data[0] || {} };
      })
    );

    res.status(200).json(campaignsWithInsights);
  } catch (error: any) {
    console.error("Error fetching campaigns:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
}
