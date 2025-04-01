'use client';

import { MainLayout } from "@/components/layout/main-layout";
import { QuestForm } from "@/components/quests/quest-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { questOpsAPI } from "@/services/api";
import { UserRole } from "@/types";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateQuestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Check if user is authorized (guild commander)
  const isGuildCommander = user?.role === UserRole.GuildCommander;

  const handleSubmit = async (values: { name: string; description?: string; }) => {
    if (!isGuildCommander) {
      toast.error("Only guild commanders can create quests.");
      return;
    }

    try {
      setLoading(true);
      await questOpsAPI.addQuest({...values, guild_commander_id: user.id});
      toast.success("Quest created successfully!");
      router.push("/quests");
    } catch (error) {
      toast.error("Failed to create quest. Please try again.");
      console.error("Error creating quest:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isGuildCommander) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <ShieldAlert className="h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-bold mb-2">Unauthorized</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Only guild commanders can create quests. If you're an adventurer,
            you can browse existing quests to join.
          </p>
          <Button onClick={() => router.push("/quests")}>
            Go to Quest Board
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create New Quest</h1>
        <p className="text-muted-foreground mb-6">
          Fill out the form below to create a new quest for adventurers to join
        </p>

        <QuestForm onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </MainLayout>
  );
}