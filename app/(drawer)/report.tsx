import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  BackHandler,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { Dropdown } from "react-native-element-dropdown";
import ScreenHeader from "@/components/ScreenHeader";
import CustomAlert from "@/components/CustomAlert";
import { useRouter, useNavigation, useLocalSearchParams } from "expo-router";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/theme";
import { useApi, useAuth } from "@/context";

export default function ReportScreen() {
  const router = useRouter();
  const { createIncident } = useApi();
  const { user } = useAuth();
  console.log("User context in ReportScreen:", user);
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const params = useLocalSearchParams();
  const showBack = !!params.ref;
  const isFromLogin = params.ref === "login";
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const issueCategoryOptions = [
    { label: "Maintenance", value: "Maintenance" },
    { label: "Security", value: "Security" },
    { label: "Safety", value: "Safety" },
    { label: "Equipment", value: "Equipment" },
    { label: "Other", value: "Other" },
  ];

  const [incidentName, setIncidentName] = useState("");
  const [issueCategory, setIssueCategory] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState(user?.user_id?.toString() || "");
  const [promoterId, setPromoterId] = useState(user?.promoter_id || "");
  const [image, setImage] = useState<string | null>(null);
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
      // Clear fields on success
      setIncidentName("");
      setIssueCategory("");
      setDescription("");
      setImage(null);

      // Only navigate if we were in the pre-login reporting flow
      if (isFromLogin) {
        router.replace("/login");
      }
      // Stay on the screen otherwise as requested
    }
  };

  useEffect(() => {
    // Update user_id and promoter_id when user context changes
    if (user) {
      setUserId(user.user_id?.toString() || "");
      setPromoterId(user.promoter_id || "");
    } else {
      // Clear fields when user logs out
      setUserId("");
      setPromoterId("");
    }
  }, [user]);

  useEffect(() => {
    if (isFromLogin) {
      navigation.setOptions({
        swipeEnabled: false,
        headerShown: false,
        drawerItemStyle: { display: "none" },
      });
    } else {
      navigation.setOptions({
        swipeEnabled: true,
        headerShown: true,
      });
    }
  }, [isFromLogin, navigation]);

  useEffect(() => {
    const onBackPress = () => {
      if (isFromLogin) {
        router.replace("/login");
      } else if (params.ref === "settings") {
        router.navigate("/(drawer)/settings");
      } else {
        router.back();
      }
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, [router, isFromLogin, params.ref]);

  const handleSubmit = async () => {
    if (!incidentName.trim()) {
      showAlert("Error", "Please provide an incident name/title.", "error");
      return;
    }
    if (!description.trim()) {
      showAlert(
        "Error",
        "Please provide a description of the incident.",
        "error",
      );
      return;
    }

    if (!promoterId.trim()) {
      showAlert("Error", "Please provide your Promoter ID.", "error");
      return;
    }

    try {
      await createIncident({
        incident_name: incidentName,
        issue_category: issueCategory || undefined,
        description,
        photo: image || undefined,
        user_id: userId,
        promoter_id: promoterId,
      });
      showAlert(
        "Report Submitted",
        "Your incident report has been submitted successfully.",
        "success",
      );
    } catch (error: any) {
      showAlert(
        "Error",
        error.message || "Failed to submit report. Please try again.",
        "error",
      );
    }
  };

  const pickImage = async () => {
    Alert.alert("Upload Photo", "Choose an option", [
      {
        text: "Camera",
        onPress: async () => {
          const permissionResult =
            await ImagePicker.requestCameraPermissionsAsync();
          if (permissionResult.granted === false) {
            Alert.alert("Permission to access camera is required!");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!result.canceled) {
            setImage(result.assets[0].uri);
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!result.canceled) {
            setImage(result.assets[0].uri);
          }
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader
        title="Report Incident"
        withSafeArea={isFromLogin}
        showBackButton={showBack}
        onBack={
          showBack
            ? () => {
              if (isFromLogin) {
                router.replace("/login");
              } else if (params.ref === "settings") {
                router.navigate("/(drawer)/settings");
              } else {
                router.back();
              }
            }
            : undefined
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Promoter ID Field */}
        <Text style={[styles.label, { color: theme.text }]}>Promoter ID</Text>
        <TextInput
          style={[
            styles.inputContainer,
            {
              color: theme.text,
              backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#fff",
              opacity: user ? 0.6 : 1,
            },
          ]}
          placeholder="Your Promoter ID"
          placeholderTextColor={theme.icon}
          value={promoterId}
          onChangeText={setPromoterId}
          editable={!user}
        />

        {/* Incident Name */}
        <Text style={[styles.label, { color: theme.text }]}>
          Incident Title
        </Text>
        <TextInput
          style={[
            styles.inputContainer,
            {
              color: theme.text,
              backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#fff",
            },
          ]}
          placeholder="Enter incident title"
          placeholderTextColor={theme.icon}
          value={incidentName}
          onChangeText={setIncidentName}
        />

        {/* Issue Category */}
        <Text style={[styles.label, { color: theme.text }]}>
          Issue Category
        </Text>
        <Dropdown
          style={[
            styles.inputContainer,
            {
              backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#fff",
              borderColor: "#00B1EB",
            },
          ]}
          placeholderStyle={{
            color: theme.icon,
            fontSize: 16,
          }}
          selectedTextStyle={{
            color: theme.text,
            fontSize: 16,
          }}
          inputSearchStyle={{
            height: 40,
            borderRadius: 8,
            borderColor: "#00B1EB",
            borderWidth: 1,
            paddingHorizontal: 8,
            color: theme.text,
            fontSize: 16,
          }}
          itemContainerStyle={{
            backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#fff",
          }}
          itemTextStyle={{
            color: theme.text,
            fontSize: 16,
          }}
          activeColor={colorScheme === "dark" ? "#3C3C3E" : "#E8F4FF"}
          data={issueCategoryOptions}
          labelField="label"
          valueField="value"
          placeholder="Select a category"
          value={issueCategory}
          onChange={(item) => {
            setIssueCategory(item.value);
          }}
        />

        {/* Description */}
        <Text style={[styles.label, { color: theme.text }]}>Description</Text>
        <TextInput
          style={[
            styles.inputContainer,
            styles.textArea,
            {
              color: theme.text,
              backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#fff",
            },
          ]}
          placeholder="Describe the incident in detail..."
          placeholderTextColor={theme.icon}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />

        {/* Upload Photo */}
        <Text style={[styles.label, { color: theme.text }]}>
          Upload Photo (Optional)
        </Text>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            {
              backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F0F8FF",
              borderColor: "#00B1EB",
            },
          ]}
          onPress={pickImage}
        >
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: image }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImage(null)}
              >
                <Ionicons name="close-circle" size={28} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Ionicons name="camera-outline" size={32} color="#00B1EB" />
              <Text style={[styles.uploadText, { color: "#00B1EB" }]}>
                Tap to upload photo
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={handleCloseAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    color: "#0E2B63",
  },
  inputContainer: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#00B1EB", // Updated border color
    fontSize: 16,
  },
  textArea: {
    height: 120,
    alignItems: "flex-start",
  },
  uploadButton: {
    height: 150,
    borderRadius: 17,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  uploadText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#0E2B63",
    width: 210,
    height: 43,
    justifyContent: "center",
    alignSelf: "center", // Center the button since it has a fixed width
    borderRadius: 17,
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
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  imagePreviewContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 14,
    padding: 2,
  },
});
