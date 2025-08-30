import React, { useEffect, useRef } from 'react';
import toast from "react-hot-toast";

const GoogleSignInButton = ({ onSubmit }) => {
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Comprehensive script loading with multiple fallbacks
    const loadGoogleScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (window.google && window.google.accounts) {
          resolve(window.google);
          return;
        }

        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => {
          console.log('Google Sign-In script loaded successfully');
          
          // Additional check to ensure script is fully loaded
          const checkScriptLoaded = () => {
            if (window.google && window.google.accounts) {
              resolve(window.google);
            } else {
              // Retry loading if not fully initialized
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

    // Comprehensive initialization
    const initializeGoogleSignIn = async () => {
      try {
        // Ensure script is loaded
        await loadGoogleScript();

        // Verify google object exists
        if (!window.google || !window.google.accounts) {
          throw new Error('Google Sign-In script not fully loaded');
        }

        // Comprehensive initialization
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'signin',
        });

        // Ensure button ref exists before rendering
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            { 
              type: "standard",
              theme: "outline", 
               color: "dark", 
              size: "large",
              text: "signin_with",
              shape: "rectangular",
              logo_alignment: "left",
              width: 300
            }
          );

          console.log('Google Sign-In button rendered successfully');
        }
      } catch (error) {
        console.error('Google Sign-In initialization error:', error);
        toast.error('Failed to initialize Google Sign-In');
      }
    };

    // Trigger initialization
    initializeGoogleSignIn();

    // Cleanup function
    return () => {
      try {
        // Attempt to remove event listeners if possible
        window.google?.accounts?.id?.cancel();
      } catch (error) {
        console.warn('Error during Google Sign-In cleanup:', error);
      }
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      // Detailed error checking
      if (!response || !response.credential) {
        console.error('No credential received', response);
        toast.error('Authentication failed');
        return;
      }

      // Decode token with extensive error handling
      const decodedToken = decodeJwtResponse(response.credential);

      // Prepare user data with fallbacks
      const userData = {
        token: response.credential,
        user: {
          id: decodedToken.sub || '',
          email: decodedToken.email || '',
          name: decodedToken.name || '',
          picture: decodedToken.picture || ''
        }
      };

      // Call onSubmit with user data
      onSubmit(userData);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      toast.error('Failed to process Google sign-in');
    }
  };

  // Robust JWT decoding function
  const decodeJwtResponse = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(function(c) {
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

  return (
    <>
    {/* Separator */}
    <div className="flex items-center w-full my-4">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-gray-500 text-sm">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>
      
      <div 
        ref={googleButtonRef}
        className="w-full flex justify-center"
      >
        {/* Google Sign-In button will be rendered here */}
      </div>
      
    </>
  );
};

export default GoogleSignInButton;