import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from "react-native";
import { useAppContext } from "@/src/context/AppContext";

type PasswordInputProps = Omit<TextInputProps, "secureTextEntry"> & {
  value: string;
  onChangeText: (value: string) => void;
  style?: StyleProp<TextStyle>;
};

const PasswordInput = ({ value, onChangeText, style, ...rest }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);
  const { colors } = useAppContext();

  return (
    <View style={styles.wrap}>
      <TextInput
        {...rest}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        style={[
          styles.input,
          { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border },
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable
        style={styles.toggle}
        onPress={() => setVisible((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={visible ? "Hide password" : "Show password"}
        hitSlop={8}
      >
        <Ionicons
          name={visible ? "eye-off-outline" : "eye-outline"}
          size={22}
          color={colors.textSecondary}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    marginBottom: 16,
  },
  input: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 48,
    fontSize: 16,
    borderWidth: 1,
  },
  toggle: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 36,
  },
});

export default PasswordInput;
