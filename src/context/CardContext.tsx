// src/context/CardContext.ts
import { createContext } from 'react';
import type { CardFormData } from '../utils/validation';

export interface UploadedImage {
  id: string;
  name: string;
  url: string;
}

export interface CardContextType {
  savedCard: CardFormData | null;
  setSavedCard: (card: CardFormData | null) => void;
  savedTags: string[];
  setSavedTags: (tags: string[]) => void;
  savedImages: UploadedImage[];
  setSavedImages: (images: UploadedImage[]) => void;
}

export const CardContext = createContext<CardContextType | undefined>(undefined);