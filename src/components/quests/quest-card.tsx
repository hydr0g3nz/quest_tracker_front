import { useAuth } from "@/contexts/auth-context";
import { Quest, QuestStatus, UserRole } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { questViewingAPI } from "@/services/api";
import { format } from "date-fns";
import { ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface QuestCardProps {
  quest: Quest;
  onJoin?: (questId: number) => void;
  onLeave?: (questId: number) => void;
  isUserQuest?: boolean;
}

export function QuestCard({ quest, onJoin, onLeave, isUserQuest = false }: QuestCardProps) {
  const { user } = useAuth();
  const [isUserInQuest, setIsUserInQuest] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);

  const isGuildCommander = user?.role === UserRole.GuildCommander;
  const isAdventurer = user?.role === UserRole.Adventurer;

  // Check if current user is an adventurer in this quest
  useEffect(() => {
    if (user && isAdventurer && !isUserQuest) {
      checkIfUserInQuest();
    } else if (isUserQuest) {
      // If we're in "My Quests" view, we know the user is already in this quest
      setIsUserInQuest(true);
    }
  }, [quest.id, user, isUserQuest]);

  const checkIfUserInQuest = async () => {
    if (!user) return;
    
    try {
      setCheckingStatus(true);
      const adventurers = await questViewingAPI.questAdventurers(quest.id);
      setIsUserInQuest(adventurers.some(adv => adv.id === user.id));
    } catch (error) {
      console.error(`Error checking adventurers for quest ${quest.id}:`, error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const statusColors: Record<QuestStatus, string> = {
    [QuestStatus.Open]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    [QuestStatus.InJourney]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    [QuestStatus.Completed]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    [QuestStatus.Failed]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

  const canJoin = isAdventurer && 
                 (quest.status === QuestStatus.Open || quest.status === QuestStatus.Failed) && 
                 quest.adventurers_count < 4 &&
                 !isUserInQuest &&
                 !checkingStatus;

  const canLeave = isAdventurer && 
                  (quest.status === QuestStatus.Open || quest.status === QuestStatus.Failed) &&
                  isUserInQuest;

  const handleJoin = () => {
    if (onJoin) {
      onJoin(quest.id);
    }
  };

  const handleLeave = () => {
    if (onLeave) {
      onLeave(quest.id);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{quest.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Created {format(new Date(quest.created_at), "MMM d, yyyy")}
            </CardDescription>
          </div>
          <Badge className={statusColors[quest.status as QuestStatus]}>
            {quest.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{quest.description || "No description provided."}</p>
        <div className="flex items-center justify-between text-muted-foreground mt-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span className="text-xs">
              {quest.adventurers_count}/4 Adventurers
            </span>
          </div>
          {isUserInQuest && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              Joined
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        <div className="flex space-x-2">
          {canJoin && (
            <Button size="sm" onClick={handleJoin}>
              Join Quest
            </Button>
          )}
          {canLeave && (
            <Button size="sm" variant="outline" onClick={handleLeave}>
              Leave Quest
            </Button>
          )}
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/quests/${quest.id}`}>
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}