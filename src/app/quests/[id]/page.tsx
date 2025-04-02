'use client';

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { crewSwitchboardAPI, journeyLedgerAPI, questOpsAPI, questViewingAPI } from "@/services/api";
import { AdventurerViewModel, Quest, QuestStatus, UserRole } from "@/types";
import { format } from "date-fns";
import { CalendarDays, Clock, MapPin, Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function QuestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const questId = parseInt(unwrappedParams.id);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [adventurers, setAdventurers] = useState<AdventurerViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [adventurersLoading, setAdventurersLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchQuestDetails();
    fetchQuestAdventurers();
  }, [questId]);

  const fetchQuestDetails = async () => {
    try {
      setLoading(true);
      const data = await questViewingAPI.viewQuestDetails(questId);
      setQuest(data);
    } catch (error) {
      toast.error("Failed to load quest details. Please try again later.");
      console.error("Error fetching quest details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestAdventurers = async () => {
    try {
      setAdventurersLoading(true);
      const data = await questViewingAPI.questAdventurers(questId);
      setAdventurers(data);
    } catch (error) {
      toast.error("Failed to load quest adventurers. Please try again later.");
      console.error("Error fetching quest adventurers:", error);
    } finally {
      setAdventurersLoading(false);
    }
  };

  const handleJoinQuest = async () => {
    try {
      setActionLoading(true);
      await crewSwitchboardAPI.joinQuest(questId);
      toast.success("You have joined the quest!");
      fetchQuestDetails();
      fetchQuestAdventurers();
    } catch (error) {
      toast.error("Failed to join quest. Please try again.");
      console.error("Error joining quest:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveQuest = async () => {
    try {
      setActionLoading(true);
      await crewSwitchboardAPI.leaveQuest(questId);
      toast.success("You have left the quest.");
      fetchQuestDetails();
      fetchQuestAdventurers();
    } catch (error) {
      toast.error("Failed to leave quest. Please try again.");
      console.error("Error leaving quest:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuest = async () => {
    if (!confirm("Are you sure you want to delete this quest?")) return;

    try {
      setActionLoading(true);
      await questOpsAPI.removeQuest(questId);
      toast.success("Quest deleted successfully.");
      router.push("/quests");
    } catch (error) {
      toast.error("Failed to delete quest. Please try again.");
      console.error("Error deleting quest:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartJourney = async () => {
    try {
      setActionLoading(true);
      await journeyLedgerAPI.inJourney(questId);
      toast.success("The journey has begun!");
      fetchQuestDetails();
    } catch (error) {
      toast.error("Failed to start journey. Please try again.");
      console.error("Error starting journey:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteQuest = async () => {
    try {
      setActionLoading(true);
      await journeyLedgerAPI.toCompleted(questId);
      toast.success("Quest completed successfully!");
      fetchQuestDetails();
    } catch (error) {
      toast.error("Failed to complete quest. Please try again.");
      console.error("Error completing quest:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFailQuest = async () => {
    try {
      setActionLoading(true);
      await journeyLedgerAPI.toFailed(questId);
      toast("Quest has been marked as failed.");
      fetchQuestDetails();
    } catch (error) {
      toast.error("Failed to update quest status. Please try again.");
      console.error("Error failing quest:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: QuestStatus) => {
    switch (status) {
      case QuestStatus.Open:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case QuestStatus.InJourney:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case QuestStatus.Completed:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      case QuestStatus.Failed:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const isAdventurer = user?.role === UserRole.Adventurer;
  const isGuildCommander = user?.role === UserRole.GuildCommander;
  
  // Check if current user is already in this quest
  const isUserInQuest = user && isAdventurer && adventurers.some(adv => adv.id === user.id);

  // Determine which actions are available based on user role and quest status
  const canJoin =
    isAdventurer &&
    quest &&
    (quest.status === QuestStatus.Open || quest.status === QuestStatus.Failed) &&
    quest.adventurers_count < 4 && 
    !isUserInQuest;

  const canLeave =
    isAdventurer &&
    quest &&
    (quest.status === QuestStatus.Open || quest.status === QuestStatus.Failed) &&
    isUserInQuest;

  const canDelete =
    isGuildCommander &&
    quest &&
    quest.status === QuestStatus.Open &&
    quest.adventurers_count === 0;

  const canStartJourney =
    isGuildCommander &&
    quest &&
    (quest.status === QuestStatus.Open || quest.status === QuestStatus.Failed) &&
    quest.adventurers_count > 0;

  const canCompleteOrFail =
    isGuildCommander && quest && quest.status === QuestStatus.InJourney;

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <Skeleton className="h-8 w-[100px]" />
          </div>
          <Skeleton className="h-[200px] w-full mt-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!quest) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold mb-2">Quest Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The quest you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/quests")}>
            Return to Quest Board
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">{quest.name}</h1>
            <div className="flex items-center mt-2 text-muted-foreground text-sm">
              <CalendarDays className="h-4 w-4 mr-1" />
              <span>
                Created {format(new Date(quest.created_at), "MMM d, yyyy")}
              </span>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              quest.status as QuestStatus
            )}`}
          >
            {quest.status}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <p className="whitespace-pre-line">
              {quest.description || "No description provided."}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-primary" />
              <div>
                <h3 className="font-medium">Guild Commander</h3>
                <p className="text-sm text-muted-foreground">
                  ID: {quest.guild_commander_id}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <Users className="h-8 w-8 mr-3 text-primary" />
              <div>
                <h3 className="font-medium">Adventurers</h3>
                <p className="text-sm text-muted-foreground">
                  {quest.adventurers_count}/4 Joined
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <Clock className="h-8 w-8 mr-3 text-primary" />
              <div>
                <h3 className="font-medium">Last Updated</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(quest.updated_at), "MMM d, yyyy h:mm a")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Adventurers List */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-medium mb-4">Adventurers Crew</h3>
            {adventurersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : adventurers.length === 0 ? (
              <p className="text-muted-foreground">No adventurers have joined this quest yet.</p>
            ) : (
              <div className="space-y-2">
                {adventurers.map((adventurer) => (
                  <div key={adventurer.id} className="flex items-center p-2 rounded-md bg-secondary/50">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback>{adventurer.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{adventurer.username}</p>
                      <p className="text-xs text-muted-foreground">Adventurer ID: {adventurer.id}</p>
                    </div>
                    {user && user.id === adventurer.id && (
                      <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">You</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 pt-4">
          {canJoin && (
            <Button onClick={handleJoinQuest} disabled={actionLoading}>
              Join Quest
            </Button>
          )}

          {canLeave && (
            <Button
              variant="outline"
              onClick={handleLeaveQuest}
              disabled={actionLoading}
            >
              Leave Quest
            </Button>
          )}

          {canDelete && (
            <Button
              variant="destructive"
              onClick={handleDeleteQuest}
              disabled={actionLoading}
            >
              Delete Quest
            </Button>
          )}

          {canStartJourney && (
            <Button
              onClick={handleStartJourney}
              variant="default"
              disabled={actionLoading}
            >
              Start Journey
            </Button>
          )}

          {canCompleteOrFail && (
            <>
              <Button
                onClick={handleCompleteQuest}
                variant="default"
                disabled={actionLoading}
              >
                Mark as Completed
              </Button>
              <Button
                onClick={handleFailQuest}
                variant="destructive"
                disabled={actionLoading}
              >
                Mark as Failed
              </Button>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}