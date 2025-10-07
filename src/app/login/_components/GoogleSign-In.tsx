import React, { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const GoogleSignInButton = ({ onSubmit }) => {
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.accounts) {
          resolve(window.google);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => resolve(window.google);
        script.onerror = (err) => reject(err);

        document.head.appendChild(script);
      });
    };

    const initializeGoogleSignIn = async () => {
      try {
        const google = await loadGoogleScript();

        if (!google?.accounts?.id) throw new Error("Google API not loaded");

        // Initialize Google One Tap / Button
        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: "signin",
        });

        // Render the button
        if (googleButtonRef.current) {
          google.accounts.id.renderButton(googleButtonRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: 300,
          });
        }
      } catch (error) {
        console.error("Google Sign-In initialization error:", error);
        toast.error("Failed to initialize Google Sign-In");
      }
    };

    initializeGoogleSignIn();

    return () => {
      try {
        // Cancel One Tap if needed
        window.google?.accounts?.id?.cancel();
      } catch {}
    };
  }, []);

  // Handle response from Google
  const handleCredentialResponse = (response) => {
    if (!response?.credential) {
      toast.error("Google sign-in failed");
      return;
    }

    try {
      const decoded = decodeJwt(response.credential);

      const userData = {
        token: response.credential,
        user: {
          id: decoded.sub || "",
          email: decoded.email || "",
          name: decoded.name || "",
          picture: decoded.picture || "",
        },
      };

      onSubmit(userData);
    } catch (err) {
      console.error("Token decode error:", err);
      toast.error("Failed to process Google sign-in");
    }
  };

  // Decode JWT token
  const decodeJwt = (token) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  };

  return (
    <>
      {/* Optional separator */}
      <div className="flex items-center w-full my-4">
        <hr className="flex-grow border-white/50" />
        <span className="mx-2 text-white/70 text-sm">or</span>
        <hr className="flex-grow border-white/50" />
      </div>

      {/* Google Sign-In button */}
      <div ref={googleButtonRef} className="w-full flex justify-center" />
    </>
  );
};

export default GoogleSignInButton;
