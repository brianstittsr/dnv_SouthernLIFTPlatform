"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronRight,
  Plus,
  Search,
  Mail,
  Phone,
  Pencil,
  Trash2,
  Users,
  RefreshCw,
  Upload,
  UserCheck,
  UserX,
  LayoutGrid,
  List,
  Globe,
  ExternalLink,
  Calendar,
  X,
  CalendarPlus,
  Clock,
  ImageIcon,
  CheckCircle2,
  Link as LinkIcon,
} from "lucide-react";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { listImages, getImage, base64ToDataUrl, type ImageMetadata } from "@/lib/firebase-images";
import { COLLECTIONS, type TeamMeemerging businessrDoc, type OneToOneQueueItemDoc } from "@/lib/schema";
import { logTeamMeemerging businessrAdded, logActivity } from "@/lib/activity-logger";
import { KdmTeamSync } from "@/components/admin/kdm-team-sync";
import Link from "next/link";

// Seed data for Team Meemerging businessrs
const seedTeamMeemerging businessrs: Omit<TeamMeemerging businessrDoc, "id" | "createdAt" | "updatedAt">[] = [
  { firstName: "Al", lastName: "Lenac", emailPrimary: "al@manufacftureresults.com", emailSecondary: "albertlenac@gmail.com", mobile: "(973) 723-7448", expertise: "R&D Tax Credits", role: "affiliate", status: "active" },
  { firstName: "Alex", lastName: "West", emailPrimary: "alex@itscnow.com", mobile: "(518) 801-7315", expertise: "Cybersecurity Consulting", role: "affiliate", status: "active" },
  { firstName: "Alysha", lastName: "Campbell", emailPrimary: "alysha@cultureshifthr.com", expertise: "Human Resources", role: "affiliate", status: "active" },
  { firstName: "Brett", lastName: "Heyns", emailPrimary: "brett@getcompoundeffect.com", expertise: "Advanced Marketing/Bus Dev", role: "affiliate", status: "active" },
  { firstName: "Brian", lastName: "Stitt", emailPrimary: "bstitt@strategicvalueplus.com", emailSecondary: "brianstittsr@gmail.com", mobile: "(919) 608-3415", expertise: "Advanced Technology/Robotics", role: "sme_user", status: "active" },
  { firstName: "Brian", lastName: "McCollough", emailPrimary: "bmccollough@nextstagefl.net", mobile: "(801) 719-0076", expertise: "Operations", role: "affiliate", status: "active" },
  { firstName: "Cass", lastName: "Gibson", emailPrimary: "cassgibson@coststudy.us", emailSecondary: "cass@tapeismoney.com", mobile: "(717) 858-3150", expertise: "Cost Segregation", role: "affiliate", status: "active" },
  { firstName: "Christine", lastName: "Nolan", emailPrimary: "christine.nolan@pines-optimization.com", emailSecondary: "canolan912@gmail.com", mobile: "(215) 808-0035", expertise: "Inventory/Supply Chain", role: "affiliate", status: "active" },
  { firstName: "Daniel", lastName: "Sternklar", emailPrimary: "linkedin@view3d.tv", mobile: "(301) 576-6176", expertise: "Learning Platforms/Metaverses", role: "affiliate", status: "active" },
  { firstName: "Dave", lastName: "McFarland", emailPrimary: "dmcfarland@strategicvalueplus.com", emailSecondary: "dave@focusopex.com", mobile: "(217) 377-2234", expertise: "Operations/Finance", role: "team", status: "active" },
  { firstName: "Dave", lastName: "Myers", emailPrimary: "dave@dmdigi.io", expertise: "Marketing/Branding", role: "affiliate", status: "active" },
  { firstName: "David", lastName: "McFeeters-Krone", emailPrimary: "dmk@intelassets.com", expertise: "Intellectual Property", role: "affiliate", status: "active" },
  { firstName: "David", lastName: "Ziton", emailPrimary: "dziton@victory-as.com", expertise: "IT/CPA", role: "affiliate", status: "active" },
  { firstName: "Ed", lastName: "Porter", emailPrimary: "edport21@gmail.com", expertise: "Chief Revenue Officer", role: "affiliate", status: "active" },
  { firstName: "Elizabeth", lastName: "Wu", emailPrimary: "elizabeth@edd-i.com", mobile: "(404) 706-4854", expertise: "Cybergovernance for Executives", role: "affiliate", status: "active" },
  { firstName: "Gina", lastName: "Tabasso", emailPrimary: "gina@barracudab2b.com", emailSecondary: "gina.tabasso@gmail.com", mobile: "(330) 421-9185", expertise: "Project Management/Ops/Six Sigma", role: "affiliate", status: "active" },
  { firstName: "Icy", lastName: "Williams", emailPrimary: "info@legacy83business.com", mobile: "(513) 335-1978", expertise: "Executive Consulting", role: "affiliate", status: "active" },
  { firstName: "Jeremy", lastName: "Schumacher", emailPrimary: "jeremyrks@gmail.com", expertise: "CIO/Privacy", role: "affiliate", status: "active" },
  { firstName: "John", lastName: "Kloian", emailPrimary: "john@specdyn.com", emailSecondary: "john.kloian@gmail.com", expertise: "Chief Revenue Officer/Gap Assessments", role: "affiliate", status: "active" },
  { firstName: "Jose Luis", lastName: "Ferandez", emailPrimary: "joseluisfernandez88@gmail.com", emailSecondary: "josefernandez@salesfyconsulting.com", expertise: "Executive AI Training/Coaching", role: "affiliate", status: "active" },
  { firstName: "Justice", lastName: "Darko", emailPrimary: "jdarko@strategicvalueplus.com", expertise: "Project Management/Ops/Six Sigma", role: "team", status: "active" },
  { firstName: "Karena", lastName: "Bell", emailPrimary: "karena@profitlinz.com", mobile: "843-804-7151", expertise: "Financial Trouble-Shooter/Strategist/Problem Solver", role: "affiliate", status: "active" },
  { firstName: "Kham", lastName: "Inthirath", emailPrimary: "kham@getcompoundeffect.com", mobile: "(617) 275-8908", expertise: "Marketing/Change Management/AI", role: "affiliate", status: "active" },
  { firstName: "L. Joe", lastName: "Minor", emailPrimary: "joeandlorie84@live.com", expertise: "Shop Operations", role: "affiliate", status: "active" },
  { firstName: "Leonard", lastName: "Fom", emailPrimary: "leonard@finops-squad.com", emailSecondary: "leonard_fom@hotmail.com", mobile: "7789223555", expertise: "CFO/Financial Strategies/Access to Capital", role: "affiliate", status: "active" },
  { firstName: "Maria", lastName: "Perez", emailPrimary: "maria@causemarketingconsultant.com", mobile: "(702) 245-7220", expertise: "Cause Marketing", role: "affiliate", status: "active" },
  { firstName: "Mark", lastName: "Osborne", emailPrimary: "mark@ModernRevenueStrategies.com", mobile: "(404) 808-7625", expertise: "Advanced Marketing/Bus Dev", role: "affiliate", status: "active" },
  { firstName: "Marney", lastName: "Lumpkin", emailPrimary: "marney@vasml.com", expertise: "Back Office Support", role: "affiliate", status: "active" },
  { firstName: "Mike", lastName: "Liu", emailPrimary: "mike@freefuse.com", mobile: "(818)-324-0538", expertise: "Multimedia User-Defined Learning Platforms", role: "affiliate", status: "active" },
  { firstName: "Nate", lastName: "Hallums", emailPrimary: "nhallums@strategicvalueplus.com", emailSecondary: "nate@backyardfishingagency.co", mobile: "(523) 273-7789", expertise: "Net-No-Cost Wellness Plans that Generate Cash Flow", role: "team", status: "active" },
  { firstName: "Nathan", lastName: "Tyler", emailPrimary: "nathan@nsquared.io", expertise: "Executive Dash Boards", role: "affiliate", status: "active" },
  { firstName: "Nelinia", lastName: "Varenas", emailPrimary: "nelinia@stategicvalueplus.com", emailSecondary: "neliniav@gmail.com", mobile: "(310) 650-0725", expertise: "CEO", role: "admin", status: "active" },
  { firstName: "Nicholas", lastName: "Chiselett", emailPrimary: "nicholas@2bytes.com.au", mobile: "61414247540", expertise: "Construction On-line Stores", role: "affiliate", status: "active" },
  { firstName: "Philip", lastName: "Wolfstein", emailPrimary: "phil@philwolfstein.com", expertise: "Certified Business Broker", role: "affiliate", status: "active" },
  { firstName: "RC", lastName: "Caldwell", emailPrimary: "rc@CaldwellLeanSixSigma.com", mobile: "(937) 367-6743", expertise: "Black Belt Six Sigma/TOC Expert", role: "affiliate", status: "active" },
  { firstName: "Rick", lastName: "McPartlin", emailPrimary: "rick.mcpartlin@therevenuegame.com", mobile: "(800) 757-8377", expertise: "CRO", role: "affiliate", status: "active" },
  { firstName: "Rosemary", lastName: "Coates", emailPrimary: "rcoates@bluesilkconsulting.com", mobile: "(408) 605-8867", expertise: "Supply Chain/Re- and Nearshoring", role: "affiliate", status: "active" },
  { firstName: "Roy", lastName: "Dickan", emailPrimary: "rdickan@strategicalueplus.com", emailSecondary: "roy@clearchoicemarketinggroup.com", mobile: "(919) 589-3580", expertise: "CRO", role: "team", status: "active" },
  { firstName: "Ruoyu", lastName: "Loughry", emailPrimary: "rloughry@strategicvalueplus.com", emailSecondary: "ruoyu.loughry@gmail.com", mobile: "(408)390-6514", expertise: "CPA, Tax", role: "team", status: "active" },
  { firstName: "Russell", lastName: "Lookadoo", emailPrimary: "answers@TheHRGuy.biz", mobile: "(801) 808-3681", expertise: "Fractional CHRO", role: "affiliate", status: "active" },
  { firstName: "Tamara", lastName: "Litrich", emailPrimary: "tamara@tlitrichsolutions.com", emailSecondary: "tmlitrich76@gmail.com", mobile: "(415) 438-0666", expertise: "Human Resources, Multi-lingual", role: "affiliate", status: "active" },
  { firstName: "Tod", lastName: "Gotori", emailPrimary: "tgotori@fivebirdsconsulting.com", emailSecondary: "tgotori@gmail.com", mobile: "(949) 954-0679", expertise: "Cybersecurity Consulting", role: "affiliate", status: "active" },
  { firstName: "Vishnu", lastName: "Rajan", emailPrimary: "vrthenorth@gmail.com", expertise: "AI App Builder", role: "affiliate", status: "active" },
];

