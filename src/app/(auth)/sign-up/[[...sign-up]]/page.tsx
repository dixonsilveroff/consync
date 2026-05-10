import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="animate-fade-in">
        <SignUp
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
