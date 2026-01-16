import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Link2, Wand2, Download, Check, Star, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const steps = [
  {
    icon: Link2,
    title: "Paste URL or Upload Photos",
    description: "Simply paste your realestate.com.au or domain.com.au listing URL, or upload photos directly.",
  },
  {
    icon: Wand2,
    title: "Customize Your Video",
    description: "Choose from 5 professional templates, add your branding, and select background music.",
  },
  {
    icon: Download,
    title: "Download & Share",
    description: "Get your HD video in 60 seconds. Share directly to social media or download for later.",
  },
];

const features = [
  {
    title: "Paste Listing URL",
    description: "Works with realestate.com.au & domain.com.au",
  },
  {
    title: "Professional Templates",
    description: "5 stunning video styles to choose from",
  },
  {
    title: "60 Second Generation",
    description: "Your video ready in under a minute",
  },
  {
    title: "Agent Branding",
    description: "Add your photo, logo and contact details",
  },
  {
    title: "HD Quality",
    description: "1080p professional videos every time",
  },
  {
    title: "Mobile Friendly",
    description: "Create videos on any device",
  },
];

const testimonials = [
  {
    quote: "This saves me 2 hours per listing!",
    name: "Sarah M.",
    role: "Melbourne Agent",
    rating: 5,
  },
  {
    quote: "My listings get 3x more engagement now.",
    name: "James T.",
    role: "Sydney Agent",
    rating: 5,
  },
  {
    quote: "Game changer for my business.",
    name: "Emma L.",
    role: "Brisbane Agent",
    rating: 5,
  },
];

const faqs = [
  {
    question: "How long does it take to generate a video?",
    answer: "Most videos are ready in 60-90 seconds. Our AI processes your listing photos and property details to create a professional walkthrough video almost instantly.",
  },
  {
    question: "Can I use this on mobile?",
    answer: "Yes! Our app works on any device - desktop, tablet, or mobile. Create professional listing videos wherever you are.",
  },
  {
    question: "What listing sites are supported?",
    answer: "We support realestate.com.au and domain.com.au. Simply paste your listing URL and we'll automatically extract all photos and property details.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, cancel your subscription anytime with no questions asked. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "Do I need video editing skills?",
    answer: "No! Just paste your listing URL and we handle everything. Choose a template, add your branding, and your professional video is ready in seconds.",
  },
];

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

function PricingCard({ name, price, period, description, features, cta, highlighted, badge }: PricingCardProps) {
  return (
    <div
      className={`relative rounded-2xl p-8 transition-all duration-300 hover-lift ${
        highlighted
          ? "bg-primary text-primary-foreground shadow-xl scale-105"
          : "bg-card shadow-card border border-border"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-success-foreground text-xs font-semibold px-3 py-1 rounded-full">
          {badge}
        </span>
      )}
      <h3 className={`text-xl font-bold ${highlighted ? "" : "text-foreground"}`}>{name}</h3>
      <p className={`mt-2 text-sm ${highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {description}
      </p>
      <div className="mt-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className={`text-sm ${highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
          /{period}
        </span>
      </div>
      <ul className="mt-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-sm">
            <Check className={`w-5 h-5 flex-shrink-0 ${highlighted ? "text-success" : "text-success"}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        asChild
        variant={highlighted ? "secondary" : "hero"}
        size="lg"
        className={`w-full mt-8 ${highlighted ? "text-primary" : ""}`}
      >
        <Link to="/signup">{cta}</Link>
      </Button>
    </div>
  );
}

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground max-w-4xl mx-auto leading-tight animate-slide-up">
            Turn Any Australian Property Listing Into a Professional Video in{" "}
            <span className="text-gradient">60 Seconds</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Just paste your realestate.com.au or domain.com.au URL. No editing skills required.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button asChild variant="hero" size="xl">
              <Link to="/signup">Start Free Trial</Link>
            </Button>
            <Button asChild variant="hero-outline" size="xl">
              <Link to="#demo">
                <Play className="w-5 h-5" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-16 relative max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="aspect-video bg-secondary rounded-2xl shadow-2xl overflow-hidden border border-border">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Video Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three-Step Process */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative bg-card rounded-2xl p-8 shadow-card hover-lift text-center"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center mx-auto mt-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include a 7-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className="text-foreground font-medium">Monthly</span>
            <button className="relative w-14 h-7 bg-primary rounded-full transition-colors">
              <span className="absolute left-1 top-1 w-5 h-5 bg-primary-foreground rounded-full transition-transform" />
            </button>
            <span className="text-muted-foreground">
              Annual <span className="text-success font-semibold">Save 20%</span>
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
            <PricingCard
              name="Starter"
              price="$49"
              period="month"
              description="Perfect for solo agents"
              features={["10 videos per month", "HD videos", "All templates", "Agent branding", "Email support"]}
              cta="Start Free Trial"
            />
            <PricingCard
              name="Professional"
              price="$99"
              period="month"
              description="For busy agents"
              features={["30 videos per month", "Everything in Starter", "Priority support", "Analytics dashboard", "Custom music"]}
              cta="Start Free Trial"
              highlighted
              badge="Most Popular"
            />
            <PricingCard
              name="Agency"
              price="$199"
              period="month"
              description="For agencies & teams"
              features={["Unlimited videos", "Everything in Pro", "White label option", "Multi-user access", "API access"]}
              cta="Contact Sales"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-secondary">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">
            Everything You Need
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-card hover-lift border border-border"
              >
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <p className="text-center text-muted-foreground mb-8">
            Trusted by <span className="font-semibold text-foreground">500+</span> Australian Real Estate Agents
          </p>

          {/* Logo Cloud */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-16 opacity-50">
            {["Century 21", "Ray White", "LJ Hooker", "McGrath", "Harcourts"].map((brand) => (
              <div key={brand} className="text-lg font-bold text-muted-foreground">
                {brand}
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-8 shadow-card hover-lift border border-border"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground text-lg font-medium mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-lg font-bold text-muted-foreground">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card rounded-xl px-6 border border-border"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-primary rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Transform Your Listings?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join 500+ Australian agents creating professional property videos in seconds.
            </p>
            <Button asChild variant="secondary" size="xl" className="text-primary">
              <Link to="/signup">
                Start Your Free Trial
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
