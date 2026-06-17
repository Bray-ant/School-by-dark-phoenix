"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { chapters, type Chapter } from "@/data/courseData";

interface AppContextType {
  chapterList: Chapter[];
  setChapterList: React.Dispatch<React.SetStateAction<Chapter[]>>;
  commandOpen: boolean;
  setCommandOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType>({
  chapterList: chapters,
  setChapterList: () => {},
  commandOpen: false,
  setCommandOpen: () => {},
});

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [chapterList, setChapterList] = useState<Chapter[]>(chapters);
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <AppContext.Provider
      value={{ chapterList, setChapterList, commandOpen, setCommandOpen }}
    >
      {children}
    </AppContext.Provider>
  );
}
