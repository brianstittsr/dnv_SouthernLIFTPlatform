import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle } from "lucide-react";
import { services } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "Services",
  description:
    "KDM & Associates offers comprehensive services including digital solutions, technology integration, grants & RFPs, marketing, operations, and contracting vehicles for emerging small businesses.",
};

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Our Services
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Driving Next Level{" "}
              <span className="text-primary">Results</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              With Accredited Subject Matter Experts, we offer a comprehensive range of services 
              to help emerging small businesses build, grow, and scale their government contracting business.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const ServiceIcon = service.icon;
              return (
                <Link key={service.id} href={`/services/${service.id}`} className="block">
                  <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow h-full cursor-pointer">
                    <div className={`absolute top-0 left-0 w-full h-1 ${service.bgColor}`} />
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-lg ${service.bgColor} flex items-center justify-center mb-4`}>
                        <ServiceIcon className={`h-7 w-7 ${service.color}`} />
                      </div>
                      <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {service.offerings.slice(0, 3).map((offering) => (
                          <li key={offering.name} className="flex items-start gap-3">
                            <CheckCircle className={`h-5 w-5 mt-0.5 shrink-0 ${service.color}`} />
                            <div>
                              <p className="font-medium">{offering.name}</p>
                              <p className="text-sm text-muted-foreground">{offering.description}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-4 flex items-center text-primary font-medium">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Schedule an introductory session to discuss how our services can help 
            your business win government contracts.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 text-lg px-8 bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/contact">
              Schedule Introductory Session
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
