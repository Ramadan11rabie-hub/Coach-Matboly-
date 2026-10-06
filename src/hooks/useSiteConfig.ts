import { useState, useEffect, useRef, useCallback } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SiteConfig } from '../types/fitness';
import { DEFAULT_SITE_CONFIG } from '../data/initialData';
import { normalizePlan } from '../lib/planPricing';

const COLLECTION_NAME = 'site_config';
const DOC_ID = 'main';
const LOCAL_CACHE_KEY = 'coach_matboly_fitness_config_v3';

// Helper to recursively remove undefined values which are rejected by Firestore
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item));
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return obj;
}

// Deep merge helper that strictly preserves saved Firestore values
function mergeWithDefaults(data: any): SiteConfig {
  if (!data || typeof data !== 'object') {
    return DEFAULT_SITE_CONFIG;
  }

  const merged: SiteConfig = {
    ...DEFAULT_SITE_CONFIG,
    ...data,
    hero: {
      ...DEFAULT_SITE_CONFIG.hero,
      ...(data.hero || {}),
      overlayDarkness:
        data.hero?.overlayDarkness !== undefined && data.hero?.overlayDarkness !== null
          ? Number(data.hero.overlayDarkness)
          : (DEFAULT_SITE_CONFIG.hero.overlayDarkness ?? 0),
    },
    about: {
      ...DEFAULT_SITE_CONFIG.about,
      ...(data.about || {}),
      primaryPhoto:
        data.about?.primaryPhoto !== undefined
          ? data.about.primaryPhoto
          : (data.about?.primaryImage || DEFAULT_SITE_CONFIG.about.primaryPhoto),
      primaryImage:
        data.about?.primaryPhoto !== undefined
          ? data.about.primaryPhoto
          : (data.about?.primaryImage || DEFAULT_SITE_CONFIG.about.primaryPhoto),
      secondaryPhoto:
        data.about?.secondaryPhoto !== undefined
          ? data.about.secondaryPhoto
          : (data.about?.secondaryImage || DEFAULT_SITE_CONFIG.about.secondaryPhoto),
      secondaryImage:
        data.about?.secondaryPhoto !== undefined
          ? data.about.secondaryPhoto
          : (data.about?.secondaryImage || DEFAULT_SITE_CONFIG.about.secondaryPhoto),
      paragraphs: Array.isArray(data.about?.paragraphs) && data.about.paragraphs.length > 0
        ? data.about.paragraphs
        : (data.about?.bioParagraph1 || data.about?.bioParagraph2)
        ? [data.about.bioParagraph1, data.about.bioParagraph2].filter(Boolean)
        : DEFAULT_SITE_CONFIG.about.paragraphs,
      credentials: Array.isArray(data.about?.credentials)
        ? data.about.credentials
        : DEFAULT_SITE_CONFIG.about.credentials,
      stats: Array.isArray(data.about?.stats)
        ? data.about.stats
        : DEFAULT_SITE_CONFIG.about.stats,
    },
    subscription: {
      ...DEFAULT_SITE_CONFIG.subscription,
      ...(data.subscription || {}),
      reels: Array.isArray(data.subscription?.reels)
        ? data.subscription.reels
        : DEFAULT_SITE_CONFIG.subscription.reels,
    },
    calculator: {
      ...DEFAULT_SITE_CONFIG.calculator,
      ...(data.calculator || {}),
    },
    plans: {
      ...DEFAULT_SITE_CONFIG.plans,
      ...(data.plans || {}),
      plans: Array.isArray(data.plans?.plans) && data.plans.plans.length > 0
        ? data.plans.plans.map((p: any) => normalizePlan({
            ...p,
            imageUrl: p.imageUrl || p.image || '',
            image: p.imageUrl || p.image || '',
          }))
        : DEFAULT_SITE_CONFIG.plans.plans.map(normalizePlan),
    },
    paymentInfo: data.paymentInfo || undefined,
    transformations: {
      ...DEFAULT_SITE_CONFIG.transformations,
      ...(data.transformations || {}),
      items: Array.isArray(data.transformations?.items)
        ? data.transformations.items
        : data.transformations !== undefined
        ? []
        : DEFAULT_SITE_CONFIG.transformations.items,
    },
    choices: {
      ...DEFAULT_SITE_CONFIG.choices,
      ...(data.choices || {}),
      features: Array.isArray(data.choices?.features)
        ? data.choices.features
        : DEFAULT_SITE_CONFIG.choices.features,
    },
    contact: {
      ...DEFAULT_SITE_CONFIG.contact,
      ...(data.contact || {}),
      socials: { ...DEFAULT_SITE_CONFIG.contact.socials, ...(data.contact?.socials || {}) },
    },
    footer: {
      ...DEFAULT_SITE_CONFIG.footer,
      ...(data.footer || {}),
    },
  };

  return merged;
}

