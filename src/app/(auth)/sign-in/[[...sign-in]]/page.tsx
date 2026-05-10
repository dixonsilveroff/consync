import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="animate-fade-in">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-surface-container-high shadow-ambient",
            },
          }}
        />
      </div>
    </div>
  );
}
