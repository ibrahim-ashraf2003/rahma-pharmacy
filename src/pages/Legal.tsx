import React from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../components/SEO';

const termsContent = `
1. General Terms
By placing an order with Tammi Sports, you agree to our terms and conditions. We reserve the right to refuse service to anyone for any reason at any time.

2. Shipping & Delivery
Orders are processed within 1-2 business days. Delivery times vary based on governorate (typically 2-5 days). You will receive an SMS/Email once your order is dispatched.

3. Returns & Refunds
You may return unused items in their original condition and packaging within 14 days of delivery. The customer is responsible for return shipping costs unless the item is defective.

4. Payment
We accept Cash on Delivery (COD) and major credit/debit cards via Paymob. Online payments are secured and encrypted.
`;

const privacyContent = `
1. Information We Collect
We collect personal information such as your name, email, phone number, and address when you register or place an order. 

2. How We Use Your Information
Your information is used solely to process orders, deliver products, and provide customer support. We do not sell your personal information to third parties.

3. Security
We implement a variety of security measures to maintain the safety of your personal information. Payment processing is handled by secure third-party gateways (Paymob).

4. Cookies
We use cookies to remember your cart items and understand your preferences for future visits.
`;

export function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <SEO title="Terms of Service" />
      <h1 className="text-4xl font-black font-headline uppercase tracking-tighter mb-8">Terms of Service</h1>
      <div className="prose prose-sm md:prose-base max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
        {termsContent}
      </div>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <SEO title="Privacy Policy" />
      <h1 className="text-4xl font-black font-headline uppercase tracking-tighter mb-8">Privacy Policy</h1>
      <div className="prose prose-sm md:prose-base max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
        {privacyContent}
      </div>
    </div>
  );
}
