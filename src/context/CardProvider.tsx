import { useState, type ReactNode } from "react";
import { CardContext } from "./CardContext";
import type { CardContextType, UploadedImage } from "./CardContext";
import type { CardFormData } from "../utils/validation";

export const CardProvider = ({ children }: { children: ReactNode }) => {
  const [savedCard, setSavedCard] = useState<CardFormData | null>(null);
  const [savedTags, setSavedTags] = useState<string[]>([]);
  const [savedImages, setSavedImages] = useState<UploadedImage[]>([]);

  const value: CardContextType = {
    savedCard,
    setSavedCard,
    savedTags,
    setSavedTags,
    savedImages,
    setSavedImages,
  };

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
};

export default CardProvider;
