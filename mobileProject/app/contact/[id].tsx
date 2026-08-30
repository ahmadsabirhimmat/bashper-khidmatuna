import { useLocalSearchParams } from "expo-router";
import ContactScreen from "@/src/screens/ContactScreen";

export default function ContactRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) {
    return null;
  }
  return <ContactScreen contactId={id} />;
}
