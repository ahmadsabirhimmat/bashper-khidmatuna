import { forwardRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { useAppContext } from "@/src/context/AppContext";

interface SearchBarProps extends Omit<TextInputProps, "style"> {
  onClear?: () => void;
  style?: StyleProp<ViewStyle>;
}

const SearchBar = forwardRef<TextInput, SearchBarProps>(({ onClear, style, ...rest }, ref) => {
  const { colors } = useAppContext();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.icon} />
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text }]}
        autoCorrect={false}
        {...rest}
      />
      {rest.value ? (
        <Pressable style={styles.clearBtn} onPress={onClear}>
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
});

SearchBar.displayName = "SearchBar";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  clearBtn: {
    padding: 6,
  },
});

export default SearchBar;
