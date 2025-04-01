import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
// import { UserRole } from "@/types";
import {  MapIcon, ScrollText, Shield, Swords } from "lucide-react";
// import { BookOpen, MapIcon, ScrollText, Shield, Swords } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Welcome to the Quest Tracker
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Join adventures, complete quests, and track your journey in this
                fantasy world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button asChild>
                  <Link href="/quests">
                    <ScrollText className="mr-2 h-4 w-4" />
                    Browse Quests
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/register">
                    <Swords className="mr-2 h-4 w-4" />
                    Begin Your Journey
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/50 rounded-lg">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Swords className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Adventurers</h3>
                <p className="text-muted-foreground">
                  Join quests, form parties, and embark on epic adventures.
                  Track your progress and achievements.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Guild Commanders</h3>
                <p className="text-muted-foreground">
                  Create and manage quests, monitor adventurer progress, and
                  ensure successful mission completion.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <MapIcon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Quests</h3>
                <p className="text-muted-foreground">
                  From simple tasks to epic journeys, track each stage of your
                  quest from initiation to completion.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                Getting Started
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold">For Adventurers</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        1
                      </div>
                      <span>Register an adventurer account</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        2
                      </div>
                      <span>Browse available quests</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        3
                      </div>
                      <span>Join quests and start your adventure</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold">For Guild Commanders</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        1
                      </div>
                      <span>Register a guild commander account</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        2
                      </div>
                      <span>Create quests for adventurers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        3
                      </div>
                      <span>Manage quest progress and completion</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
