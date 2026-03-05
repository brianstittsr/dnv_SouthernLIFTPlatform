"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { Webinar } from "@/lib/types/webinar";
import { Loader2, CheckCircle2, Calendar, Clock, Video, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";

export default function WebinarConfirmationPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);

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
      console.error("Error fetching webinar for confirmation:", error);
    } finally {
      setLoading(false);
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
          We couldn't find the webinar registration you're looking for.
        </p>
        <Button onClick={() => router.push("/")}>Return to Home</Button>
      </div>
    );
  }

  const startTime = webinar.startTime ? new Date(webinar.startTime) : null;

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">
            {webinar.confirmation?.title || "Registration Confirmed!"}
          </h1>
          <p className="text-xl text-slate-600 max-w-xl mx-auto">
            {webinar.confirmation?.message || "Thank you for registering. You're all set to join us for this exclusive session."}
          </p>
        </div>

        <Card className="shadow-xl border-0 overflow-hidden mb-8">
          <div className="bg-primary h-2 w-full" />
          <CardHeader className="bg-white border-b">
            <CardTitle>Webinar Details</CardTitle>
            <CardDescription>Everything you need to know for the event.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg mt-1">
                    <Video className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Event</p>
                    <p className="text-lg font-bold text-slate-900">{webinar.title}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-purple-50 p-2 rounded-lg mt-1">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Date</p>
                    <p className="text-lg font-bold text-slate-900">
                      {startTime ? format(startTime, "EEEE, MMMM do, yyyy") : "Date TBD"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-amber-50 p-2 rounded-lg mt-1">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Time</p>
                    <p className="text-lg font-bold text-slate-900">
                      {startTime ? format(startTime, "p") : "Time TBD"} ({webinar.timezone})
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  {webinar.confirmation?.nextStepsTitle || "Next Steps"}
                </h3>
                <ul className="space-y-3">
                  {webinar.confirmation?.nextSteps?.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <div className="min-w-[18px] h-[18px] bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">
                        {idx + 1}
                      </div>
                      {step}
                    </li>
                  ))}
                  {(!webinar.confirmation?.nextSteps || webinar.confirmation.nextSteps.length === 0) && (
                    <>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <div className="min-w-[18px] h-[18px] bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">1</div>
                        Check your email for the joining link
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <div className="min-w-[18px] h-[18px] bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">2</div>
                        Add the event to your calendar
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {webinar.confirmation?.videoUrl && (
              <div className="pt-8 border-t">
                <p className="text-center text-sm font-medium text-slate-500 mb-4">A Special Message for You</p>
                <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg">
                  <iframe 
                    src={webinar.confirmation.videoUrl.replace("watch?v=", "embed/")} 
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/portal/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
