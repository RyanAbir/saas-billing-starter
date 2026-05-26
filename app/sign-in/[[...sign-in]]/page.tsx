import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-6 py-16 sm:py-20">
      <SignIn />
    </div>
  );
}
