# Client Onboarding Form

This project is a client onboarding form built with Next.js (App Router), React Hook Form, and Zod for validation.

---

### Setup and Installation

1.  **Clone the project:** Go to the project's GitHub page, click the green **"Code"** button, and copy the HTTPS URL. Then, in your terminal, run:
    ```bash
    git clone [your-repository-url-here]
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd [your-project-name]
    ```
3.  **Install dependencies:**
    ```bash
    npm install react-hook-form zod @hookform/resolvers
    ```
4.  **Configure environment variable:** Create a file named `.env.local` in the root of the project and add the API endpoint:
    ```
    NEXT_PUBLIC_ONBOARD_URL=[https://example.com/api/onboard](https://example.com/api/onboard)
    ```
    Remember to restart your server (`npm run dev`) after creating this file.
5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be running at `http://localhost:3000`.

---

### Key Concepts

* **How RHF + Zod are wired:** The validation rules for all form fields are defined in a single **Zod schema**. The `@hookform/resolvers` library connects this schema to the `useForm` hook from **React Hook Form**. This lets React Hook Form handle all the validation for you automatically, showing inline error messages when a field doesn't match the rules.
* **Environment Variable:** The URL for the API endpoint is stored in an environment variable named `NEXT_PUBLIC_ONBOARD_URL`. This is a best practice that keeps the endpoint URL separate from your code, making it easy to swap for different environments (e.g., development vs. production).
