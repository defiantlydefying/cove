import { signIn } from "next-auth/react";

type NativeGoogleConfig = {
  clientId: string;
};

export function isNativeGoogleCancel(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "SIGN_IN_CANCELED"
  );
}

export async function signInWithNativeGoogle(
  callbackUrl: string
): Promise<void> {
  const configResponse = await fetch("/api/auth/native-google/config");

  if (!configResponse.ok) {
    throw new Error("Native Google sign-in is not configured");
  }

  const { clientId } = (await configResponse.json()) as NativeGoogleConfig;
  const { GoogleSignIn } = await import(
    "@capawesome/capacitor-google-sign-in"
  );

  await GoogleSignIn.initialize({ clientId });
  const googleResult = await GoogleSignIn.signIn();

  const sessionResult = await signIn("native-google", {
    idToken: googleResult.idToken,
    callbackUrl,
    redirect: false,
  });

  if (!sessionResult?.ok || sessionResult.error) {
    throw new Error(sessionResult?.error ?? "Native Google sign-in failed");
  }

  window.location.assign(sessionResult.url ?? callbackUrl);
}
