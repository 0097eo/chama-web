import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import Link from "next/link";
import { Chama } from "@/types/api";

interface ChamaCardProps {
  chama: Chama;
}

export function ChamaCard({ chama }: ChamaCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{chama.name}</CardTitle>
        <CardDescription>{chama.description || "No description provided."}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          <span>{chama.totalMembers ?? 0} Members</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/chamas/${chama.id}`}>Manage Chama</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}