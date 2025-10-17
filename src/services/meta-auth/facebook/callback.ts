// callback.ts

import axios from "axios";

export default async function handler(req: any, res: any) {
  const { code } = req.query;

  try {
    // Step 1: Exchange code for short-lived access token
    const tokenResponse = await axios.get("https://graph.facebook.com/v17.0/oauth/access_token", {
      params: {
        client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "",
        redirect_uri: process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI || "",
        client_secret: process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET || "",
        code,
      },
    });

    const shortToken = tokenResponse.data.access_token;

    // Step 2: Exchange for long-lived token
    const longTokenResponse = await axios.get("https://graph.facebook.com/v17.0/oauth/access_token", {
      params: {
        grant_type: "fb_exchange_token",
        client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "",
        client_secret: process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET || ""        ,
        fb_exchange_token: shortToken,
      },
    });

    const longLivedToken = longTokenResponse.data.access_token;

    // Step 3: Fetch user’s ad accounts
    const adAccountsResponse = await axios.get("https://graph.facebook.com/v17.0/me/adaccounts", {
      params: {
        access_token: longLivedToken,
      },
    });

    const adAccounts = adAccountsResponse.data.data;

    // Save this token + adAccounts in your database linked to the user
    // e.g., db.user.update({ where: { id: userId }, data: { metaToken: longLivedToken } })

    // Redirect user to dashboard
    res.redirect(`/dashboard?token=${longLivedToken}&adAccounts=${encodeURIComponent(JSON.stringify(adAccounts))}`);
  } catch (error: any) {
    console.error("Error in Meta auth:", error.response?.data || error.message);
    res.status(500).send("Authentication failed");
  }
}
