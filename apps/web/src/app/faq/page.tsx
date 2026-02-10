"use client";

import { useState } from "react";
import { Navbar } from "../../../components/navbar";
import { Footer } from "../../../components/footer";
import { Card } from "@gearboxe-market/ui/card";
import { Button } from "@gearboxe-market/ui/button";
import {
  HelpCircle,
  Car,
  ShoppingCart,
  Calendar,
  Shield,
  ChevronDown,
  ChevronUp,
  Mail,
} from "lucide-react";
import Link from "next/link";

const faqCategories = [
  {
    title: "Getting Started",
    icon: HelpCircle,
    faqs: [
      {
        question: "How do I create an account on Gearboxe Market?",
        answer:
          "Creating an account is quick and free. Click the Sign Up button in the top navigation bar and follow the prompts to enter your name, email address, and create a password. Once registered, you can browse listings, save favorites, message sellers, and list your own vehicles for sale.",
      },
      {
        question: "How does Gearboxe Market work?",
        answer:
          "Gearboxe Market is a platform that connects car buyers and sellers through both online listings and in-person events. Sellers list their vehicles with photos and details, and buyers can browse, save favorites, and contact sellers directly through our messaging system. We also host local events where buyers and sellers can meet and inspect vehicles in person.",
      },
      {
        question: "Is it free to browse vehicles on the platform?",
        answer:
          "Yes, browsing vehicle listings is completely free and does not require an account. However, creating a free account allows you to save favorites, contact sellers, receive notifications about new listings, and register for events.",
      },
      {
        question: "How do I search for a specific vehicle?",
        answer:
          "Use the search and filter tools on our Vehicles page to narrow down listings by make, model, year, price range, mileage, and more. You can also sort results by newest listings, price, or mileage to find exactly what you are looking for.",
      },
      {
        question: "Can I use Gearboxe Market on my phone?",
        answer:
          "Absolutely. Gearboxe Market is fully responsive and works great on smartphones, tablets, and desktop computers. You can browse listings, message sellers, and manage your account from any device with a web browser.",
      },
    ],
  },
  {
    title: "Selling a Vehicle",
    icon: Car,
    faqs: [
      {
        question: "How do I list my vehicle for sale?",
        answer:
          "After signing in, navigate to your account and select the option to create a new listing. You will be guided through providing vehicle details including make, model, year, mileage, condition, price, and photos. Upload clear, high-quality photos from multiple angles to attract more buyers. Once submitted, your listing will be reviewed by our team before going live.",
      },
      {
        question: "Are there any fees for listing a vehicle?",
        answer:
          "Creating a basic listing on Gearboxe Market is free. We want to make it as easy as possible for sellers to reach potential buyers. There are no hidden fees or commissions taken from your sale.",
      },
      {
        question: "How long does the listing approval process take?",
        answer:
          "Our team typically reviews new listings within 24 to 48 hours. We check that listings include accurate information, appropriate photos, and comply with our community guidelines. You will receive a notification once your listing has been approved or if any changes are needed.",
      },
      {
        question: "Can I edit my listing after it has been published?",
        answer:
          "Yes, you can update your listing at any time from your account dashboard. You can change the price, update the description, add or remove photos, and adjust other details. Significant changes may require a brief re-review by our team.",
      },
      {
        question: "What types of vehicles can I list on the platform?",
        answer:
          "Gearboxe Market accepts listings for cars, trucks, SUVs, and other passenger vehicles. All vehicles must have a valid title and be accurately represented in the listing. We do not currently accept listings for motorcycles, boats, RVs, or commercial fleet vehicles.",
      },
    ],
  },
  {
    title: "Buying a Vehicle",
    icon: ShoppingCart,
    faqs: [
      {
        question: "How do I contact a seller about a vehicle?",
        answer:
          "Each listing has a messaging option that lets you send the seller a direct message through the platform. Simply click the contact button on any listing to start a conversation. We recommend asking about the vehicle's history, maintenance records, and availability for an in-person inspection.",
      },
      {
        question: "Can I see a vehicle in person before buying?",
        answer:
          "We strongly encourage in-person inspections before making a purchase. You can arrange a meeting with the seller through our messaging system or attend one of our events where multiple vehicles are available to view. Always meet in a safe, public location.",
      },
      {
        question: "How does the payment process work?",
        answer:
          "Gearboxe Market facilitates the connection between buyers and sellers, but the final transaction and payment are handled directly between both parties. We recommend using secure payment methods and completing all paperwork, including title transfer, at the time of sale.",
      },
      {
        question: "Does Gearboxe Market verify vehicle history?",
        answer:
          "While we review all listings for accuracy and completeness, we recommend that buyers independently verify vehicle history through services like Carfax or AutoCheck. Always ask the seller for maintenance records and consider having a trusted mechanic inspect the vehicle before purchasing.",
      },
      {
        question: "What should I do if I have an issue with a purchase?",
        answer:
          "If you experience any problems with a transaction, contact our support team right away through the Contact page. While sales are conducted directly between buyers and sellers, we take fraud and misrepresentation seriously and will investigate any reported issues.",
      },
    ],
  },
  {
    title: "Events",
    icon: Calendar,
    faqs: [
      {
        question: "What are Gearboxe Market events?",
        answer:
          "Our events are organized gatherings where buyers and sellers can meet in person, browse vehicles, and connect with the local car community. Events may include car shows, meet-and-greets, and marketplace days where listed vehicles are on display for prospective buyers to inspect firsthand.",
      },
      {
        question: "How do I register for an event?",
        answer:
          "Browse upcoming events on our Events page and click Register on any event that interests you. Some events are free while others may have a registration fee. You will receive a confirmation email with all the details including date, time, location, and what to expect.",
      },
      {
        question: "What should I bring to an event?",
        answer:
          "If you are a buyer, bring a valid photo ID and any questions you have about vehicles you are interested in. If you are a seller displaying a vehicle, bring the vehicle title, maintenance records, and any documentation that supports your listing. All attendees should bring a positive attitude and respect for the community.",
      },
      {
        question: "How often are events held and where?",
        answer:
          "Event frequency and locations vary by region. We are continually expanding to new cities and increasing event frequency based on community demand. Check the Events page regularly for upcoming events in your area, or enable notifications to be alerted when new events are announced near you.",
      },
      {
        question: "Can I sell my vehicle at an event without an online listing?",
        answer:
          "All vehicles displayed at Gearboxe Market events must have an active, approved listing on the platform. This ensures buyers have access to vehicle details and photos ahead of time and helps us maintain a safe, transparent marketplace for everyone.",
      },
    ],
  },
  {
    title: "Account & Safety",
    icon: Shield,
    faqs: [
      {
        question: "How does the messaging system work?",
        answer:
          "Our built-in messaging system allows buyers and sellers to communicate directly within the platform. Messages are tied to specific vehicle listings for easy reference. You will receive notifications when you get new messages. We recommend keeping all communication on the platform for your safety and records.",
      },
      {
        question: "How do I manage my account settings?",
        answer:
          "Access your account settings by clicking on your profile icon and navigating to My Account. From there you can update your personal information, manage your listings, view your saved favorites, check your event registrations, and adjust your notification preferences.",
      },
      {
        question: "How do I report a suspicious listing or user?",
        answer:
          "If you encounter a listing that appears fraudulent or a user who is behaving inappropriately, please report it immediately through our Contact page. Provide as much detail as possible including the listing or username in question. Our team investigates all reports and takes action to keep the community safe.",
      },
      {
        question: "How does Gearboxe Market protect my personal data?",
        answer:
          "We take data privacy seriously. Your personal information is encrypted and stored securely. We never share your contact details with other users without your consent. Our messaging system allows you to communicate with buyers and sellers without revealing your email address or phone number until you choose to.",
      },
      {
        question: "Can I delete my account?",
        answer:
          "Yes, you can request account deletion at any time by contacting our support team through the Contact page. Upon deletion, your listings will be removed, your messages will be cleared, and your personal data will be permanently erased in accordance with our privacy policy.",
      },
    ],
  },
];

