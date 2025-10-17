// components/SocialLoginButtons.tsx
"use client"
import React, { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import FacebookLogin from "@greatsumini/react-facebook-login"

const SocialLoginButtons = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const googleButtonRef = useRef(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadGoogleScript = () =>
      new Promise((resolve, reject) => {
        if (window.google?.accounts) return resolve(window.google)
        const script = document.createElement("script")
        script.src = "https://accounts.google.com/gsi/client"
        script.async = true
        script.defer = true
        script.onload = () => resolve(window.google)
        script.onerror = reject
        document.head.appendChild(script)
      })

    const initializeGoogleSignIn = async () => {
      try {
        const google = await loadGoogleScript()
        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        })
        google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
        })
      } catch {
        toast.error("Failed to load Google Sign-In")
      }
    }
    initializeGoogleSignIn()
    return () => window.google?.accounts?.id?.cancel?.()
  }, [])

  const handleGoogleResponse = (response) => {
    if (!response?.credential) return toast.error("Google login failed")
    const payload = JSON.parse(atob(response.credential.split(".")[1]))
    onSubmit({ token: response.credential, user: { ...payload } })
  }

  const handleFacebookLogin = async (response) => {
    if (!response?.accessToken) return toast.error("Facebook login failed")
    setLoading(true)
    onSubmit({ facebook_token: response.accessToken, user: response })
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      <div ref={googleButtonRef} />
      <FacebookLogin
        appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ""}
        onSuccess={handleFacebookLogin}
        onFail={() => toast.error("Facebook login failed")}
        useRedirect={false}
        render={({ onClick }) => (
          <button onClick={onClick} disabled={loading} className="bg-blue-600 px-6 py-3 text-white rounded-lg">
            {loading ? "Logging in..." : "Continue with Facebook"}
          </button>
        )}
      />
    </div>
  )
}

export default SocialLoginButtons
