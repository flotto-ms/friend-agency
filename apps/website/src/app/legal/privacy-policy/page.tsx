import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Google required policy to state we don't use privatte data",
};

const PrivacyPolicy: React.FC = () => {
  return (
    <div className=" mx-auto max-w-[800px] p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Privacy Policy for Flotto
      </h1>
      <p className="text-center mb-6">
        <strong>Effective Date:</strong> 1 March 2026
      </p>

      <p className="text-lg mb-6">
        At <strong>Flotto</strong>, we value your privacy and are committed to
        protecting your personal data. This Privacy Policy explains how we
        collect, use, and protect the information that we may collect from you
        while you use our Chrome extension. We do not collect personally
        identifiable information (PII) from users.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        1. Information We Do Not Collect
      </h2>
      <p className="text-lg mb-6">
        We do not collect, store, or share any personally identifiable
        information (PII), such as your name, email address, phone number, or
        payment information, through the use of this extension.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">2. Data Usage</h2>
      <p className="text-lg mb-4">
        The extension may use some data for technical and functionality
        purposes, but this data is completely anonymous and non-personal. This
        includes:
      </p>
      <ul className="list-disc pl-8 text-lg mb-6">
        <li>
          <strong>Extension Usage Data:</strong> We may collect non-personal
          data related to how the extension is used, such as usage statistics or
          crash reports, to improve the functionality and performance of the
          extension.
        </li>
        <li>
          <strong>Cookies and Local Storage:</strong> The extension may use
          cookies or local storage on your browser for technical reasons (such
          as saving preferences for the extension's features), but these do not
          store any personal information.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        3. Third-Party Services
      </h2>
      <p className="text-lg mb-6">
        Our extension may contain links to third-party services or content (such
        as ads or analytics tools). These third parties may collect data in
        accordance with their own privacy policies. We encourage you to review
        the privacy policies of these third-party services to understand their
        data collection practices.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        4. No Sharing of Personal Data
      </h2>
      <p className="text-lg mb-6">
        As we do not collect personally identifiable information, we do not
        share, sell, or distribute any personal data to third parties.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">5. Security</h2>
      <p className="text-lg mb-6">
        We take reasonable precautions to protect any data that may be collected
        from unauthorized access or disclosure. However, no method of data
        transmission or storage can be guaranteed to be 100% secure, so we
        cannot ensure absolute security.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        6. Children's Privacy
      </h2>
      <p className="text-lg mb-6">
        Our extension is not intended for children under the age of 13, and we
        do not knowingly collect any personal data from children. If you are a
        parent or guardian and you believe we have collected personal
        information from a child, please contact us immediately, and we will
        take steps to delete such information.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        7. Changes to This Privacy Policy
      </h2>
      <p className="text-lg mb-6">
        We reserve the right to update or modify this Privacy Policy at any
        time. Any changes will be posted in this section, and the "Effective
        Date" at the top of this page will be updated accordingly. We encourage
        you to review this Privacy Policy periodically for any updates.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Us</h2>
      <p className="text-lg mb-4">
        If you have any questions or concerns about this Privacy Policy or how
        we handle your information, please{" "}
        <Link href="/discord" className="underline">
          contact us
        </Link>{" "}
        via discord.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
