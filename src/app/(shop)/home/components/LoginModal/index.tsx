"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useUIStore } from "@/state/ui.store";
import { useToastStore } from "@/state/toast.store";
import { useAuthStore } from "@/state/auth.store";

import {
  useRequestOtp,
  useVerifyOtp,
  useSocialLogin,
  useUpdateProfile,
} from "@/api/queries/useAuth";
import { useSetLocation } from "@/api/queries/useSession";

import { CompleteAccountSetup } from "./CompleteAccountSetup";
import { DeliveryAddressSetup } from "./DeliveryAddressSetup";
import { OTPScreen } from "./OTPScreen";
import { MobileInputForm } from "./MobileInputForm";

import {
  getCleanMobileNumber,
  isValidMobileNumber,
} from "@/utils/formatMobileNumber";
import { isValidNic, normalizeNic } from "@/utils/nic";
import {
  PROFILE_FIELDS,
  getMissingProfileFields,
} from "@/utils/profileCompletion";
import { isSafeRedirectUrl } from "@/utils/urlSecurity";
import {
  ProfileField,
  UpdateProfileRequest,
  User,
} from "@/interfaces/auth.interface";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

export const LoginModal: React.FC = () => {
  const router = useRouter();
  const {
    isLoginModalOpen,
    closeLoginModal,
    setIsLoggedIn,
    setSelectedLocation,
    postLoginRedirect,
    setPostLoginRedirect,
  } = useUIStore();

  useBodyScrollLock(isLoginModalOpen);

  const addToast = useToastStore((state) => state.addToast);
  const { user } = useAuthStore();

  // Steps: "mobile" -> "otp" -> "details" (if new user) -> "address"
  const [step, setStep] = useState<"mobile" | "otp" | "details" | "address">(
    "mobile",
  );

  // Account Type Flag (true = existing user account, false = new user signup)
  const [isExistingUser, setIsExistingUser] = useState<boolean>(true);

  // Form Fields State
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [fullName, setFullName] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // Profile fields the account still owes, and the error shown under each
  const [missingFields, setMissingFields] =
    useState<ProfileField[]>(PROFILE_FIELDS);
  const [profileErrors, setProfileErrors] = useState<
    Partial<Record<ProfileField, string>>
  >({});

  // Address Fields State
  const [province, setProvince] = useState("Western");
  const [district, setDistrict] = useState("Colombo");
  const [city, setCity] = useState("Colombo 03 (Colpetty)");
  const [houseAddress, setHouseAddress] = useState(
    "No. 42/3, Alfred House Gardens",
  );
  const [landmark, setLandmark] = useState("Near British Council");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Countdown timer for OTP resend (in seconds)
  const [timer, setTimer] = useState<number>(180);
  const [canResend, setCanResend] = useState<boolean>(false);

  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // TanStack Query API Mutations
  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtp();
  const socialLoginMutation = useSocialLogin();
  const updateProfileMutation = useUpdateProfile();
  const setLocationMutation = useSetLocation();

  const isSubmitting =
    requestOtpMutation.isPending ||
    verifyOtpMutation.isPending ||
    socialLoginMutation.isPending ||
    updateProfileMutation.isPending ||
    setLocationMutation.isPending;

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isLoginModalOpen) return null;

  // Step 1: Send OTP Handler
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidMobileNumber(mobileNumber)) {
      addToast({
        title: "Invalid Phone Number",
        message: "Please enter a valid Sri Lankan mobile number",
        type: "error",
      });
      return;
    }

    const cleanNumber = getCleanMobileNumber(mobileNumber);
    setMobileNumber(cleanNumber);
    const formattedPhone = cleanNumber.startsWith("+")
      ? cleanNumber
      : `+94${cleanNumber.replace(/^0/, "")}`;

    try {
      const response = await requestOtpMutation.mutateAsync({
        phone: formattedPhone,
      });

      setTimer(response.expiresInSeconds || 180);
      setCanResend(false);
      setOtpCode(["", "", "", "", "", ""]);
      setStep("otp");
      addToast({
        title: "OTP Sent",
        message:
          response.message || `Verification code sent to ${formattedPhone}`,
        type: "success",
      });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to send verification code.";
      addToast({
        title: "Request Failed",
        message: errorMessage,
        type: "error",
      });
    }
  };

  // After any sign-in (OTP or Google): the backend auto registers / logs in
  // the user. The account is the same one the mobile app uses, so it is asked
  // only for the fields it still lacks.
  const continueAfterSignIn = (verifiedUser: User, message?: string) => {
    setIsLoggedIn(true);
    const missing = getMissingProfileFields(verifiedUser);
    setMissingFields(missing);
    setProfileErrors({});
    setFullName(verifiedUser?.fullName || "");
    setNicNumber(verifiedUser?.nic || "");
    setEmail(verifiedUser?.email || "");

    if (missing.length > 0) {
      setIsExistingUser(false);
      setStep("details");
    } else {
      setIsExistingUser(true);
      setStep("address");
    }

    addToast({
      title: "Authenticated",
      message: message || "Logged in successfully!",
      type: "success",
    });
  };

  // Google sign-in: the ID token goes to the server, which verifies it
  // against Google's keys and the nonce before opening a session.
  const handleGoogleCredential = async (idToken: string, nonce: string) => {
    try {
      const response = await socialLoginMutation.mutateAsync({
        provider: "google",
        idToken,
        nonce,
      });
      if (!response.tokens?.accessToken) {
        throw new Error("Google sign-in did not complete. Please try again.");
      }
      continueAfterSignIn(response.user, response.message);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      addToast({
        title: "Google Sign-in Failed",
        message:
          (typeof error?.response?.data?.detail === "string"
            ? error.response.data.detail
            : "") || "Google sign-in did not complete. Please try again.",
        type: "error",
      });
    }
  };

  // Step 2: Verify OTP Handler
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otpCode.join("");
    if (code.length < 6) return;

    const cleanNumber = getCleanMobileNumber(mobileNumber);
    const formattedPhone = cleanNumber.startsWith("+")
      ? cleanNumber
      : `+94${cleanNumber.replace(/^0/, "")}`;

    try {
      const response = await verifyOtpMutation.mutateAsync({
        phone: formattedPhone,
        code,
      });

      continueAfterSignIn(response.user, response.message);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Invalid or expired verification code.";
      addToast({
        title: "Verification Failed",
        message: errorMessage,
        type: "error",
      });
    }
  };

  // Step 3: Complete Registration Form Handler -> proceed to Address setup
  const handleCompleteSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const asks = (field: ProfileField) => missingFields.includes(field);

    const errors: Partial<Record<ProfileField, string>> = {};
    if (asks("full_name") && fullName.trim().length < 2) {
      errors.full_name = "Please enter your full name";
    }
    if (asks("nic") && !isValidNic(nicNumber)) {
      errors.nic =
        "Enter your NIC exactly as it is on your card (12 digits, or 9 digits and V/X)";
    }
    if (asks("email") && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Only the fields the account lacks are sent. A field it already has was
    // saved by the customer on another device and must not be written over.
    const payload: UpdateProfileRequest = {};
    if (asks("full_name")) payload.full_name = fullName.trim();
    if (asks("nic")) payload.nic = normalizeNic(nicNumber);
    if (asks("email")) payload.email = email.trim();

    try {
      const response = await updateProfileMutation.mutateAsync(payload);
      setMissingFields(getMissingProfileFields(response.user));

      addToast({
        title: "Profile Updated",
        message: "Your profile details have been saved.",
        type: "success",
      });
      setStep("address");
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            detail?: unknown;
            error?: {
              code?: string;
              message?: string;
              field?: string;
              errors?: Record<string, string>;
            };
          };
        };
        message?: string;
      };
      const apiError = error?.response?.data?.error;
      const detail = error?.response?.data?.detail;
      const errorMessage =
        apiError?.message ||
        (typeof detail === "string" ? detail : "") ||
        error?.message ||
        "Failed to update profile.";

      // Show the refusal on the field it is about (a NIC or email that is
      // already registered, a NIC that cannot be changed).
      const fieldErrors: Partial<Record<ProfileField, string>> = {};
      PROFILE_FIELDS.forEach((field) => {
        if (apiError?.errors?.[field] || apiError?.field === field) {
          fieldErrors[field] = errorMessage;
        }
      });
      setProfileErrors(fieldErrors);

      addToast({
        title: "Update Failed",
        message: errorMessage,
        type: "error",
      });
    }
  };

  // Step 4: Confirm Address Handler
  const handleConfirmAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if selectedAddressId is a valid UUID before sending to backend
    const isUuid = (str: string) =>
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

    if (selectedAddressId && isUuid(selectedAddressId)) {
      try {
        await setLocationMutation.mutateAsync({
          address_id: selectedAddressId,
        });
      } catch {
        // Graceful fallback for demo or dev environment
      }
    }

    // Set selected location string in UI state
    const locationDisplay = city || district || province || "Colombo";
    setSelectedLocation(locationDisplay);

    setIsLoggedIn(true);
    setSuccessMessage(
      `Welcome back, ${user?.fullName || fullName || "Valued Customer"}!`,
    );
    setIsSuccess(true);

    setTimeout(() => {
      handleResetAndClose();
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedValues = value.slice(0, 6).split("");
      const newOtp = [...otpCode];
      pastedValues.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtpCode(newOtp);
      const nextIndex = Math.min(pastedValues.length, 5);
      document.getElementById(`otp-input-${nextIndex}`)?.focus();
      return;
    }

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }

    if (newOtp.every((digit) => digit !== "") && value !== "") {
      setTimeout(() => {
        handleVerifyOtp();
      }, 300);
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    const cleanNumber = getCleanMobileNumber(mobileNumber);
    const formattedPhone = cleanNumber.startsWith("+")
      ? cleanNumber
      : `+94${cleanNumber.replace(/^0/, "")}`;

    try {
      const response = await requestOtpMutation.mutateAsync({
        phone: formattedPhone,
      });
      setTimer(response.expiresInSeconds || 180);
      setCanResend(false);
      setOtpCode(["", "", "", "", "", ""]);
      addToast({
        title: "OTP Resent",
        message:
          response.message || "A new 6-digit code has been sent via SMS.",
        type: "info",
      });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      addToast({
        title: "Resend Failed",
        message:
          error?.response?.data?.detail ||
          "Could not resend OTP. Please try again.",
        type: "error",
      });
    }
  };

  const handleResetAndClose = () => {
    setStep("mobile");
    setIsExistingUser(true);
    setIsSuccess(false);
    setMobileNumber("");
    setOtpCode(["", "", "", "", "", ""]);
    setFullName("");
    setNicNumber("");
    setEmail("");
    setReferralCode("");
    setMissingFields(PROFILE_FIELDS);
    setProfileErrors({});
    setProvince("Western");
    setDistrict("Colombo");
    setCity("Colombo 03 (Colpetty)");
    setHouseAddress("No. 42/3, Alfred House Gardens");
    setLandmark("Near British Council");
    setTimer(180);
    setCanResend(false);
    closeLoginModal();
    if (postLoginRedirect) {
      const redirectTarget = postLoginRedirect;
      setPostLoginRedirect(null);
      if (isSafeRedirectUrl(redirectTarget)) {
        router.push(redirectTarget);
      }
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const formattedM = m < 10 ? `0${m}` : `${m}`;
    const formattedS = s < 10 ? `0${s}` : `${s}`;
    return `${formattedM}:${formattedS}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-fadeIn"
    >
      <div className="fixed inset-0" aria-hidden="true" />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[460px] max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden z-10 transform transition-all animate-scaleUp border border-slate-100">
        {step !== "mobile" && !isSuccess ? (
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 shrink-0 bg-white z-10">
            <button
              type="button"
              onClick={() => {
                if (step === "address") {
                  if (isExistingUser) {
                    setStep("otp");
                  } else {
                    setStep("details");
                  }
                } else if (step === "details") {
                  setStep("otp");
                } else {
                  setStep("mobile");
                }
              }}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>
                {step === "address"
                  ? isExistingUser
                    ? "Back to OTP"
                    : "Back"
                  : step === "details"
                    ? "Back to OTP"
                    : "Change Phone Number"}
              </span>
            </button>
            <button
              onClick={handleResetAndClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20 cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 sm:p-8 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
          {isSuccess ? (
            <div className="py-8 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {successMessage}
              </h3>
              <p className="text-sm text-slate-500">
                Welcome to SRIBEES Online.
              </p>
            </div>
          ) : step === "mobile" ? (
            <MobileInputForm
              mobileNumber={mobileNumber}
              setMobileNumber={setMobileNumber}
              isSubmitting={isSubmitting}
              onSendOtp={handleSendOtp}
              onGoogleCredential={handleGoogleCredential}
            />
          ) : step === "otp" ? (
            <OTPScreen
              mobileNumber={mobileNumber}
              otpCode={otpCode}
              handleOtpChange={handleOtpChange}
              handleOtpKeyDown={handleOtpKeyDown}
              isSubmitting={isSubmitting}
              onVerifyOtp={handleVerifyOtp}
              canResend={canResend}
              handleResendOtp={handleResendOtp}
              timer={timer}
              formatSeconds={formatSeconds}
              onEditMobile={() => setStep("mobile")}
            />
          ) : step === "details" ? (
            <CompleteAccountSetup
              mobileNumber={mobileNumber}
              fullName={fullName}
              setFullName={setFullName}
              nicNumber={nicNumber}
              setNicNumber={setNicNumber}
              email={email}
              setEmail={setEmail}
              referralCode={referralCode}
              setReferralCode={setReferralCode}
              missingFields={missingFields}
              errors={profileErrors}
              isSubmitting={isSubmitting}
              onCompleteSignUp={handleCompleteSignUp}
            />
          ) : (
            <DeliveryAddressSetup
              isExistingUser={isExistingUser}
              province={province}
              setProvince={setProvince}
              district={district}
              setDistrict={setDistrict}
              city={city}
              setCity={setCity}
              houseAddress={houseAddress}
              setHouseAddress={setHouseAddress}
              landmark={landmark}
              setLandmark={setLandmark}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
              isSubmitting={isSubmitting}
              onConfirmAddress={handleConfirmAddress}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
