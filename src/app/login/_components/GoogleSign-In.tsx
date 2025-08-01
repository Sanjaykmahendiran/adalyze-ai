"use client";

import React, { useEffect } from 'react';
import toast from "react-hot-toast";

const GoogleSignInButton = ({  }) => {
  useEffect(() => {
    const loadGoogleScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.accounts) {
          resolve(window.google);
          return;
        }

        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => {
          const checkScriptLoaded = () => {
            if (window.google && window.google.accounts) {
              resolve(window.google);
            } else {
              setTimeout(checkScriptLoaded, 100);
            }
          };
          checkScriptLoaded();
        };

        script.onerror = (error) => {
          console.error('Failed to load Google Sign-In script:', error);
          reject(error);
        };

        document.head.appendChild(script);
      });
    };

    const initializeGoogleSignIn = async () => {
      try {
        await loadGoogleScript();

        if (!window.google || !window.google.accounts) {
          throw new Error('Google Sign-In script not fully loaded');
        }

        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'signin',
        });

      } catch (error) {
        console.error('Google Sign-In initialization error:', error);
        toast.error('Failed to initialize Google Sign-In');
      }
    };

    initializeGoogleSignIn();

    return () => {
      try {
        window.google?.accounts?.id?.cancel();
      } catch (error) {
        console.warn('Error during Google Sign-In cleanup:', error);
      }
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      if (!response || !response.credential) {
        console.error('No credential received', response);
        toast.error('Authentication failed');
        return;
      }

      const decodedToken = decodeJwtResponse(response.credential);

      const userData = {
        token: response.credential,
        user: {
          id: decodedToken.sub || '',
          email: decodedToken.email || '',
          name: decodedToken.name || '',
          picture: decodedToken.picture || ''
        }
      };

      // onSubmit(userData);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      toast.error('Failed to process Google sign-in');
    }
  };

  const decodeJwtResponse = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Token decoding error:', error);
      throw new Error('Invalid token format');
    }
  };

  const handleClick = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      toast.error('Google Sign-In not ready');
    }
  };

  return (
    <>
      {/* Separator */}
      <div className="flex items-center w-full my-4">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-gray-500 text-sm">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      {/* Custom Google Sign-In Button */}
      <div className="w-full flex justify-center">
        <button
          onClick={handleClick}
          className="w-full max-w-xs bg-[#121212] text-gray-300 px-4 py-2 border border-[#2b2b2b] rounded-md flex items-center justify-center gap-2  hover:bg-[#1e1e1e] transition"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5"
          />
          <span>Sign in with Google</span>
        </button>
      </div>
    </>
  );
};

export default GoogleSignInButton;
