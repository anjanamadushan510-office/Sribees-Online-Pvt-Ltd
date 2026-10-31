import React from "react";
import { Header } from "@/components/Header";
import { useTranslations } from "next-intl";

interface CategoryHeroHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTab: string;
  onTabChange: (tab: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  totalCategories: number;
}

export const CategoryHeroHeader: React.FC<CategoryHeroHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedTab,
  onTabChange,
  viewMode,
  onViewModeChange,
  totalCategories,
}) => {
  const t = useTranslations("categories");

  const tabs = [
    { id: "all", label: t("tabs.all") },
    { id: "fresh", label: t("tabs.fresh") },
    { id: "pantry", label: t("tabs.pantry") },
    { id: "lifestyle", label: t("tabs.lifestyle") },
  ];

  return (
    <div className="mb-8 space-y-6">
      {/* Header Title & Slogan */}
      <Header
        badge={t("badge")}
        title={t("title")}
        description={t("description")}
      />
    </div>
  );
};
