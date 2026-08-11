import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { allLocalModules, getLocalScenes } from '../data';
import type { Module, Scene } from '../types';

import hiModules from '../data/locales/hi/modules.json';
import hiScenes from '../data/locales/hi/scenes.json';

export const useGameData = () => {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const modules = useMemo(() => {
    if (isHindi && hiModules && Array.isArray(hiModules) && hiModules.length > 0) {
      return hiModules as Module[];
    }
    return allLocalModules;
  }, [isHindi]);

  const getScenes = (moduleId: string): Scene[] => {
    if (isHindi && hiScenes && (hiScenes as any)[moduleId]) {
      return (hiScenes as any)[moduleId] as Scene[];
    }
    return getLocalScenes(moduleId);
  };

  return {
    modules,
    getScenes,
  };
};
