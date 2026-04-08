import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CustomAlert from "@/components/CustomAlert";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
  }>({
    title: "",
    message: "",
    type: "success",
  });
  const [loginResult, setLoginResult] = useState<{ resetKey?: string } | null>(
    null,
  );
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (compatible && enrolled) {
        setHasBiometrics(true);
        const savedUserId = await SecureStore.getItemAsync("saved_user_id");
        const savedPassword = await SecureStore.getItemAsync("saved_password");
        if (savedUserId && savedPassword) {
          setUserId(savedUserId);
        }
      }
    })();
  }, []);

  const handleBiometricLogin = async () => {
    try {
      const savedUserId = await SecureStore.getItemAsync("saved_user_id");
      const savedPassword = await SecureStore.getItemAsync("saved_password");

      if (!savedUserId || !savedPassword) {
        showAlert(
          "Setup Required",
          "Please login with your Promoter ID and password first to enable biometric login.",
          "error"
        );
        return;
      }

      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock Promolocation",
        fallbackLabel: "Use Password",
      });

      if (authResult.success) {
        setIsLoading(true);
        const result = await login({ promoter_id: savedUserId, password: savedPassword });
        setLoginResult(result);
        showAlert("Success", "Login successful!", "success");
      }
    } catch (error: any) {
      console.error("Biometric auth failed", error);
      setIsLoading(false);
    }
  };

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error",
  ) => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
    if (alertConfig.type === "success") {
      if (loginResult?.resetKey === "Yes") {
        router.replace("/(drawer)/change-password?ref=reset" as any);
      } else {
        router.replace("/(drawer)/map" as any);
      }
    }
  };

  const handleLogin = async () => {
    if (!userId || !password) {
      showAlert(
        "Error",
        "Please enter both Promoter ID and password.",
        "error",
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ promoter_id: userId, password });

      // Save credentials for future biometric unlocks
      await SecureStore.setItemAsync("saved_user_id", userId);
      await SecureStore.setItemAsync("saved_password", password);

      setLoginResult(result);
      showAlert("Success", "Login successful!", "success");
    } catch (error: any) {
      showAlert(
        "Error",
        error.message || "Failed to login. Please try again.",
        "error",
      );
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.icon2 }]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: theme.icon2 }]}>
            Login to access your dashboard.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.icon2 }]}>
              Promoter ID
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: colorScheme === "dark" ? "#3A3A3C" : "#E0E0E0",
                  backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
                },
              ]}
              placeholder="Enter your Promoter ID"
              placeholderTextColor={theme.icon}
              value={userId}
              onChangeText={setUserId}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.icon2 }]}>Password</Text>
            <View
              style={[
                styles.passwordContainer,
                {
                  borderColor: colorScheme === "dark" ? "#3A3A3C" : "#E0E0E0",
                  backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
                },
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: theme.text }]}
                placeholder="Enter your password"
                placeholderTextColor={theme.icon}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                contextMenuHidden={true}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color={theme.icon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity
              onPress={() => router.push("/forgot-password")}
              style={styles.optionButton}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(drawer)/report?ref=login" as any)}
              style={styles.optionButton}
            >
              <Text style={styles.reportButtonText}>Report Incident</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            style={[styles.loginButton, isLoading && { opacity: 0.8 }]}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {hasBiometrics && (
            <TouchableOpacity
              onPress={handleBiometricLogin}
              style={[styles.biometricButton, isLoading && { opacity: 0.8 }]}
              disabled={isLoading}
            >
              <Ionicons
                name={Platform.OS === 'ios' ? "scan-outline" : "finger-print-outline"}
                size={22}
                color="#0E2B63"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.biometricButtonText}>Login with Biometrics</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          {/* <TouchableOpacity onPress={() => router.push('/activation')} style={styles.activationButton}>
                        <Text style={[styles.activationButtonText, { color: colorScheme === 'dark' ? '#00B1EB' : '#0E2B63' }]}>Activate Account</Text>
                    </TouchableOpacity> */}
        </View>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={handleCloseAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  eyeIcon: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    alignItems: "center",
  },
  optionButton: {
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: "#00B1EB",
    fontSize: 14,
  },
  reportButtonText: {
    color: "#FF3B30", // Red color for urgency/incident
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    width: 210,
    height: 43,
    alignSelf: "center",
    backgroundColor: "#0E2B63",
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0E2B63",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  biometricButton: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  biometricButtonText: {
    color: "#0E2B63",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
    marginTop: 10,
  },
  activationButton: {
    padding: 10,
  },
  activationButtonText: {
    color: "#0E2B63",
    fontSize: 16,
    fontWeight: "500",
  },
});
