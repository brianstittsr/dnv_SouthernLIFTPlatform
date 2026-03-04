import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, CheckCircle, Star, Quote } from "lucide-react";
import { services, getServiceById, getServiceIds } from "@/lib/services-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const service = getServiceById(id);

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  return {
    title: `${service.title} - KDM & Associates Services`,
    description: service.description,
  };
}

export async function generateStaticParams() {
  return getServiceIds().map((id) => ({
    id,
  }));
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const service = getServiceById(id);

  if (!service) {
    notFound();
  }

  const ServiceIcon = service.icon;

  return (
    <>
      {/* Hero Section */}
      <section className={`py-20 md:py-28 ${service.bgColor}`}>
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link 
              href="/services" 
              className="inline-flex items-center text-sm font-medium mb-8 hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Services
            </Link>

            <div className="flex items-start gap-6">
              <div className={`w-20 h-20 rounded-xl ${service.bgColor} border-2 border-current/20 flex items-center justify-center shrink-0`}>
                <ServiceIcon className={`h-10 w-10 ${service.color}`} />
              </div>
              <div>
                <Badge variant="outline" className={`mb-4 ${service.color} border-current`}>
                  KDM Service
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  {service.title}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                  {service.fullDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Offerings */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">
              What We Offer
            </h2>
            
            <div className="space-y-8">
              {service.offerings.map((offering, index) => (
                <Card key={offering.name} className="overflow-hidden">
                  <div className={`h-1 ${service.bgColor}`} />
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full ${service.bgColor} flex items-center justify-center`}>
                        <span className={`font-bold ${service.color}`}>{index + 1}</span>
                      </div>
                      <div>
                        <CardTitle className="text-xl">{offering.name}</CardTitle>
                        <CardDescription className="text-base mt-1">
                          {offering.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {offering.details && (
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {offering.details.map((detail) => (
                          <div key={detail} className="flex items-start gap-2">
                            <CheckCircle className={`h-5 w-5 mt-0.5 shrink-0 ${service.color}`} />
                            <span className="text-sm">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-6">
                  Why Choose KDM for {service.title}?
                </h2>
                <ul className="space-y-4">
                  {service.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <Star className={`h-5 w-5 mt-0.5 shrink-0 ${service.color}`} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {service.caseStudyHighlight && (
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-8">
                    <Quote className={`h-10 w-10 ${service.color} mb-4`} />
                    <p className="text-lg font-medium mb-4">
                      Success Highlight
                    </p>
                    <p className="text-muted-foreground">
                      {service.caseStudyHighlight}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">
              Explore Other Services
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services
                .filter((s) => s.id !== service.id)
                .slice(0, 3)
                .map((otherService) => {
                  const OtherIcon = otherService.icon;
                  return (
                    <Link key={otherService.id} href={`/services/${otherService.id}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className={`w-12 h-12 rounded-lg ${otherService.bgColor} flex items-center justify-center mb-3`}>
                            <OtherIcon className={`h-6 w-6 ${otherService.color}`} />
                          </div>
                          <CardTitle className="text-lg">{otherService.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {otherService.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  );
                })}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href="/services">
                  View All Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Get Started with {service.title}?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Schedule an introductory session to discuss how our {service.title.toLowerCase()} services 
            can help your business succeed in government contracting.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/contact">
                Schedule Introductory Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8"
              asChild
            >
              <Link href="/sign-up?type=consortium">
                Become a KDM Consortium Member
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