export function useSiteConfig() {
  // Load initial fallback from local cache if available
  const [config, setConfig] = useState<SiteConfig>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) {
        return mergeWithDefaults(JSON.parse(cached));
      }
    } catch {
      // ignore
    }
    return DEFAULT_SITE_CONFIG;
  });

  const latestConfigRef = useRef<SiteConfig>(config);
  latestConfigRef.current = config;

  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [hasSavedNotice, setHasSavedNotice] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Save to Central Firestore Database
  const persistToFirestore = useCallback(async (newConfig: SiteConfig): Promise<{ success: boolean; error?: string }> => {
    setSyncStatus('saving');
    setSyncError(null);
    isSavingRef.current = true;
    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);
      const sanitized = sanitizeForFirestore({
        ...newConfig,
        _lastUpdated: new Date().toISOString(),
        _timestamp: Date.now(),
      });

      // Guard against Firestore 1MB document limit
      const jsonStr = JSON.stringify(sanitized);
      const sizeInBytes = new Blob([jsonStr]).size;
      if (sizeInBytes > 950000) {
        throw new Error(`حجم البيانات (${Math.round(sizeInBytes / 1024)} KB) كبير جداً ويتجاوز الحد المسموح به في قاعدة البيانات (1MB). يرجى تقليل حجم الصور المرفوعة.`);
      }

      await setDoc(docRef, sanitized);
      
      // Update local cache
      try {
        localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(newConfig));
      } catch {
        // ignore
      }

      latestConfigRef.current = newConfig;
      setSyncStatus('synced');
      setSyncError(null);
      setHasSavedNotice(true);
      setTimeout(() => setHasSavedNotice(false), 2500);
      return { success: true };
    } catch (err: any) {
      console.error('CRITICAL: Error saving site config to Firestore database:', err);
      setSyncStatus('error');
      setSyncError(err?.message || 'فشل الحفظ في قاعدة البيانات');
      return { success: false, error: err?.message || 'Database save failed' };
    } finally {
      isSavingRef.current = false;
    }
  }, []);

  // Queue debounced save
  const triggerDebouncedSave = useCallback((newConfig: SiteConfig) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSyncStatus('saving');
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      persistToFirestore(newConfig);
    }, 350);
  }, [persistToFirestore]);

  // Flush any pending debounced save immediately
  const flushPendingSave = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      return await persistToFirestore(latestConfigRef.current);
    }
    return { success: true };
  }, [persistToFirestore]);

  // Ensure pending saves are flushed if window is closed or reloaded
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        persistToFirestore(latestConfigRef.current);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [persistToFirestore]);

  // Real-time listener: Single Source of Truth in Firestore
  useEffect(() => {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data();
          const mergedConfig = mergeWithDefaults(remoteData);
          
          // Apply remote server data when no local save is actively in flight
          if (!isSavingRef.current || !docSnap.metadata.hasPendingWrites) {
            latestConfigRef.current = mergedConfig;
            setConfig(mergedConfig);
            try {
              localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(mergedConfig));
            } catch {
              // ignore
            }
          }
          setSyncStatus('synced');
          setLoading(false);
        } else {
          // Document does not exist in Firestore yet: NEVER overwrite cloud DB with defaults from listener!
          setLoading(false);
        }
      },
      (error) => {
        console.error('Firestore site_config real-time listener error:', error);
        setSyncStatus('error');
        setSyncError(error?.message || 'فشل الاتصال بقاعدة البيانات');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      // On unmount, flush any pending save rather than dropping it
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        persistToFirestore(latestConfigRef.current);
      }
    };
  }, [persistToFirestore]);

  const updateConfig = useCallback((updater: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig), immediate = false) => {
    const prev = latestConfigRef.current;
    const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
    latestConfigRef.current = next;
    setConfig(next);
    
    try {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }

    if (immediate) {
      persistToFirestore(next);
    } else {
      triggerDebouncedSave(next);
    }
  }, [persistToFirestore, triggerDebouncedSave]);

  const updateHero = useCallback((heroUpdates: Partial<SiteConfig['hero']>) => {
    updateConfig((prev) => ({ ...prev, hero: { ...prev.hero, ...heroUpdates } }));
  }, [updateConfig]);

  const updateAbout = useCallback((aboutUpdates: Partial<SiteConfig['about']>, immediate = false) => {
    const normalized = { ...aboutUpdates };
    if (normalized.primaryPhoto !== undefined && normalized.primaryImage === undefined) {
      normalized.primaryImage = normalized.primaryPhoto;
    }
    if (normalized.primaryImage !== undefined && normalized.primaryPhoto === undefined) {
      normalized.primaryPhoto = normalized.primaryImage;
    }
    if (normalized.secondaryPhoto !== undefined && normalized.secondaryImage === undefined) {
      normalized.secondaryImage = normalized.secondaryPhoto;
    }
    if (normalized.secondaryImage !== undefined && normalized.secondaryPhoto === undefined) {
      normalized.secondaryPhoto = normalized.secondaryImage;
    }
    updateConfig((prev) => ({ ...prev, about: { ...prev.about, ...normalized } }), immediate);
  }, [updateConfig]);

  const updateSubscription = useCallback((subUpdates: Partial<SiteConfig['subscription']>) => {
    updateConfig((prev) => ({ ...prev, subscription: { ...(prev.subscription || DEFAULT_SITE_CONFIG.subscription), ...subUpdates } }));
  }, [updateConfig]);

  const updateCalculator = useCallback((calcUpdates: Partial<NonNullable<SiteConfig['calculator']>>) => {
    updateConfig((prev) => ({ ...prev, calculator: { ...(prev.calculator || DEFAULT_SITE_CONFIG.calculator), ...calcUpdates } }));
  }, [updateConfig]);

  const updatePlans = useCallback((plansUpdates: Partial<SiteConfig['plans']>) => {
    updateConfig((prev) => ({ ...prev, plans: { ...prev.plans, ...plansUpdates } }));
  }, [updateConfig]);

  const updateTransformations = useCallback((transformationsUpdates: Partial<SiteConfig['transformations']>, immediate = false) => {
    updateConfig((prev) => ({ ...prev, transformations: { ...prev.transformations, ...transformationsUpdates } }), immediate);
  }, [updateConfig]);

  const deleteTransformation = useCallback(async (targetIdOrIndex: string | number): Promise<{ success: boolean; error?: string }> => {
    const currentConfig = latestConfigRef.current;
    const currentItems = currentConfig.transformations?.items || [];

    const nextItems = typeof targetIdOrIndex === 'number'
      ? currentItems.filter((_, i) => i !== targetIdOrIndex)
      : currentItems.filter((item, i) => item.id !== targetIdOrIndex && `trans-item-${i}` !== targetIdOrIndex && `trans-${i}` !== targetIdOrIndex);

    const nextConfig: SiteConfig = {
      ...currentConfig,
      transformations: {
        ...currentConfig.transformations,
        items: nextItems,
      },
    };

    latestConfigRef.current = nextConfig;
    setConfig(nextConfig);

    try {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(nextConfig));
    } catch {
      // ignore
    }

    return await persistToFirestore(nextConfig);
  }, [persistToFirestore]);

  const updateChoices = useCallback((choicesUpdates: Partial<SiteConfig['choices']>) => {
    updateConfig((prev) => ({ ...prev, choices: { ...prev.choices, ...choicesUpdates } }));
  }, [updateConfig]);

  const updateContact = useCallback((contactUpdates: Partial<SiteConfig['contact']>) => {
    updateConfig((prev) => ({ ...prev, contact: { ...prev.contact, ...contactUpdates } }));
  }, [updateConfig]);

  const updateFooter = useCallback((footerUpdates: Partial<SiteConfig['footer']>) => {
    updateConfig((prev) => ({ ...prev, footer: { ...prev.footer, ...footerUpdates } }));
  }, [updateConfig]);

  const updatePaymentInfo = useCallback((paymentUpdates: Partial<NonNullable<SiteConfig['paymentInfo']>>, immediate = false) => {
    updateConfig((prev) => ({
      ...prev,
      paymentInfo: {
        ...(prev.paymentInfo || {}),
        ...paymentUpdates,
      },
    }), immediate);
  }, [updateConfig]);

  const saveAllChangesImmediately = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    return await persistToFirestore(latestConfigRef.current);
  }, [persistToFirestore]);

  const resetToDefaults = useCallback(async () => {
    setConfig(DEFAULT_SITE_CONFIG);
    await persistToFirestore(DEFAULT_SITE_CONFIG);
  }, [persistToFirestore]);

  const exportConfigJSON = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'coach_matboly_fitness_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [config]);

  const importConfigJSON = useCallback(async (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const merged = mergeWithDefaults(parsed);
      setConfig(merged);
      await persistToFirestore(merged);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Invalid JSON file format' };
    }
  }, [persistToFirestore]);

  return {
    config,
    loading,
    syncStatus,
    syncError,
    updateConfig,
    updateHero,
    updateAbout,
    updateSubscription,
    updateCalculator,
    updatePlans,
    updateTransformations,
    deleteTransformation,
    updateChoices,
    updateContact,
    updateFooter,
    updatePaymentInfo,
    saveAllChangesImmediately,
    flushPendingSave,
    resetToDefaults,
    exportConfigJSON,
    importConfigJSON,
    hasSavedNotice,
  };
}
