"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { Webinar } from "@/lib/types/webinar";
import { WebinarPreview } from "@/app/(portal)/portal/admin/webinar-creator/components/WebinarPreview";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function PublicWebinarPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
  });

  useEffect(() => {
    fetchWebinar();
  }, [slug]);

  const fetchWebinar = async () => {
    try {
      if (!db) return;
      const webinarsRef = collection(db, COLLECTIONS.WEBINARS);
      const q = query(
        webinarsRef, 
        where("slug", "==", slug),
        where("status", "==", "published"),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setWebinar(null);
      } else {
        const doc = snapshot.docs[0];
        setWebinar({ id: doc.id, ...doc.data() } as Webinar);
      }
    } catch (error) {
      console.error("Error fetching webinar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webinar) return;

    if (webinar.registration.type === "external" && webinar.registration.externalUrl) {
      window.open(webinar.registration.externalUrl, "_blank");
      return;
    }

    setRegistering(true);
    try {
      // Here you would normally call your registration API/GHL
      // For now, we'll just simulate success and redirect to confirmation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Successfully registered!");
      router.push(`/webinars/${slug}/confirmation`);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Webinar Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The webinar you are looking for doesn't exist or is no longer available.
        </p>
        <Button onClick={() => router.push("/")}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <WebinarPreview data={webinar} />
      
      {/* Registration Overlay/Modal would normally be here, 
          but for simplicity in this implementation we'll add a 
          floating registration card or section */}
      
      <section id="register" className="py-20 bg-slate-100">
        <div className="container max-w-xl mx-auto px-4">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center bg-primary text-primary-foreground rounded-t-xl">
              <CardTitle className="text-2xl">Reserve Your Spot</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Fill out the form below to join the live session.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      required 
                      value={form.firstName}
                      onChange={e => setForm({...form, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      required 
                      value={form.lastName}
                      onChange={e => setForm({...form, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    required 
                    value={form.company}
                    onChange={e => setForm({...form, company: e.target.value})}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-bold mt-4"
                  disabled={registering}
                >
                  {registering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    webinar.registration.buttonText || "Register Now"
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-4">
                  By registering, you agree to our Terms of Service and Privacy Policy. 
                  You will receive webinar updates and occasional marketing communications.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
