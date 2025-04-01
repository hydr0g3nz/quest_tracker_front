'use client';

import { MainLayout } from "@/components/layout/main-layout";
import { QuestCard } from "@/components/quests/quest-card";
import { QuestFilter } from "@/components/quests/quest-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { crewSwitchboardAPI, questViewingAPI } from "@/services/api";
import { BoardCheckingFilter, Quest, QuestStatus, UserRole } from "@/types";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MyQuestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BoardCheckingFilter>({});
  const [activeTab, setActiveTab] = useState<string>("active");

  const isGuildCommander = user?.role === UserRole.GuildCommander;

  useEffect(() => {
    fetchQuests(getFilterForTab(activeTab));
  }, [activeTab]);

  const getFilterForTab = (tab: string): BoardCheckingFilter => {
    let statusFilter: QuestStatus | undefined;

    if (tab === "active") {
      statusFilter = QuestStatus.Open;
    } else if (tab === "in-journey") {
      statusFilter = QuestStatus.InJourney;
    } else if (tab === "completed") {
      statusFilter = QuestStatus.Completed;
    } else if (tab === "failed") {
      statusFilter = QuestStatus.Failed;
    }

    return {
      ...filter,
      status: statusFilter,
    };
  };

  const fetchQuests = async (currentFilter: BoardCheckingFilter) => {
    try {
      setLoading(true);
      // In a real app, we would have an API endpoint to fetch quests for the logged-in user
      // For now, we'll just fetch all quests with the filter
      const data = await questViewingAPI.boardChecking(currentFilter);
      setQuests(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quests. Please try again later.",
        variant: "destructive",
      });
      console.error("Error fetching quests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: BoardCheckingFilter) => {
    // Preserve the status from the active tab
    const combinedFilter = {
      ...newFilter,
      status: getFilterForTab(activeTab).status,
    };
    setFilter(newFilter);
    fetchQuests(combinedFilter);
  };

  const handleJoinQuest = async (questId: number) => {
    try {
      await crewSwitchboardAPI.joinQuest(questId);
      toast({
        title: "Success",
        description: "You have joined the quest!",
      });
      fetchQuests(getFilterForTab(activeTab));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join quest. Please try again.",
        variant: "destructive",
      });
      console.error("Error joining quest:", error);
    }
  };

  const handleLeaveQuest = async (questId: number) => {
    try {
      await crewSwitchboardAPI.leaveQuest(questId);
      toast({
        title: "Success",
        description: "You have left the quest.",
      });
      fetchQuests(getFilterForTab(activeTab));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave quest. Please try again.",
        variant: "destructive",
      });
      console.error("Error leaving quest:", error);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Quests</h1>
            <p className="text-muted-foreground">
              {isGuildCommander
                ? "Manage your quests and track progress"
                : "View quests you've joined and their status"}
            </p>
          </div>
          {isGuildCommander && (
            <Button asChild>
              <Link href="/quests/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Quest
              </Link>
            </Button>
          )}
        </div>

        <Tabs
          defaultValue="active"
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full md:w-[600px]">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="in-journey">In Journey</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <QuestFilter
              onFilterChange={handleFilterChange}
              initialFilter={filter}
            />
          </div>

          <TabsContent value="active" className="mt-6">
            {renderQuestsList("Open")}
          </TabsContent>

          <TabsContent value="in-journey" className="mt-6">
            {renderQuestsList("InJourney")}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {renderQuestsList("Completed")}
          </TabsContent>

          <TabsContent value="failed" className="mt-6">
            {renderQuestsList("Failed")}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );

  function renderQuestsList(status: string) {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    const filteredQuests = quests.filter((quest) => quest.status === status);

    if (filteredQuests.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium">No {status.toLowerCase()} quests found</h3>
          <p className="text-muted-foreground mt-2">
            {status === "Open"
              ? "Join some quests or check back later for new opportunities"
              : status === "InJourney"
              ? "No quests are currently in progress"
              : status === "Completed"
              ? "You haven't completed any quests yet"
              : "No failed quests to display"}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onJoin={handleJoinQuest}
            onLeave={handleLeaveQuest}
          />
        ))}
      </div>
    );
  }
}
