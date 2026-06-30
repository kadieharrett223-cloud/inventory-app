import { redirect } from "next/navigation";

type ContainerDetailPageProps = {
  params: Promise<{ containerId: string }>;
};

export default async function ContainerDetailPage({ params }: ContainerDetailPageProps) {
  const { containerId } = await params;

  redirect(`/containers/${containerId}`);
}
