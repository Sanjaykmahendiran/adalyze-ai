// Campaigns-insights.tsx

import { useEffect, useState } from "react";

export default function CampaignsInsights() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const adAccounts = JSON.parse(urlParams.get("adAccounts") || "[]");

    if (token && adAccounts[0]) {
      fetch(`/api/meta/campaigns?token=${token}&accountId=${adAccounts[0].id}`)
        .then((res) => res.json())
        .then((data) => setCampaigns(data));
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Customer Campaigns</h1>
      {campaigns.map((c) => (
        <div key={c.id} style={{ border: "1px solid #ccc", padding: 15, marginBottom: 10 }}>
          <h2>{c.name}</h2>
          <p>Status: {c.status}</p>
          <p>Objective: {c.objective}</p>
          <p>Impressions: {c.insights?.impressions}</p>
          <p>Clicks: {c.insights?.clicks}</p>
          <p>Spend: ₹{c.insights?.spend}</p>
          <p>CTR: {c.insights?.ctr}%</p>
        </div>
      ))}
    </div>
  );
}
