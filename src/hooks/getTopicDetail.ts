import curriculum from "@/lib/curriculum.json";

export function getTopicDetail(topic: string) {
  const [grade, unit] = topic.split(" > ");
  const data = (curriculum as any)[grade]?.[unit];
  return data || null;
}