export default function TeamMeemerging businessrsPage() {
  const [meemerging businessrs, setMeemerging businessrs] = useState<TeamMeemerging businessrDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeemerging businessr, setEditingMeemerging businessr] = useState<TeamMeemerging businessrDoc | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [schedulingList, setSchedulingList] = useState<OneToOneQueueItemDoc[]>([]);
  const [showSchedulingPanel, setShowSchedulingPanel] = useState(false);
  const [loadingQueue, setLoadingQueue] = useState(false);
  // Avatar upload / Image Manager state
  const [avatarUrl, setAvatarUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState<ImageMetadata[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [imageManagerOpen, setImageManagerOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailPrimary: "",
    emailSecondary: "",
    mobile: "",
    expertise: "",
    title: "",
    company: "",
    location: "",
    bio: "",
    linkedIn: "",
    website: "",
    role: "affiliate" as TeamMeemerging businessrDoc["role"],
    status: "active" as "active" | "inactive" | "pending",
    // Leadership flags
    isCEO: false,
    isCOO: false,
    isCTO: false,
    isCRO: false,
    // Team display tag
    teamTag: "affiliate" as TeamMemberDoc["teamTag"],
  });

  // Fetch meemerging businessrs from Firebase
  const fetchMeemerging businessrs = async () => {
    if (!db) {
      console.error("Firebase not initialized");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.TEAM_MEemerging businessRS));
      const meemerging businessrsData: TeamMeemerging businessrDoc[] = [];
      querySnapshot.forEach((docSnap) => {
        meemerging businessrsData.push({ id: docSnap.id, ...docSnap.data() } as TeamMeemerging businessrDoc);
      });
      // Sort by last name (handle undefined values)
      meemerging businessrsData.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
      setMeemerging businessrs(meemerging businessrsData);
    } catch (error) {
      console.error("Error fetching meemerging businessrs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeemerging businessrs();
    fetchSchedulingQueue();
  }, []);

  // Fetch 1-to-1 scheduling queue from Firebase
  const fetchSchedulingQueue = async () => {
    if (!db) return;
    setLoadingQueue(true);
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.ONE_TO_ONE_QUEUE));
      const queueData: OneToOneQueueItemDoc[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === 'queued') {
          queueData.push({ id: docSnap.id, ...data } as OneToOneQueueItemDoc);
        }
      });
      // Sort by priority
      queueData.sort((a, b) => a.priority - b.priority);
      setSchedulingList(queueData);
      if (queueData.length > 0) {
        setShowSchedulingPanel(true);
      }
    } catch (error) {
      console.error("Error fetching scheduling queue:", error);
    } finally {
      setLoadingQueue(false);
    }
  };

  // Fetch images from the platform Image Manager (Firestore base64)
  const fetchGalleryImages = async () => {
    setLoadingGallery(true);
    try {
      const imgs = await listImages();
      setGalleryImages(imgs);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoadingGallery(false);
    }
  };

  // Seed initial data
  const handleSeedData = async () => {
    if (!db) {
      alert("Firebase not initialized. Check your environment variables.");
      return;
    }
    if (!confirm(`This will import ${seedTeamMeemerging businessrs.length} team meemerging businessrs. Continue?`)) return;
    
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, COLLECTIONS.TEAM_MEemerging businessRS);
      
      for (const meemerging businessr of seedTeamMeemerging businessrs) {
        const docRef = doc(collectionRef);
        batch.set(docRef, {
          ...meemerging businessr,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
      
      await batch.commit();
      await fetchMeemerging businessrs();
      alert(`Successfully imported ${seedTeamMeemerging businessrs.length} team meemerging businessrs!`);
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("Error importing data. Check console for details.");
    } finally {
      setSeeding(false);
    }
  };

  // Add or update meemerging businessr
  const handleSaveMeemerging businessr = async () => {
    if (!db) {
      alert("Firebase not initialized");
      return;
    }
    try {
      if (editingMeemerging businessr) {
        const docRef = doc(db, COLLECTIONS.TEAM_MEemerging businessRS, editingMeemerging businessr.id);
        await updateDoc(docRef, {
          ...formData,
          ...(avatarUrl ? { avatar: avatarUrl } : {}),
          updatedAt: Timestamp.now(),
        });
        // Log activity
        await logActivity({
          type: "update",
          entityType: "team-meemerging businessr",
          entityId: editingMeemerging businessr.id,
          entityName: `${formData.firstName} ${formData.lastName}`,
          description: `Team meemerging businessr updated: ${formData.firstName} ${formData.lastName}`,
        });
      } else {
        const docRef = await addDoc(collection(db, COLLECTIONS.TEAM_MEemerging businessRS), {
          ...formData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        // Log activity
        await logTeamMeemerging businessrAdded(docRef.id, `${formData.firstName} ${formData.lastName}`);
      }
      setDialogOpen(false);
      resetForm();
      await fetchMeemerging businessrs();
    } catch (error) {
      console.error("Error saving meemerging businessr:", error);
      alert("Error saving meemerging businessr. Check console for details.");
    }
  };

  // Update all meemerging businessrs' website from email domain
  const updateWebsitesFromEmail = async () => {
    if (!db) return;
    if (!confirm("This will update the website field for all team meemerging businessrs (without existing websites) based on their email domain. Continue?")) return;
    
    // Personal email domains to exclude
    const personalDomains = [
      "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", 
      "aol.com", "live.com", "icloud.com", "msn.com", "me.com",
      "mail.com", "protonmail.com", "zoho.com"
    ];
    
    try {
      const batch = writeBatch(db);
      let updateCount = 0;
      let skippedPersonal = 0;
      let skippedExisting = 0;
      
      for (const meemerging businessr of meemerging businessrs) {
        // Check if meemerging businessr has an email and no website (or empty website)
        const hasEmail = meemerging businessr.emailPrimary && meemerging businessr.emailPrimary.includes("@");
        const hasWebsite = meemerging businessr.website && meemerging businessr.website.trim().length > 0;
        
        if (hasEmail && !hasWebsite) {
          const emailDomain = meemerging businessr.emailPrimary.split("@")[1]?.toLowerCase();
          
          // Check if it's a personal email domain
          const isPersonalDomain = personalDomains.some(pd => emailDomain === pd || emailDomain?.endsWith(`.${pd}`));
          
          if (emailDomain && !isPersonalDomain) {
            const website = `https://www.${emailDomain}`;
            const docRef = doc(db, COLLECTIONS.TEAM_MEemerging businessRS, meemerging businessr.id);
            batch.update(docRef, { website, updatedAt: Timestamp.now() });
            updateCount++;
            console.log(`Updating ${meemerging businessr.firstName} ${meemerging businessr.lastName}: ${website}`);
          } else if (isPersonalDomain) {
            skippedPersonal++;
            console.log(`Skipped personal email: ${meemerging businessr.firstName} ${meemerging businessr.lastName} (${emailDomain})`);
          }
        } else if (hasWebsite) {
          skippedExisting++;
        }
      }
      
      if (updateCount > 0) {
        await batch.commit();
        alert(`Updated ${updateCount} team meemerging businessrs with website URLs.\nSkipped: ${skippedExisting} with existing websites, ${skippedPersonal} with personal emails.`);
        await fetchMeemerging businessrs();
      } else {
        alert(`No meemerging businessrs needed website updates.\nSkipped: ${skippedExisting} with existing websites, ${skippedPersonal} with personal emails.`);
      }
    } catch (error) {
      console.error("Error updating websites:", error);
      alert("Error updating websites. Check console for details.");
    }
  };

  // Delete meemerging businessr
  const handleDeleteMeemerging businessr = async (id: string, meemerging businessrName: string) => {
    if (!db) return;
    if (!confirm("Are you sure you want to delete this team meemerging businessr?")) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.TEAM_MEemerging businessRS, id));
      // Log activity
      await logActivity({
        type: "delete",
        entityType: "team-meemerging businessr",
        entityId: id,
        entityName: meemerging businessrName,
        description: `Team meemerging businessr removed: ${meemerging businessrName}`,
      });
      await fetchMeemerging businessrs();
    } catch (error) {
      console.error("Error deleting meemerging businessr:", error);
    }
  };

  // Edit meemerging businessr
  const handleEditMeemerging businessr = (meemerging businessr: TeamMeemerging businessrDoc) => {
    setEditingMeemerging businessr(meemerging businessr);
    setFormData({
      firstName: meemerging businessr.firstName,
      lastName: meemerging businessr.lastName,
      emailPrimary: meemerging businessr.emailPrimary,
      emailSecondary: meemerging businessr.emailSecondary || "",
      mobile: meemerging businessr.mobile || "",
      expertise: meemerging businessr.expertise,
      title: meemerging businessr.title || "",
      company: meemerging businessr.company || "",
      location: meemerging businessr.location || "",
      bio: meemerging businessr.bio || "",
      linkedIn: meemerging businessr.linkedIn || "",
      website: meemerging businessr.website || "",
      role: meemerging businessr.role,
      status: meemerging businessr.status,
      isCEO: meemerging businessr.isCEO || false,
      isCOO: meemerging businessr.isCOO || false,
      isCTO: meemerging businessr.isCTO || false,
      isCRO: meemerging businessr.isCRO || false,
      teamTag: meemerging businessr.teamTag || "affiliate",
    });
    setAvatarUrl(meemerging businessr.avatar || "");
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingMeemerging businessr(null);
    setAvatarUrl("");
    setFormData({
      firstName: "",
      lastName: "",
      emailPrimary: "",
      emailSecondary: "",
      mobile: "",
      expertise: "",
      title: "",
      company: "",
      location: "",
      bio: "",
      linkedIn: "",
      website: "",
      role: "affiliate",
      status: "active",
      isCEO: false,
      isCOO: false,
      isCTO: false,
      isCRO: false,
      teamTag: "affiliate",
    });
  };

  // 1-to-1 Scheduling functions
  const addToSchedulingList = async (meemerging businessr: TeamMeemerging businessrDoc) => {
    if (!db) return;
    // Check if already in queue
    if (schedulingList.find(m => m.teamMeemerging businessrId === meemerging businessr.id)) return;
    
    try {
      const queueItem: Omit<OneToOneQueueItemDoc, 'id'> = {
        teamMeemerging businessrId: meemerging businessr.id,
        teamMeemerging businessrName: `${meemerging businessr.firstName} ${meemerging businessr.lastName}`,
        teamMeemerging businessrEmail: meemerging businessr.emailPrimary,
        teamMeemerging businessrExpertise: meemerging businessr.expertise || '',
        teamMeemerging businessrAvatar: meemerging businessr.avatar || '',
        status: 'queued',
        priority: schedulingList.length + 1,
        addedBy: 'current-user', // TODO: Get actual user ID
        addedByName: 'Current User',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.ONE_TO_ONE_QUEUE), queueItem);
      const newItem: OneToOneQueueItemDoc = { id: docRef.id, ...queueItem } as OneToOneQueueItemDoc;
      setSchedulingList([...schedulingList, newItem]);
      setShowSchedulingPanel(true);
    } catch (error) {
      console.error("Error adding to scheduling queue:", error);
    }
  };

  const removeFromSchedulingList = async (queueItemId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.ONE_TO_ONE_QUEUE, queueItemId));
      setSchedulingList(schedulingList.filter(m => m.id !== queueItemId));
    } catch (error) {
      console.error("Error removing from scheduling queue:", error);
    }
  };

  const isInSchedulingList = (meemerging businessrId: string) => {
    return schedulingList.some(m => m.teamMeemerging businessrId === meemerging businessrId);
  };

  const getQueueItemId = (meemerging businessrId: string) => {
    const item = schedulingList.find(m => m.teamMeemerging businessrId === meemerging businessrId);
    return item?.id;
  };

  const clearSchedulingList = async () => {
    if (!db) return;
    try {
      const batch = writeBatch(db);
      for (const item of schedulingList) {
        batch.delete(doc(db, COLLECTIONS.ONE_TO_ONE_QUEUE, item.id));
      }
      await batch.commit();
      setSchedulingList([]);
    } catch (error) {
      console.error("Error clearing scheduling queue:", error);
    }
  };

  // Filter meemerging businessrs
  const filteredMeemerging businessrs = meemerging businessrs.filter((meemerging businessr) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (meemerging businessr.firstName || '').toLowerCase().includes(searchLower) ||
      (meemerging businessr.lastName || '').toLowerCase().includes(searchLower) ||
      (meemerging businessr.emailPrimary || '').toLowerCase().includes(searchLower) ||
      (meemerging businessr.expertise || '').toLowerCase().includes(searchLower);
    
    const matchesRole = roleFilter === "all" || meemerging businessr.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${(firstName || '')[0] || ""}${(lastName || '')[0] || ""}`.toUpperCase();
  };

  const getAvatarSrc = (meemerging businessr: TeamMeemerging businessrDoc): string => {
    if (meemerging businessr.avatar) return meemerging businessr.avatar;
    const email = (meemerging businessr.emailPrimary || "").trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = ((hash << 5) - hash) + email.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(32, "0").slice(0, 32);
    return `https://www.gravatar.com/avatar/${hex}?s=80&d=identicon`;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      case "team":
        return <Badge className="bg-blue-100 text-blue-800">Team</Badge>;
      case "affiliate":
        return <Badge className="bg-green-100 text-green-800">Affiliate</Badge>;
      case "consultant":
        return <Badge className="bg-purple-100 text-purple-800">Consultant</Badge>;
      case "sme_user":
        return <Badge className="bg-orange-100 text-orange-800">SME User</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>Admin</span>
            <ChevronRight className="h-4 w-4" />
            <span>Team Meemerging businessrs</span>
          </div>
          <h1 className="text-3xl font-bold">Team Meemerging businessrs</h1>
          <p className="text-muted-foreground">
            Manage SVP team meemerging businessrs, affiliates, and consultants
          </p>
        </div>
        <div className="flex gap-2">
          {meemerging businessrs.length > 0 && (
            <Button variant="outline" onClick={updateWebsitesFromEmail}>
              <Globe className="mr-2 h-4 w-4" />
              Update Websites
            </Button>
          )}
          {meemerging businessrs.length === 0 && (
            <Button variant="outline" onClick={handleSeedData} disabled={seeding}>
              {seeding ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Import {seedTeamMeemerging businessrs.length} Meemerging businessrs
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Meemerging businessr
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMeemerging businessr ? "Edit Team Meemerging businessr" : "Add Team Meemerging businessr"}
                </DialogTitle>
                <DialogDescription>
                  {editingMeemerging businessr 
                    ? "Update the team meemerging businessr's information below."
                    : "Enter the details for the new team meemerging businessr."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Avatar Upload Section */}
                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-muted">
                      <AvatarImage src={avatarUrl || (editingMeemerging businessr ? getAvatarSrc(editingMeemerging businessr) : undefined)} />
                      <AvatarFallback className="text-lg">
                        {getInitials(formData.firstName, formData.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            fetchGalleryImages();
                            setImageManagerOpen(true);
                          }}
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Image Manager
                        </Button>
                        {avatarUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAvatarUrl("")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select from Image Manager or paste a URL below.
                      </p>
                      <Input
                        placeholder="https://example.com/photo.jpg"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Manager Dialog */}
                <Dialog open={imageManagerOpen} onOpenChange={setImageManagerOpen}>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Image Manager
                      </DialogTitle>
                      <DialogDescription>
                        Select a photo from the Image Library. Upload new photos via Admin → Image Management.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          {galleryImages.length} image{galleryImages.length !== 1 ? "s" : ""} in library
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchGalleryImages}
                          disabled={loadingGallery}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${loadingGallery ? "animate-spin" : ""}`} />
                          Refresh
                        </Button>
                      </div>
                      {loadingGallery ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : galleryImages.length === 0 ? (
                        <div className="border-2 border-dashed border-muted rounded-lg p-10 text-center">
                          <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                          <p className="text-sm font-medium">No images in library</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Go to <strong>Admin → Image Management</strong> to upload photos first.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
                          {galleryImages.map((img) => {
                            const linkedMeemerging businessr = meemerging businessrs.find((m) => m.avatar === img.id);
                            const isSelected = avatarUrl === img.id;
                            return (
                              <GalleryImageTile
                                key={img.id}
                                img={img}
                                isSelected={isSelected}
                                linkedMeemerging businessrName={linkedMeemerging businessr ? `${linkedMeemerging businessr.firstName} ${linkedMeemerging businessr.lastName}` : undefined}
                                onSelect={async (id) => {
                                  const full = await getImage(id);
                                  if (full) {
                                    setAvatarUrl(base64ToDataUrl(full.base64Data, full.mimeType));
                                  }
                                  setImageManagerOpen(false);
                                }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setImageManagerOpen(false)}>
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailPrimary">Email (Primary) *</Label>
                    <Input
                      id="emailPrimary"
                      type="email"
                      value={formData.emailPrimary}
                      onChange={(e) => setFormData({ ...formData, emailPrimary: e.target.value })}
                      placeholder="john@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailSecondary">Email (Secondary)</Label>
                    <Input
                      id="emailSecondary"
                      type="email"
                      value={formData.emailSecondary}
                      onChange={(e) => setFormData({ ...formData, emailSecondary: e.target.value })}
                      placeholder="john@gmail.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => 
                        setFormData({ ...formData, role: value as TeamMeemerging businessrDoc["role"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="affiliate">Affiliate</SelectItem>
                        <SelectItem value="consultant">Consultant</SelectItem>
                        <SelectItem value="sme_user">SME User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamTag">Team Display Tag</Label>
                    <Select
                      value={formData.teamTag}
                      onValueChange={(value) => 
                        setFormData({ ...formData, teamTag: value as TeamMemberDoc["teamTag"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select display tag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leadership">KDM Leadership</SelectItem>
                        <SelectItem value="staff">KDM Staff</SelectItem>
                        <SelectItem value="affiliate">KDM Affiliate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expertise">Expertise *</Label>
                  <Input
                    id="expertise"
                    value={formData.expertise}
                    onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    placeholder="e.g., Operations, Six Sigma, Marketing"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Senior Consultant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Company name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedIn">LinkedIn</Label>
                    <Input
                      id="linkedIn"
                      value={formData.linkedIn}
                      onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive" | "pending") => 
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief biography..."
                    rows={3}
                  />
                </div>
                
                {/* Leadership Role Flags */}
                <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                  <Label className="text-sm font-medium">Leadership Roles (for About/Leadership pages)</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Check the boxes below to display this team meemerging businessr on the About and Leadership pages with the corresponding role.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isCEO"
                        checked={formData.isCEO}
                        onChange={(e) => setFormData({ ...formData, isCEO: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="isCEO" className="text-sm font-normal cursor-pointer">
                        CEO / Chief Executive Officer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isCOO"
                        checked={formData.isCOO}
                        onChange={(e) => setFormData({ ...formData, isCOO: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="isCOO" className="text-sm font-normal cursor-pointer">
                        COO / Chief Operations Officer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isCTO"
                        checked={formData.isCTO}
                        onChange={(e) => setFormData({ ...formData, isCTO: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="isCTO" className="text-sm font-normal cursor-pointer">
                        CTO / Chief Technology Officer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isCRO"
                        checked={formData.isCRO}
                        onChange={(e) => setFormData({ ...formData, isCRO: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="isCRO" className="text-sm font-normal cursor-pointer">
                        CRO / Chief Revenue Officer
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveMeemerging businessr} disabled={!formData.firstName || !formData.lastName || !formData.emailPrimary || !formData.expertise}>
                  {editingMeemerging businessr ? "Update Meemerging businessr" : "Add Meemerging businessr"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Meemerging businessrs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meemerging businessrs.length}</div>
            <p className="text-xs text-muted-foreground">In the network</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {meemerging businessrs.filter((m) => m.role === "admin").length}
            </div>
            <p className="text-xs text-muted-foreground">Platform admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {meemerging businessrs.filter((m) => m.role === "team").length}
            </div>
            <p className="text-xs text-muted-foreground">Core team meemerging businessrs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Affiliates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {meemerging businessrs.filter((m) => m.role === "affiliate").length}
            </div>
            <p className="text-xs text-muted-foreground">Network affiliates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {meemerging businessrs.filter((m) => m.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* KDM Team Sync */}
      <KdmTeamSync />

      {/* Filters and View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or expertise..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="affiliate">Affiliate</SelectItem>
                <SelectItem value="consultant">Consultant</SelectItem>
                <SelectItem value="sme_user">SME User</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3"
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
              <Button
                variant={viewMode === "card" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("card")}
                className="px-3"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Cards
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meemerging businessrs Content */}
      {loading ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ) : filteredMeemerging businessrs.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No team meemerging businessrs found</h3>
              <p className="text-muted-foreground mb-4">
                {meemerging businessrs.length === 0 
                  ? "Get started by importing the initial team meemerging businessr data."
                  : "Try adjusting your search or filter."}
              </p>
              {meemerging businessrs.length === 0 && (
                <Button onClick={handleSeedData} disabled={seeding}>
                  {seeding ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Import {seedTeamMeemerging businessrs.length} Meemerging businessrs
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        /* List View */
        <Card>
          <CardHeader>
            <CardTitle>Team Directory</CardTitle>
            <CardDescription>
              {filteredMeemerging businessrs.length} meemerging businessr{filteredMeemerging businessrs.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="hidden lg:table-cell">Expertise</TableHead>
                    <TableHead className="hidden md:table-cell">Website</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeemerging businessrs.map((meemerging businessr) => (
                    <TableRow key={meemerging businessr.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={getAvatarSrc(meemerging businessr)} />
                            <AvatarFallback className="text-xs">
                              {getInitials(meemerging businessr.firstName, meemerging businessr.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <button
                              onClick={() => handleEditMeemerging businessr(meemerging businessr)}
                              className="font-medium hover:underline text-left text-primary"
                            >
                              {meemerging businessr.firstName} {meemerging businessr.lastName}
                            </button>
                            {meemerging businessr.title && (
                              <p className="text-xs text-muted-foreground">{meemerging businessr.title}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <a href={`mailto:${meemerging businessr.emailPrimary}`} className="hover:underline">
                              {meemerging businessr.emailPrimary}
                            </a>
                          </div>
                          {meemerging businessr.mobile && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {meemerging businessr.mobile}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell max-w-xs">
                        <p className="text-sm truncate" title={meemerging businessr.expertise}>
                          {meemerging businessr.expertise}
                        </p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {meemerging businessr.website ? (
                          <a
                            href={meemerging businessr.website.startsWith('http') ? meemerging businessr.website : `https://${meemerging businessr.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Globe className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">
                              {meemerging businessr.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>{getRoleBadge(meemerging businessr.role)}</TableCell>
                      <TableCell>
                        {meemerging businessr.status === "active" ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : meemerging businessr.status === "pending" ? (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            <UserX className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant={isInSchedulingList(meemerging businessr.id) ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => {
                              const queueItemId = getQueueItemId(meemerging businessr.id);
                              if (queueItemId) {
                                removeFromSchedulingList(queueItemId);
                              } else {
                                addToSchedulingList(meemerging businessr);
                              }
                            }}
                            title={isInSchedulingList(meemerging businessr.id) ? "Remove from 1-to-1 list" : "Add to 1-to-1 list"}
                          >
                            <CalendarPlus className={`h-4 w-4 ${isInSchedulingList(meemerging businessr.id) ? "text-primary" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditMeemerging businessr(meemerging businessr)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMeemerging businessr(meemerging businessr.id, `${meemerging businessr.firstName} ${meemerging businessr.lastName}`)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Card View */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMeemerging businessrs.map((meemerging businessr) => (
            <Card key={meemerging businessr.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getAvatarSrc(meemerging businessr)} />
                      <AvatarFallback>
                        {getInitials(meemerging businessr.firstName, meemerging businessr.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {meemerging businessr.firstName} {meemerging businessr.lastName}
                      </CardTitle>
                      {meemerging businessr.title && (
                        <CardDescription>{meemerging businessr.title}</CardDescription>
                      )}
                    </div>
                  </div>
                  {getRoleBadge(meemerging businessr.role)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expertise</p>
                  <p className="text-sm">{meemerging businessr.expertise}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <a href={`mailto:${meemerging businessr.emailPrimary}`} className="hover:underline truncate">
                      {meemerging businessr.emailPrimary}
                    </a>
                  </div>
                  {meemerging businessr.mobile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {meemerging businessr.mobile}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2">
                  {meemerging businessr.status === "active" ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : meemerging businessr.status === "pending" ? (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Pending
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-600">
                      <UserX className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                  <div className="flex gap-1">
                    <Button
                      variant={isInSchedulingList(meemerging businessr.id) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => {
                        const queueItemId = getQueueItemId(meemerging businessr.id);
                        if (queueItemId) {
                          removeFromSchedulingList(queueItemId);
                        } else {
                          addToSchedulingList(meemerging businessr);
                        }
                      }}
                      title={isInSchedulingList(meemerging businessr.id) ? "Remove from 1-to-1 list" : "Add to 1-to-1 list"}
                    >
                      <CalendarPlus className={`h-4 w-4 ${isInSchedulingList(meemerging businessr.id) ? "text-primary" : ""}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMeemerging businessr(meemerging businessr)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMeemerging businessr(meemerging businessr.id, `${meemerging businessr.firstName} ${meemerging businessr.lastName}`)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 1-to-1 Scheduling Panel */}
      {showSchedulingPanel && (
        <div className="fixed bottom-4 right-4 w-96 bg-background border rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">1-to-1 Scheduling List</h3>
              <Badge variant="secondary">{schedulingList.length}</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSchedulingPanel(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto">
            {schedulingList.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CalendarPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No meemerging businessrs added yet</p>
                <p className="text-xs">Click the calendar icon on any meemerging businessr to add them</p>
              </div>
            ) : (
              <div className="space-y-2">
                {schedulingList.map((queueItem) => (
                  <div
                    key={queueItem.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={queueItem.teamMeemerging businessrAvatar} />
                        <AvatarFallback className="text-xs">
                          {(queueItem.teamMeemerging businessrName || '').split(' ').filter(n => n).map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {queueItem.teamMeemerging businessrName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {queueItem.teamMeemerging businessrExpertise}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromSchedulingList(queueItem.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {schedulingList.length > 0 && (
            <div className="p-4 border-t space-y-2">
              <Button className="w-full" asChild>
                <a href={`/portal/calendar?schedule=${schedulingList.map(m => m.id).join(',')}`}>
                  <Clock className="mr-2 h-4 w-4" />
                  Schedule 1-to-1 Meetings
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={clearSchedulingList}
              >
                Clear List
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Floating button to show scheduling panel when hidden but has items */}
      {!showSchedulingPanel && schedulingList.length > 0 && (
        <Button
          className="fixed bottom-4 right-4 z-50 shadow-lg"
          onClick={() => setShowSchedulingPanel(true)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          1-to-1 List ({schedulingList.length})
        </Button>
      )}
    </div>
  );
}

// ─── Gallery Image Tile ────────────────────────────────────────────────────────
interface GalleryImageTileProps {
  img: ImageMetadata;
  isSelected: boolean;
  linkedMeemerging businessrName?: string;
  onSelect: (id: string) => Promise<void>;
}

function GalleryImageTile({ img, isSelected, linkedMeemerging businessrName, onSelect }: GalleryImageTileProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getImage(img.id).then((full) => {
      if (!cancelled && full) {
        setDataUrl(base64ToDataUrl(full.base64Data, full.mimeType));
      }
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [img.id]);

  return (
    <button
      type="button"
      onClick={() => onSelect(img.id)}
      className={`relative flex flex-col rounded-lg overflow-hidden border-2 transition-all hover:border-primary ${
        isSelected ? "border-primary ring-2 ring-primary" : "border-muted"
      }`}
    >
      <div className="relative aspect-square w-full bg-muted flex items-center justify-center">
        {loading ? (
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt={img.name} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground opacity-40" />
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-primary drop-shadow" />
          </div>
        )}
      </div>
      <div className={`px-1.5 py-1 text-center text-xs truncate w-full ${
        isSelected ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground"
      }`}>
        {linkedMeemerging businessrName ?? img.name}
      </div>
    </button>
  );
}
