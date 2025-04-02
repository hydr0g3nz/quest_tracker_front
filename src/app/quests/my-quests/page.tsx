'use client';

import { MainLayout } from "@/components/layout/main-layout";
import { QuestCard } from "@/components/quests/quest-card";
import { QuestFilter } from "@/components/quests/quest-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { crewSwitchboardAPI, questViewingAPI } from "@/services/api";
import { BoardCheckingFilter, Quest, QuestStatus, UserRole } from "@/types";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function MyQuestsPage() {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userQuests, setUserQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userQuestsLoading, setUserQuestsLoading] = useState(true);
  const [filter, setFilter] = useState<BoardCheckingFilter>({});
  const [activeTab, setActiveTab] = useState<string>("active");

  const isGuildCommander = user?.role === UserRole.GuildCommander;

  useEffect(() => {
    if (user) {
      if (isGuildCommander) {
        // For guild commanders, get quests they created
        fetchQuests(getFilterForTab(activeTab));
      } else {
        // For adventurers, fetch all quests first to apply filters
        fetchQuests(getFilterForTab(activeTab));
        // Then fetch quests the user has joined
        fetchUserQuests();
      }
    }
  }, [activeTab, user]);

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
      const data = await questViewingAPI.boardChecking(currentFilter);
      
      // If a guild commander, set all quests
      if (isGuildCommander) {
        const guildCommanderQuests = data.filter(
          (quest) => quest.guild_commander_id === user?.id
        );
        setQuests(guildCommanderQuests);
      } else {
        setQuests(data);
      }
    } catch (error) {
      toast.error("Failed to load quests. Please try again later.");
      console.error("Error fetching quests:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's joined quests by checking adventurers in each quest
  const fetchUserQuests = async () => {
    if (!user || user.role !== UserRole.Adventurer) return;
    
    try {
      setUserQuestsLoading(true);
      
      const userJoinedQuests: Quest[] = [];
      
      // Get all quests first
      const allQuests = await questViewingAPI.boardChecking({});
      
      // Check each quest to see if user is an adventurer
      for (const quest of allQuests) {
        try {
          const adventurers = await questViewingAPI.questAdventurers(quest.id);
          if (adventurers.some(adv => adv.id === user.id)) {
            userJoinedQuests.push(quest);
          }
        } catch (error) {
          console.error(`Error checking adventurers for quest ${quest.id}:`, error);
        }
      }
      
      setUserQuests(userJoinedQuests);
    } catch (error) {
      toast.error("Failed to load your quests. Please try again later.");
      console.error("Error fetching user quests:", error);
    } finally {
      setUserQuestsLoading(false);
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
      toast.success("You have joined the quest!");
      fetchQuests(getFilterForTab(activeTab));
      fetchUserQuests();
    } catch (error) {
      toast.error("Failed to join quest. Please try again.");
      console.error("Error joining quest:", error);
    }
  };

  const handleLeaveQuest = async (questId: number) => {
    try {
      await crewSwitchboardAPI.leaveQuest(questId);
      toast.success("You have left the quest.");
      fetchQuests(getFilterForTab(activeTab));
      fetchUserQuests();
    } catch (error) {
      toast.error("Failed to leave quest. Please try again.");
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
    // Determine which quests to display based on user role
    const questsToDisplay = isGuildCommander 
      ? quests.filter(q => q.status === status)  // Guild commanders see quests they created
      : userQuests.filter(q => q.status === status);  // Adventurers see quests they joined
    
    const isLoading = isGuildCommander ? loading : userQuestsLoading;

    if (isLoading) {
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

    if (questsToDisplay.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium">No {status.toLowerCase()} quests found</h3>
          <p className="text-muted-foreground mt-2">
            {status === "Open"
              ? isGuildCommander
                ? "Create some quests or check back later"
                : "Join some quests or check back later for new opportunities"
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
        {questsToDisplay.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onJoin={handleJoinQuest}
            onLeave={handleLeaveQuest}
            isUserQuest={true} // Since these are user's quests, mark them as such
          />
        ))}
      </div>
    );
  }
}