import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="animate-fade-in">
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#1E4E8C",
              colorText: "#1A1C1E",
              colorBackground: "#FFFFFF",
              colorInputBackground: "#F8FAFC",
              colorInputText: "#1A1C1E",
              colorDanger: "#E63946",
              borderRadius: "12px",
              fontFamily: "var(--font-inter)",
            },
            elements: {
              rootBox: "mx-auto",
              card: "bg-surface border border-border shadow-md rounded-xl px-6 py-6",
              headerTitle: "font-heading text-h3 text-text-primary",
              headerSubtitle: "text-body text-text-secondary",
              socialButtonsBlockButton:
                "border border-border bg-background text-text-primary hover:bg-primary-faint",
              formFieldLabel: "text-small font-medium text-text-primary",
              formFieldInput:
                "h-11 rounded-md border border-border bg-background text-text-primary focus:ring-2 focus:ring-primary/20",
              formButtonPrimary:
                "btn-primary h-11 w-full rounded-md text-body font-medium",
              footerActionLink: "text-primary hover:text-primary-dark",
              dividerLine: "bg-border",
              dividerText: "text-text-muted",
            },
          }}
        />
      </div>
    </div>
  );
}