export default function FAQPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const toggleFAQ = (key: string) => {
    setExpandedFAQ(expandedFAQ === key ? null : key);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <div className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="mb-6 font-bold text-4xl text-gray-900 md:text-5xl">
                Frequently Asked Questions
              </h1>
              <p className="mx-auto max-w-2xl text-gray-600 text-xl">
                Find answers to common questions about buying, selling, and
                using Gearboxe Market.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {faqCategories.map((category, catIndex) => {
              const Icon = category.icon;
              return (
                <div key={catIndex} className="mb-12 last:mb-0">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="font-bold text-2xl text-gray-900">
                      {category.title}
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {category.faqs.map((faq, index) => {
                      const key = `${catIndex}-${index}`;
                      return (
                        <Card
                          className="border-gray-200 bg-white"
                          key={key}
                        >
                          <button
                            className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50"
                            onClick={() => toggleFAQ(key)}
                          >
                            <h3 className="pr-4 font-semibold text-gray-900 text-lg">
                              {faq.question}
                            </h3>
                            {expandedFAQ === key ? (
                              <ChevronUp className="h-5 w-5 flex-shrink-0 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-500" />
                            )}
                          </button>
                          {expandedFAQ === key && (
                            <div className="px-6 pb-6">
                              <p className="text-gray-600 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <Mail className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="mb-4 font-bold text-2xl text-gray-900">
              Still have questions?
            </h2>
            <p className="mb-8 text-gray-600 text-lg">
              Our support team is here to help. Reach out and we will get back
              to you as soon as possible.
            </p>
            <Link href="/contact">
              <Button size="lg">Contact Support</Button>
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
