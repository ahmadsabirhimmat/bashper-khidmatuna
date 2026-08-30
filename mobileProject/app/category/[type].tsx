import { useLocalSearchParams } from "expo-router";
import CategoryScreen from "@/src/screens/CategoryScreen";

export default function CategoryRoute() {
  const { type } = useLocalSearchParams<{ type: string }>();
  return <CategoryScreen categoryId={type ?? "police"} />;
}
