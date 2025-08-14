import "@/assets/styles/globals.css";

export const metadata = {
  title: "Client Onboarding",
  description:
    "This project is a client onboarding form built with Next.js (App Router), React Hook Form, and Zod for validation. Styling is done using Tailwind CSS.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
