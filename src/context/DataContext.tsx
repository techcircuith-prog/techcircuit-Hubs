import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { 
  Opportunity, 
  Skill, 
  Company, 
  Project, 
  Resource, 
  LearningPath, 
  Application, 
  StudentSkill, 
  Badge, 
  Order, 
  ScoringConfig 
} from '../types';
import { 
  INITIAL_SKILLS, 
  INITIAL_COMPANIES, 
  INITIAL_OPPORTUNITIES, 
  INITIAL_PROJECTS, 
  INITIAL_RESOURCES, 
  INITIAL_LEARNING_PATHS, 
  DEFAULT_SCORING 
} from '../lib/seedData';

interface DataContextType {
  skills: Skill[];
  companies: Company[];
  opportunities: Opportunity[];
  projects: Project[];
  resources: Resource[];
  learningPaths: LearningPath[];
  applications: Application[];
  savedItemIds: string[];
  studentSkills: StudentSkill[];
  badges: Badge[];
  orders: Order[];
  scoringConfig: ScoringConfig;
  loading: boolean;
  // Student Actions
  toggleSaveItem: (targetId: string, targetType: 'opportunity' | 'resource') => Promise<void>;
  recordApplyClick: (opportunity: Opportunity) => Promise<string>;
  confirmApplied: (opportunityId: string) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: Application['status'], certificateUrl?: string) => Promise<void>;
  completeResource: (resourceId: string, skillIds: string[]) => Promise<{ pointsAwarded: number; message: string }>;
  toggleBookmarkResource: (resourceId: string) => Promise<void>;
  suggestResource: (data: { url: string; category: string; note: string }) => Promise<void>;
  reportResource: (resourceId: string, reason: string) => Promise<void>;
  // Admin Actions
  saveOpportunity: (opp: Partial<Opportunity>) => Promise<void>;
  deleteOpportunity: (id: string) => Promise<void>;
  saveProject: (proj: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  saveResource: (res: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  saveLearningPath: (path: Partial<LearningPath>) => Promise<void>;
  deleteLearningPath: (id: string) => Promise<void>;
  saveCompany: (comp: Partial<Company>) => Promise<void>;
  saveSkill: (skill: Partial<Skill>) => Promise<void>;
  updateScoringConfig: (config: ScoringConfig) => Promise<void>;
  reseedDatabase: () => Promise<void>;
  purgeAllMockData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile, isAdmin, logEvent } = useAuth();

  const [skills, setSkills] = useState<Skill[]>(() =>
    INITIAL_SKILLS.map((s, i) => ({ id: `skill-${i + 1}`, ...s }))
  );
  const [companies, setCompanies] = useState<Company[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [projects, setProjects] = useState<Project[]>(() =>
    INITIAL_PROJECTS.map((p, i) => {
      const num = i + 1;
      return {
        id: `proj-${num}`,
        ...p,
        images: [
          `/projects/ece${num}.png`,
          `/projects/ece${num}.jpg`,
          `/projects/ece ${num}.png`,
          `/projects/ece ${num}.jpg`,
        ],
        createdAt: '2026-10-09T00:00:00.000Z',
      };
    })
  );
  const [resources, setResources] = useState<Resource[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedItemIds, setSavedItemIds] = useState<string[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [scoringConfig, setScoringConfig] = useState<ScoringConfig>(DEFAULT_SCORING);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and load genuine Firestore data while auto-purging any legacy mock records
  useEffect(() => {
    let mounted = true;

    async function loadPublicData() {
      try {
        // 1. Skills
        try {
          const skillsSnap = await getDocs(collection(db, 'skills'));
          if (!skillsSnap.empty) {
            const list: Skill[] = [];
            skillsSnap.forEach((d) => list.push({ id: d.id, ...d.data() } as Skill));
            if (mounted) setSkills(list);
          } else if (isAdmin) {
            const initialSkillsList: Skill[] = [];
            for (const s of INITIAL_SKILLS) {
              const id = s.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
              await setDoc(doc(db, 'skills', id), s);
              initialSkillsList.push({ id, ...s });
            }
            if (mounted) setSkills(initialSkillsList);
          }
        } catch {}

        // 2. Companies (Purge any mock companies from Firestore)
        try {
          const compSnap = await getDocs(collection(db, 'companies'));
          const list: Company[] = [];
          for (const d of compSnap.docs) {
            const data = d.data();
            const isMock = d.id.startsWith('comp-') || 
              ['texas-instruments', 'qualcomm-india', 'stmicroelectronics', 'intel-semiconductor', 'cadence-design-systems', 'bharat-electronics-limited--bel-'].includes(d.id) ||
              ['Texas Instruments', 'Qualcomm India', 'STMicroelectronics', 'Intel Semiconductor'].includes(data.name);
            if (isMock) {
              try { await deleteDoc(doc(db, 'companies', d.id)); } catch {}
            } else {
              list.push({ id: d.id, ...data } as Company);
            }
          }
          if (mounted) setCompanies(list);
        } catch {}

        // 3. Opportunities (Purge any mock opportunities from Firestore)
        try {
          const oppSnap = await getDocs(collection(db, 'opportunities'));
          const list: Opportunity[] = [];
          for (const d of oppSnap.docs) {
            const data = d.data();
            const isMock = d.id.startsWith('opp-') ||
              data.title?.includes('VLSI Digital Design') ||
              data.title?.includes('Firmware Engineering') ||
              data.title?.includes('Hands-on 6-Layer High-Speed') ||
              data.title?.includes('India Silicon Hackathon');
            if (isMock) {
              try { await deleteDoc(doc(db, 'opportunities', d.id)); } catch {}
            } else {
              list.push({ id: d.id, ...data } as Opportunity);
            }
          }
          if (mounted) setOpportunities(list);
        } catch {}

        // 4. Projects (42 Official ECE & PCB Lab Projects from catalog)
        try {
          const projSnap = await getDocs(collection(db, 'projects'));
          const firestoreMap = new Map<string, Partial<Project>>();
          if (!projSnap.empty) {
            projSnap.forEach((d) => firestoreMap.set(d.id, d.data() as Project));
          }

          // Build canonical list for all 42 projects
          const list: Project[] = INITIAL_PROJECTS.map((canon, idx) => {
            const id = `proj-${idx + 1}`;
            const num = idx + 1;
            const custom = firestoreMap.get(id);

            const canonicalImages = [
              `/projects/ece${num}.png`,
              `/projects/ece${num}.jpg`,
              `/projects/ece ${num}.png`,
              `/projects/ece ${num}.jpg`,
            ];

            return {
              ...canon,
              id,
              stock: custom?.stock ?? canon.stock,
              status: custom?.status ?? canon.status,
              images: canonicalImages,
              createdAt: custom?.createdAt || '2026-10-09T00:00:00.000Z',
            } as Project;
          });
          const canonicalIds = new Set(list.map((project) => project.id));
          for (const document of projSnap.docs) {
            if (canonicalIds.has(document.id)) continue;
            const project = document.data() as Project;
            list.push({
              ...project,
              id: document.id,
              images: Array.isArray(project.images) ? project.images : [],
              skillIds: Array.isArray(project.skillIds) ? project.skillIds : [],
              createdAt: project.createdAt || new Date().toISOString(),
            });
          }

          if (mounted) setProjects(list);
        } catch {
          if (mounted) {
            setProjects(
              INITIAL_PROJECTS.map((p, i) => {
                const num = i + 1;
                return {
                  id: `proj-${num}`,
                  ...p,
                  images: [
                    `/projects/ece${num}.png`,
                    `/projects/ece${num}.jpg`,
                    `/projects/ece ${num}.png`,
                    `/projects/ece ${num}.jpg`,
                  ],
                  createdAt: '2026-10-09T00:00:00.000Z',
                };
              })
            );
          }
        }

        // 5. Resources (Purge mock resources from Firestore)
        try {
          const resSnap = await getDocs(collection(db, 'resources'));
          const list: Resource[] = [];
          for (const d of resSnap.docs) {
            const data = d.data();
            const isMock = d.id.startsWith('res-') ||
              data.url?.includes('dQw4w9WgXcQ') ||
              data.title?.includes('NPTEL: CMOS VLSI') ||
              data.title?.includes('Falstad Circuit Simulator') ||
              data.title?.includes('FastBit Academy');
            if (isMock) {
              try { await deleteDoc(doc(db, 'resources', d.id)); } catch {}
            } else {
              list.push({ id: d.id, ...data } as Resource);
            }
          }
          if (mounted) setResources(list);
        } catch {}

        // 6. Learning Paths (Purge mock learning paths from Firestore)
        try {
          const pathSnap = await getDocs(collection(db, 'learning_paths'));
          const list: LearningPath[] = [];
          for (const d of pathSnap.docs) {
            const data = d.data();
            const isMock = d.id.startsWith('path-') ||
              data.title?.includes('Embedded Systems: Beginner to Advanced') ||
              data.title?.includes('VLSI Digital Design & ASIC Verification Track');
            if (isMock) {
              try { await deleteDoc(doc(db, 'learning_paths', d.id)); } catch {}
            } else {
              list.push({ id: d.id, ...data } as LearningPath);
            }
          }
          if (mounted) setLearningPaths(list);
        } catch {}

      } catch (err) {
        // Fallbacks already in place
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPublicData();
    return () => { mounted = false; };
  }, [isAdmin]);

  // Subscribe to user-specific Firestore collections
  useEffect(() => {
    const userId = user?.uid;
    if (!userId || !auth.currentUser) {
      setApplications((prev) => (prev.length === 0 ? prev : []));
      setSavedItemIds((prev) => (prev.length === 0 ? prev : []));
      setStudentSkills((prev) => (prev.length === 0 ? prev : []));
      setBadges((prev) => (prev.length === 0 ? prev : []));
      setOrders((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    // 1. Applications
    const qApps = query(collection(db, 'applications'), where('userId', '==', userId));
    const unsubApps = onSnapshot(qApps, (snapshot) => {
      const list: Application[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Application));
      setApplications(list);
    }, (err) => console.warn('applications listener error', err));

    // 2. Saved Items
    const qSaved = query(collection(db, 'saved_items'), where('userId', '==', userId));
    const unsubSaved = onSnapshot(qSaved, (snapshot) => {
      const ids: string[] = [];
      snapshot.forEach((d) => ids.push(d.data().targetId));
      setSavedItemIds(ids);
    }, (err) => console.warn('saved_items listener error', err));

    // 3. Student Skills
    const qSkills = query(collection(db, 'student_skills'), where('userId', '==', userId));
    const unsubSkills = onSnapshot(qSkills, (snapshot) => {
      const list: StudentSkill[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as StudentSkill));
      setStudentSkills(list);
    }, (err) => console.warn('student_skills listener error', err));

    // 4. Badges
    const qBadges = query(collection(db, 'badges'), where('userId', '==', userId));
    const unsubBadges = onSnapshot(qBadges, (snapshot) => {
      const list: Badge[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Badge));
      setBadges(list);
    }, (err) => console.warn('badges listener error', err));

    // 5. Orders
    const qOrders = query(collection(db, 'orders'), where('userId', '==', userId));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Order));
      setOrders(list);
    }, (err) => console.warn('orders listener error', err));

    return () => {
      unsubApps();
      unsubSaved();
      unsubSkills();
      unsubBadges();
      unsubOrders();
    };
  }, [user?.uid]);

  // Server-side Skill Point Awarding Helper
  const awardPointsForSkills = async (skillNamesOrIds: string[], pointsToAdd: number, reason: string) => {
    if (!user) return;
    try {
      for (const skillName of skillNamesOrIds) {
        const docId = `${user.uid}_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const ref = doc(db, 'student_skills', docId);
        const existing = studentSkills.find((s) => s.id === docId);

        const currentPoints = existing ? existing.points : 0;
        const newPoints = currentPoints + pointsToAdd;

        let level: StudentSkill['level'] = 'Beginner';
        if (newPoints >= 300) level = 'Expert';
        else if (newPoints >= 150) level = 'Advanced';
        else if (newPoints >= 50) level = 'Intermediate';

        await setDoc(ref, {
          userId: user.uid,
          skillId: docId,
          skillName,
          points: newPoints,
          level,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      // Check Badges
      if (reason === 'first_apply' && badges.length === 0) {
        const badgeRef = doc(db, 'badges', `${user.uid}_first_apply`);
        await setDoc(badgeRef, {
          userId: user.uid,
          badgeId: 'first_apply',
          title: 'Circuit Pioneer',
          description: 'Submitted your first technical opportunity application!',
          icon: 'Zap',
          earnedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error awarding skill points:', err);
    }
  };

  // Toggle Save Item
  const toggleSaveItem = async (targetId: string, targetType: 'opportunity' | 'resource') => {
    if (!user) return;
    const docId = `${user.uid}_${targetId}`;
    const ref = doc(db, 'saved_items', docId);

    if (savedItemIds.includes(targetId)) {
      await deleteDoc(ref);
      setSavedItemIds((prev) => prev.filter((id) => id !== targetId));
    } else {
      await setDoc(ref, {
        userId: user.uid,
        targetType,
        targetId,
        createdAt: new Date().toISOString(),
      });
      setSavedItemIds((prev) => [...prev, targetId]);
      logEvent('save_item', { targetId, targetType });
    }
  };

  // Record Apply Click
  const recordApplyClick = async (opportunity: Opportunity): Promise<string> => {
    if (!user) return '';
    logEvent('apply_click', { opportunityId: opportunity.id, title: opportunity.title });

    const appId = `${user.uid}_${opportunity.id}`;
    const ref = doc(db, 'applications', appId);

    // If not existing yet, create initial saved/click record
    const existing = applications.find((a) => a.id === appId);
    if (!existing) {
      await setDoc(ref, {
        userId: user.uid,
        opportunityId: opportunity.id,
        opportunity,
        status: 'saved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    return appId;
  };

  // Confirm Applied ("Did you apply? Yes")
  const confirmApplied = async (opportunityId: string) => {
    if (!user) return;
    const appId = `${user.uid}_${opportunityId}`;
    const ref = doc(db, 'applications', appId);
    const opp = opportunities.find((o) => o.id === opportunityId);

    const now = new Date().toISOString();
    await setDoc(ref, {
      userId: user.uid,
      opportunityId,
      opportunity: opp,
      status: 'applied',
      appliedAt: now,
      createdAt: now,
      updatedAt: now,
    }, { merge: true });

    // Award +10 skill points for opportunity skills
    if (opp?.skillIds && opp.skillIds.length > 0) {
      await awardPointsForSkills(opp.skillIds, scoringConfig.applied, 'first_apply');
    }

    logEvent('opportunity_applied', { opportunityId });
  };

  // Update Application Status (Tracker)
  const updateApplicationStatus = async (
    applicationId: string, 
    status: Application['status'], 
    certificateUrl?: string
  ) => {
    if (!user) return;
    const ref = doc(db, 'applications', applicationId);
    const app = applications.find((a) => a.id === applicationId);

    const updatePayload: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'shortlisted') {
      updatePayload.shortlistedAt = new Date().toISOString();
      if (app?.opportunity?.skillIds) {
        await awardPointsForSkills(app.opportunity.skillIds, scoringConfig.shortlisted, 'shortlisted');
      }
    } else if (status === 'completed') {
      updatePayload.completedAt = new Date().toISOString();
      if (app?.opportunity?.skillIds) {
        await awardPointsForSkills(app.opportunity.skillIds, scoringConfig.completed, 'completed');
      }
    }

    if (certificateUrl) {
      updatePayload.certificateUrl = certificateUrl;
      updatePayload.certificateSubmitted = true;
      if (app?.opportunity?.skillIds) {
        await awardPointsForSkills(app.opportunity.skillIds, scoringConfig.certificateUploaded, 'certificate');
      }
    }

    await updateDoc(ref, updatePayload);
  };

  // Complete Resource (Server Authoritative)
  const completeResource = async (resourceId: string, skillIds: string[]) => {
    if (!user) throw new Error('Authentication required');

    const res = await fetch(`/api/resources/${resourceId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.uid, skillIds }),
    });

    const data = await res.json();
    if (data.success && data.pointsAwarded > 0) {
      await awardPointsForSkills(skillIds, data.pointsAwarded, 'resource_completion');
    }

    // Update resource progress record in Firestore
    const progRef = doc(db, 'resource_progress', `${user.uid}_${resourceId}`);
    await setDoc(progRef, {
      userId: user.uid,
      resourceId,
      completed: true,
      completedAt: new Date().toISOString(),
    }, { merge: true });

    return { pointsAwarded: data.pointsAwarded, message: data.message };
  };

  // Bookmark Resource
  const toggleBookmarkResource = async (resourceId: string) => {
    if (!user) return;
    const progRef = doc(db, 'resource_progress', `${user.uid}_${resourceId}`);
    const isBookmarked = savedItemIds.includes(resourceId);

    if (isBookmarked) {
      await setDoc(progRef, { bookmarked: false }, { merge: true });
      setSavedItemIds((prev) => prev.filter((id) => id !== resourceId));
    } else {
      await setDoc(progRef, {
        userId: user.uid,
        resourceId,
        bookmarked: true,
      }, { merge: true });
      setSavedItemIds((prev) => [...prev, resourceId]);
    }
  };

  // Suggest Resource
  const suggestResource = async (data: { url: string; category: string; note: string }) => {
    if (!user) return;
    const id = `sugg_${Date.now()}`;
    await setDoc(doc(db, 'resource_suggestions', id), {
      userId: user.uid,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  };

  // Report Resource
  const reportResource = async (resourceId: string, reason: string) => {
    if (!user) return;
    const id = `report_${Date.now()}`;
    await setDoc(doc(db, 'resource_reports', id), {
      userId: user.uid,
      resourceId,
      reason,
      createdAt: new Date().toISOString(),
    });
  };

  // Admin CRUD Functions
  const saveOpportunity = async (opp: Partial<Opportunity>) => {
    if (!isAdmin) throw new Error('Administrator access is required to save opportunities.');
    const id = opp.id || `opp_${Date.now()}`;
    const item = { ...opp, id, createdAt: opp.createdAt || new Date().toISOString() };
    await setDoc(doc(db, 'opportunities', id), item, { merge: true });
    setOpportunities((prev) => {
      const idx = prev.findIndex((o) => o.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item as Opportunity;
        return copy;
      }
      return [item as Opportunity, ...prev];
    });
  };

  const deleteOpportunity = async (id: string) => {
    if (!isAdmin) throw new Error('Administrator access is required to delete opportunities.');
    await deleteDoc(doc(db, 'opportunities', id));
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
  };

  const saveProject = async (proj: Partial<Project>) => {
    if (!isAdmin) throw new Error('Administrator access is required to save projects.');
    const id = proj.id || `proj_${Date.now()}`;
    const item = { ...proj, id, createdAt: proj.createdAt || new Date().toISOString() };
    await setDoc(doc(db, 'projects', id), item, { merge: true });
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item as Project;
        return copy;
      }
      return [item as Project, ...prev];
    });
  };

  const deleteProject = async (id: string) => {
    if (!isAdmin) throw new Error('Administrator access is required to delete projects.');
    await deleteDoc(doc(db, 'projects', id));
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const saveResource = async (res: Partial<Resource>) => {
    if (!isAdmin) throw new Error('Administrator access is required to save resources.');
    const id = res.id || `res_${Date.now()}`;
    const item = { ...res, id, createdAt: res.createdAt || new Date().toISOString() };
    await setDoc(doc(db, 'resources', id), item, { merge: true });
    setResources((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item as Resource;
        return copy;
      }
      return [item as Resource, ...prev];
    });
  };

  const deleteResource = async (id: string) => {
    if (!isAdmin) throw new Error('Administrator access is required to delete resources.');
    await deleteDoc(doc(db, 'resources', id));
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const saveLearningPath = async (path: Partial<LearningPath>) => {
    if (!isAdmin) throw new Error('Administrator access is required to save learning paths.');
    const id = path.id || `path_${Date.now()}`;
    const item = { ...path, id, createdAt: path.createdAt || new Date().toISOString() };
    await setDoc(doc(db, 'learning_paths', id), item, { merge: true });
    setLearningPaths((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item as LearningPath;
        return copy;
      }
      return [item as LearningPath, ...prev];
    });
  };

  const deleteLearningPath = async (id: string) => {
    if (!isAdmin) throw new Error('Administrator access is required to delete learning paths.');
    await deleteDoc(doc(db, 'learning_paths', id));
    setLearningPaths((prev) => prev.filter((p) => p.id !== id));
  };

  const saveCompany = async (comp: Partial<Company>) => {
    if (!isAdmin) throw new Error('Administrator access is required to save companies.');
    const id = comp.id || `comp_${Date.now()}`;
    const item = { ...comp, id };
    await setDoc(doc(db, 'companies', id), item, { merge: true });
    setCompanies((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item as Company;
        return copy;
      }
      return [item as Company, ...prev];
    });
  };

  const saveSkill = async (skill: Partial<Skill>) => {
    if (!isAdmin) throw new Error('Administrator access is required to save skills.');
    const id = skill.id || `skill_${Date.now()}`;
    const item = { ...skill, id };
    await setDoc(doc(db, 'skills', id), item, { merge: true });
    setSkills((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item as Skill;
        return copy;
      }
      return [item as Skill, ...prev];
    });
  };

  const updateScoringConfig = async (config: ScoringConfig) => {
    if (!isAdmin) throw new Error('Administrator access is required to change scoring settings.');
    await setDoc(doc(db, 'config', 'scoring'), config, { merge: true });
    setScoringConfig(config);
  };

  const purgeAllMockData = async () => {
    if (!isAdmin) throw new Error('Administrator access is required to purge mock data.');
    setLoading(true);
    try {
      const targets = [
        {
          collectionName: 'opportunities',
          matches: (id: string, data: Record<string, any>) => id.startsWith('opp-') ||
            ['VLSI Digital Design', 'Firmware Engineering', 'Hands-on 6-Layer High-Speed', 'India Silicon Hackathon']
              .some((title) => data.title?.includes(title)),
        },
        {
          collectionName: 'resources',
          matches: (id: string, data: Record<string, any>) => id.startsWith('res-') ||
            data.url?.includes('dQw4w9WgXcQ') ||
            ['NPTEL: CMOS VLSI', 'Falstad Circuit', 'FastBit'].some((title) => data.title?.includes(title)),
        },
        {
          collectionName: 'companies',
          matches: (id: string, data: Record<string, any>) => id.startsWith('comp-') ||
            ['texas-instruments', 'qualcomm-india', 'stmicroelectronics', 'intel-semiconductor', 'cadence-design-systems', 'bharat-electronics-limited--bel-'].includes(id) ||
            ['Texas Instruments', 'Qualcomm India', 'STMicroelectronics', 'Intel Semiconductor'].includes(data.name),
        },
        {
          collectionName: 'learning_paths',
          matches: (id: string, data: Record<string, any>) => id.startsWith('path-') ||
            ['Embedded Systems: Beginner', 'VLSI Digital Design & ASIC'].some((title) => data.title?.includes(title)),
        },
      ] as const;

      const snapshots = await Promise.all(targets.map(({ collectionName }) => getDocs(collection(db, collectionName))));
      const deletions = snapshots.flatMap((snapshot, index) => snapshot.docs
        .filter((document) => targets[index].matches(document.id, document.data()))
        .map((document) => document.ref));
      for (let index = 0; index < deletions.length; index += 450) {
        const batch = writeBatch(db);
        deletions.slice(index, index + 450).forEach((reference) => batch.delete(reference));
        await batch.commit();
      }

      const hasTitle = (title: string | undefined, text: string) => Boolean(title?.includes(text));
      setOpportunities((items) => items.filter((item) =>
        !item.id.startsWith('opp-') &&
        !['VLSI Digital Design', 'Firmware Engineering', 'Hands-on 6-Layer High-Speed', 'India Silicon Hackathon']
          .some((title) => hasTitle(item.title, title))
      ));
      setResources((items) => items.filter((item) =>
        !item.id.startsWith('res-') &&
        !item.url.includes('dQw4w9WgXcQ') &&
        !['NPTEL: CMOS VLSI', 'Falstad Circuit', 'FastBit'].some((title) => hasTitle(item.title, title))
      ));
      setCompanies((items) => items.filter((item) =>
        !item.id.startsWith('comp-') &&
        !['texas-instruments', 'qualcomm-india', 'stmicroelectronics', 'intel-semiconductor', 'cadence-design-systems', 'bharat-electronics-limited--bel-'].includes(item.id) &&
        !['Texas Instruments', 'Qualcomm India', 'STMicroelectronics', 'Intel Semiconductor'].includes(item.name)
      ));
      setLearningPaths((items) => items.filter((item) =>
        !item.id.startsWith('path-') &&
        !['Embedded Systems: Beginner', 'VLSI Digital Design & ASIC'].some((title) => hasTitle(item.title, title))
      ));
    } finally {
      setLoading(false);
    }
  };

  const reseedDatabase = async () => {
    await purgeAllMockData();
  };

  return (
    <DataContext.Provider
      value={{
        skills,
        companies,
        opportunities,
        projects,
        resources,
        learningPaths,
        applications,
        savedItemIds,
        studentSkills,
        badges,
        orders,
        scoringConfig,
        loading,
        toggleSaveItem,
        recordApplyClick,
        confirmApplied,
        updateApplicationStatus,
        completeResource,
        toggleBookmarkResource,
        suggestResource,
        reportResource,
        saveOpportunity,
        deleteOpportunity,
        saveProject,
        deleteProject,
        saveResource,
        deleteResource,
        saveLearningPath,
        deleteLearningPath,
        saveCompany,
        saveSkill,
        updateScoringConfig,
        reseedDatabase,
        purgeAllMockData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
