/**
 * Tests for AuthLoginForm — password reset flow
 *
 * Sprint 1 bug fixed: replaced 3 raw fetch() calls with
 *   authService.forgotPasswordOtp(), authService.verifyOtp(), authService.resetPassword()
 *
 * These tests verify that:
 *  - forgotPasswordOtp is called with { email } (not a URL-encoded query string)
 *  - verifyOtp is called with { email, otp }
 *  - resetPassword is called with { email, password, confirmpassword }
 *  - No raw fetch() calls exist in the component (static source check)
 *  - The UI progresses through initial → resetPassword step after OTP verification
 *
 * Test infrastructure note: see useFetchUserDetails.test.ts header for the required
 * jest.config.js and jest.setup.ts configuration that must be in place before running.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mocks must be declared before the component import
jest.mock("@/services/authService");
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
// Silence toast in tests — we only care about the service calls
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
  Toaster: () => null,
}));
// GoogleSignInButton pulls in OAuth SDK — replace with a no-op
jest.mock("@/app/login/_components/GoogleSign-In", () => ({
  __esModule: true,
  default: () => null,
}));

import * as authService from "@/services/authService";

const mockForgotPasswordOtp = authService.forgotPasswordOtp as jest.MockedFunction<
  typeof authService.forgotPasswordOtp
>;
const mockVerifyOtp = authService.verifyOtp as jest.MockedFunction<
  typeof authService.verifyOtp
>;
const mockResetPassword = authService.resetPassword as jest.MockedFunction<
  typeof authService.resetPassword
>;

import AuthLoginForm from "@/app/login/_components/auth-login-form";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const noop = jest.fn();

/** Render the form and open the "Forgot Password?" reset panel. */
async function renderAndOpenReset() {
  const user = userEvent.setup();
  render(<AuthLoginForm onSubmit={noop} loading={false} />);

  const forgotPasswordBtn = screen.getByRole("button", { name: /forgot password/i });
  await user.click(forgotPasswordBtn);

  return user;
}

// ---------------------------------------------------------------------------
// Static contract test — no raw fetch() in component source
// ---------------------------------------------------------------------------

describe("AuthLoginForm source contract", () => {
  it("does not contain any raw fetch( call — all network calls go through authService", () => {
    // Read the compiled module's source by inspecting the mock registry. A simpler
    // approach is to read the file and assert the absence of 'fetch(' outside comments.
    const fs = require("fs");
    const path = require("path");
    const componentSource = fs.readFileSync(
      path.resolve(__dirname, "../auth-login-form.tsx"),
      "utf8"
    );

    // Strip single-line comments, then check
    const sourceWithoutComments = componentSource
      .split("\n")
      .map((line: string) => line.replace(/\/\/.*$/, ""))
      .join("\n");

    expect(sourceWithoutComments).not.toMatch(/\bfetch\s*\(/);
  });
});

// ---------------------------------------------------------------------------
// forgotPasswordOtp — called with { email } body payload
// ---------------------------------------------------------------------------

describe("handleSendCode — forgotPasswordOtp service call", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls forgotPasswordOtp with { email } as a plain object (not URL-encoded)", async () => {
    mockForgotPasswordOtp.mockResolvedValueOnce({
      status: "success",
      data: { user_id: 99 },
    });

    const user = await renderAndOpenReset();

    const emailInput = screen.getByRole("textbox");
    await user.type(emailInput, "user@example.com");

    const sendCodeBtn = screen.getByRole("button", { name: /send code/i });
    await user.click(sendCodeBtn);

    await waitFor(() => {
      expect(mockForgotPasswordOtp).toHaveBeenCalledTimes(1);
    });

    const [calledWith] = mockForgotPasswordOtp.mock.calls[0];

    // Must be a plain object — not "email=user%40example.com" or a FormData
    expect(calledWith).toEqual({ email: "user@example.com" });
    expect(typeof calledWith).toBe("object");
    expect(calledWith).not.toBeInstanceOf(FormData);
    expect(typeof calledWith).not.toBe("string");
  });

  it("does not call verifyOtp or resetPassword when only requesting OTP", async () => {
    mockForgotPasswordOtp.mockResolvedValueOnce({
      status: "success",
      data: { user_id: 99 },
    });

    const user = await renderAndOpenReset();

    await user.type(screen.getByRole("textbox"), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send code/i }));

    await waitFor(() => {
      expect(mockForgotPasswordOtp).toHaveBeenCalledTimes(1);
    });

    expect(mockVerifyOtp).not.toHaveBeenCalled();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it("shows an error toast and does not call the service when email is empty", async () => {
    const toast = require("react-hot-toast").default;
    await renderAndOpenReset();

    // Do not type anything into the email field
    const sendCodeBtn = screen.getByRole("button", { name: /send code/i });
    fireEvent.click(sendCodeBtn);

    await waitFor(() => {
      expect(mockForgotPasswordOtp).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Please enter your email first");
    });
  });
});

// ---------------------------------------------------------------------------
// verifyOtp — called with { email, otp }
// ---------------------------------------------------------------------------

