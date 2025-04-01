'use client';

import { MainLayout } from "@/components/layout/main-layout";
import { QuestCard } from "@/components/quests/quest-card";
import { QuestFilter } from "@/components/quests/quest-filter";
import { crewSwitchboardAPI, questViewingAPI } from "@/services/api";
import { BoardCheckingFilter, Quest } from "@/types";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BoardCheckingFilter>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchQuests(filter);
  }, []);

  const fetchQuests = async (currentFilter: BoardCheckingFilter) => {
    try {
      setLoading(true);
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
    setFilter(newFilter);
    fetchQuests(newFilter);
  };

  const handleJoinQuest = async (questId: number) => {
    try {
      await crewSwitchboardAPI.joinQuest(questId);
      toast({
        title: "Success",
        description: "You have joined the quest!",
      });
      fetchQuests(filter); // Refresh quests
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
      fetchQuests(filter); // Refresh quests
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
        <div>
          <h1 className="text-3xl font-bold mb-2">Quest Board</h1>
          <p className="text-muted-foreground">
            Browse available quests and join the ones that interest you
          </p>
        </div>

        <QuestFilter
          onFilterChange={handleFilterChange}
          initialFilter={filter}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[200px] w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : quests.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium">No quests found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filter criteria or check back later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onJoin={handleJoinQuest}
                onLeave={handleLeaveQuest}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
