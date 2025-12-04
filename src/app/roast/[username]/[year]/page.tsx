import { RoastGenerator } from "@/components/roast-generator";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    username: string;
    year: string;
  }>;
}

export default async function RoastPage({ params }: PageProps) {
  const { username, year } = await params;
  
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();

  if (isNaN(yearNum) || yearNum < 2008 || yearNum > currentYear) {
    notFound();
  }

  return <RoastGenerator username={username} year={yearNum} />;
}