describe("handleVerifyOTP — verifyOtp service call", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls verifyOtp with { email, otp } as a plain object", async () => {
    mockForgotPasswordOtp.mockResolvedValueOnce({
      status: "success",
      data: { user_id: 99 },
    });
    mockVerifyOtp.mockResolvedValueOnce({
      status: "success",
      data: { message: "OTP is success" },
    });

    const user = await renderAndOpenReset();

    await user.type(screen.getByRole("textbox"), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send code/i }));

    await waitFor(() => expect(mockForgotPasswordOtp).toHaveBeenCalledTimes(1));

    const codeInput = screen.getByPlaceholderText(/enter code/i);
    await user.type(codeInput, "123456");

    const verifyBtn = screen.getByRole("button", { name: /verify otp/i });
    await user.click(verifyBtn);

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledTimes(1);
    });

    const [calledWith] = mockVerifyOtp.mock.calls[0];

    expect(calledWith).toEqual({ email: "user@example.com", otp: "123456" });
    // Must be a plain object — not a URL-encoded body
    expect(typeof calledWith).toBe("object");
    expect(calledWith).not.toBeInstanceOf(FormData);
    expect(typeof calledWith).not.toBe("string");
  });

  it("advances to the resetPassword step on successful OTP verification", async () => {
    mockForgotPasswordOtp.mockResolvedValueOnce({
      status: "success",
      data: { user_id: 99 },
    });
    mockVerifyOtp.mockResolvedValueOnce({
      status: "success",
      data: { message: "OTP is success" },
    });

    const user = await renderAndOpenReset();

    await user.type(screen.getByRole("textbox"), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send code/i }));
    await waitFor(() => expect(mockForgotPasswordOtp).toHaveBeenCalledTimes(1));

    await user.type(screen.getByPlaceholderText(/enter code/i), "123456");
    await user.click(screen.getByRole("button", { name: /verify otp/i }));

    // After successful verification the UI should show the Update Password button
    // and the new-password label (labels have no htmlFor so we query by text)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /update password/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/new password/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// resetPassword — called with { email, password, confirmpassword }
// ---------------------------------------------------------------------------

describe("handleUpdatePassword — resetPassword service call", () => {
  beforeEach(() => jest.clearAllMocks());

  async function reachResetPasswordStep() {
    mockForgotPasswordOtp.mockResolvedValueOnce({
      status: "success",
      data: { user_id: 99 },
    });
    mockVerifyOtp.mockResolvedValueOnce({
      status: "success",
      data: { message: "OTP is success" },
    });

    const user = userEvent.setup();
    render(<AuthLoginForm onSubmit={noop} loading={false} />);

    await user.click(screen.getByRole("button", { name: /forgot password/i }));
    await user.type(screen.getByRole("textbox"), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send code/i }));
    await waitFor(() => expect(mockForgotPasswordOtp).toHaveBeenCalledTimes(1));

    await user.type(screen.getByPlaceholderText(/enter code/i), "123456");
    await user.click(screen.getByRole("button", { name: /verify otp/i }));
    await waitFor(() => expect(mockVerifyOtp).toHaveBeenCalledTimes(1));

    // Wait for the resetPassword step to render
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /update password/i })).toBeInTheDocument();
    });

    return user;
  }

  /**
   * The resetPassword step renders two password inputs with no id/aria-label —
   * they are associated with labels only by visual proximity.
   * We query them by DOM order: [0] = newPassword, [1] = confirmPassword.
   */
  function getPasswordInputs() {
    // The read-only email input comes first (type=email), then the two password inputs
    const passwordInputs = document
      .querySelectorAll<HTMLInputElement>("input[type=password]");
    if (passwordInputs.length < 2) {
      throw new Error(
        `Expected at least 2 password inputs on the resetPassword step, found ${passwordInputs.length}`
      );
    }
    return { newPasswordInput: passwordInputs[0], confirmPasswordInput: passwordInputs[1] };
  }

  it("calls resetPassword with { email, password, confirmpassword } as a plain object", async () => {
    mockResetPassword.mockResolvedValueOnce({
      status: "success",
      data: { message: "Password Updated Successfully" },
    });

    const user = await reachResetPasswordStep();

    const { newPasswordInput, confirmPasswordInput } = getPasswordInputs();

    await user.type(newPasswordInput, "NewPass123!");
    await user.type(confirmPasswordInput, "NewPass123!");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledTimes(1);
    });

    const [calledWith] = mockResetPassword.mock.calls[0];

    // Must use { email, password, confirmpassword } — the exact shape the API expects
    expect(calledWith).toEqual({
      email: "user@example.com",
      password: "NewPass123!",
      confirmpassword: "NewPass123!",
    });

    // Must be a plain object — not URL-encoded or FormData
    expect(typeof calledWith).toBe("object");
    expect(calledWith).not.toBeInstanceOf(FormData);
    expect(typeof calledWith).not.toBe("string");
  });

  it("does not call resetPassword when new password and confirm password do not match", async () => {
    const toast = require("react-hot-toast").default;

    const user = await reachResetPasswordStep();
    const { newPasswordInput, confirmPasswordInput } = getPasswordInputs();

    await user.type(newPasswordInput, "Password1!");
    await user.type(confirmPasswordInput, "DifferentPassword!");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Passwords do not match");
    });

    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it("shows success state and does not call verifyOtp or forgotPasswordOtp again on success", async () => {
    mockResetPassword.mockResolvedValueOnce({
      status: "success",
      data: { message: "Password Updated Successfully" },
    });

    const user = await reachResetPasswordStep();
    const { newPasswordInput, confirmPasswordInput } = getPasswordInputs();

    await user.type(newPasswordInput, "NewPass123!");
    await user.type(confirmPasswordInput, "NewPass123!");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/password reset successful/i)).toBeInTheDocument();
    });

    // No extraneous service calls should have occurred beyond the initial ones
    expect(mockForgotPasswordOtp).toHaveBeenCalledTimes(1);
    expect(mockVerifyOtp).toHaveBeenCalledTimes(1);
    expect(mockResetPassword).toHaveBeenCalledTimes(1);
  });
});
