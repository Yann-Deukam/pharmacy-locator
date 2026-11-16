
import { useRouter } from "expo-router";
import {
  Heart,
  List,
  Map,
  MapPin,
  Navigation,
  Phone,
  Star,
  X,
} from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/components/ui/Header";
import {
  useMockPharmacies,
  type Pharmacy,
} from "@/services/mockPharmacyService";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useTheme } from "@/theme";

// ── Douala centre coordinates
const DOUALA = {
  latitude: 4.0511,
  longitude: 9.7085,
};

const INITIAL_REGION = {
  ...DOUALA,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type DistanceFilter = "all" | "1km" | "5km" | "10km";

const DISTANCE_CHIPS: {
  label: string;
  value: DistanceFilter;
  metres?: number;
}[] = [
    { label: "All", value: "all" },
    { label: "< 1 km", value: "1km", metres: 1000 },
    { label: "< 5 km", value: "5km", metres: 5000 },
    { label: "< 10 km", value: "10km", metres: 10000 },
  ];

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user, isGuest } = useAuthStore();

  const {
    add: addFav,
    remove: removeFav,
    isFavorite,
  } = useFavoritesStore();

  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [distFilter, setDistFilter] = useState<DistanceFilter>("all");
  const [selected, setSelected] = useState<Pharmacy | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const selectedChip = DISTANCE_CHIPS.find(
    (chip) => chip.value === distFilter
  );

  const {
    data: pharmacies,
    isLoading,
    isError,
  } = useMockPharmacies({
    maxDistanceMetres: selectedChip?.metres,
  });

  const handleSelectMarker = useCallback((pharmacy: Pharmacy) => {
    setSelected(pharmacy);
  }, []);

  const handleDismiss = useCallback(() => {
    setSelected(null);
  }, []);

  const handleFavorite = async (pharmacy: Pharmacy) => {
    if (!user && !isGuest) {
      setShowAuthModal(true);
      return;
    }

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (isFavorite(pharmacy.placeId)) {
      await removeFav(user.id, pharmacy.placeId);
    } else {
      await addFav(
        user.id,
        pharmacy.placeId,
        pharmacy.name,
        pharmacy.address
      );
    }
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleDirections = (pharmacy: Pharmacy) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}&travelmode=driving`;

    Linking.openURL(url);
  };

  const recenter = () => {
    mapRef.current?.animateToRegion(INITIAL_REGION, 500);
  };

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { backgroundColor: colors.background },
      ]}
      edges={["top"]}
    >
      <Header title="PharmaNear" showBackButton={false} />

      {/* Distance filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
        style={styles.chipsScroll}
      >
        {DISTANCE_CHIPS.map((chip) => {
          const active = distFilter === chip.value;

          return (
            <Pressable
              key={chip.value}
              onPress={() => setDistFilter(chip.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: active
                    ? colors.primary
                    : colors.surface,
                  borderColor: active
                    ? colors.primary
                    : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: active
                      ? "#fff"
                      : colors.textSecondary,
                  },
                ]}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Map / List toggle */}
      <View style={styles.toggleRow}>
        <Pressable
          onPress={() => setViewMode("map")}
          style={[
            styles.toggleBtn,
            viewMode === "map" && {
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Map
            size={18}
            color={
              viewMode === "map"
                ? "#fff"
                : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.toggleText,
              {
                color:
                  viewMode === "map"
                    ? "#fff"
                    : colors.textSecondary,
              },
            ]}
          >
            Map
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setViewMode("list")}
          style={[
            styles.toggleBtn,
            viewMode === "list" && {
              backgroundColor: colors.primary,
            },
          ]}
        >
          <List
            size={18}
            color={
              viewMode === "list"
                ? "#fff"
                : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.toggleText,
              {
                color:
                  viewMode === "list"
                    ? "#fff"
                    : colors.textSecondary,
              },
            ]}
          >
            List
          </Text>
        </Pressable>
      </View>

      {/* MAP VIEW */}
      {viewMode === "map" ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
            initialRegion={INITIAL_REGION}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {pharmacies?.map((pharmacy) => (
              <Marker
                key={pharmacy.placeId}
                coordinate={{
                  latitude: pharmacy.latitude,
                  longitude: pharmacy.longitude,
                }}
                onPress={() => handleSelectMarker(pharmacy)}
              >
                <View
                  style={[
                    styles.markerPin,
                    {
                      backgroundColor: pharmacy.is24h
                        ? "#7C3AED"
                        : pharmacy.openNow
                          ? colors.primary
                          : colors.textSecondary,
                    },
                  ]}
                >
                  <MapPin
                    size={14}
                    color="#fff"
                    strokeWidth={2.5}
                  />
                </View>
              </Marker>
            ))}
          </MapView>

          {/* Re-center button */}
          <Pressable
            onPress={recenter}
            style={[
              styles.fab,
              {
                backgroundColor: colors.surface,
                shadowColor: colors.primaryDark,
              },
            ]}
          >
            <Navigation
              size={22}
              color={colors.primary}
            />
          </Pressable>

          {/* Loading overlay */}
          {isLoading && (
            <View
              style={[
                styles.mapOverlay,
                {
                  backgroundColor:
                    colors.background + "AA",
                },
              ]}
            >
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
            </View>
          )}
        </View>
      ) : (
        /* LIST VIEW */
        isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
            <Text
              style={[
                styles.hint,
                { color: colors.textSecondary },
              ]}
            >
              Finding pharmacies…
            </Text>
          </View>
        ) : isError ? (
          <View style={styles.centered}>
            <Text style={{ color: colors.error }}>
              Unable to load pharmacies.
            </Text>
          </View>
        ) : !pharmacies?.length ? (
          <View style={styles.centered}>
            <MapPin
              size={36}
              color={colors.textSecondary}
            />
            <Text
              style={[
                styles.hint,
                { color: colors.textSecondary },
              ]}
            >
              No pharmacies in this range.
            </Text>
          </View>
        ) : (
          <FlatList
            data={pharmacies}
            keyExtractor={(pharmacy) => pharmacy.placeId}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: pharmacy }) => (
              <Pressable
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelected(pharmacy)}
              >
                <View style={styles.cardTop}>
                  <Text
                    style={[
                      styles.cardName,
                      { color: colors.textPrimary },
                    ]}
                    numberOfLines={1}
                  >
                    {pharmacy.name}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: pharmacy.openNow
                          ? colors.success + "20"
                          : colors.error + "15",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: pharmacy.openNow
                            ? colors.success
                            : colors.error,
                        },
                      ]}
                    >
                      {pharmacy.is24h
                        ? "24/7"
                        : pharmacy.openNow
                          ? "Open"
                          : "Closed"}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.cardAddress,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {pharmacy.address}
                </Text>

                <View style={styles.cardFooter}>
                  {pharmacy.distance != null && (
                    <Text
                      style={[
                        styles.cardMeta,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {pharmacy.distance < 1000
                        ? `${pharmacy.distance}m`
                        : `${(
                          pharmacy.distance / 1000
                        ).toFixed(1)}km`}{" "}
                      away
                    </Text>
                  )}

                  {pharmacy.rating != null && (
                    <View style={styles.ratingRow}>
                      <Star
                        size={12}
                        color={colors.accent}
                        fill={colors.accent}
                      />
                      <Text
                        style={[
                          styles.cardMeta,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {pharmacy.rating}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            )}
          />
        )
      )}

      {/* PHARMACY DETAIL SHEET */}
      {selected && (
        <Pressable
          style={styles.sheetBackdrop}
          onPress={handleDismiss}
        >
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: colors.surface },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <View
              style={[
                styles.sheetHandle,
                { backgroundColor: colors.border },
              ]}
            />

            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.sheetName,
                    { color: colors.textPrimary },
                  ]}
                >
                  {selected.name}
                </Text>

                <Text
                  style={[
                    styles.sheetAddress,
                    { color: colors.textSecondary },
                  ]}
                >
                  {selected.address}
                </Text>
              </View>

              <Pressable onPress={handleDismiss}>
                <X
                  size={22}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            {/* Badges */}
            <View style={styles.sheetBadges}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: selected.openNow
                      ? colors.success + "20"
                      : colors.error + "15",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: selected.openNow
                        ? colors.success
                        : colors.error,
                    },
                  ]}
                >
                  {selected.is24h
                    ? "Open 24/7"
                    : selected.openNow
                      ? "Open now"
                      : "Closed"}
                </Text>
              </View>

              {selected.distance != null && (
                <Text
                  style={[
                    styles.sheetMeta,
                    { color: colors.textSecondary },
                  ]}
                >
                  {selected.distance < 1000
                    ? `${selected.distance}m`
                    : `${(
                      selected.distance / 1000
                    ).toFixed(1)}km`}{" "}
                  away
                </Text>
              )}

              {selected.rating != null && (
                <View style={styles.ratingRow}>
                  <Star
                    size={13}
                    color={colors.accent}
                    fill={colors.accent}
                  />
                  <Text
                    style={[
                      styles.sheetMeta,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {selected.rating} ({selected.ratingCount})
                  </Text>
                </View>
              )}
            </View>

            {/* Action buttons */}
            <View style={styles.sheetActions}>
              <Pressable
                onPress={() => handleCall(selected.phone)}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: colors.primary + "18",
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Phone
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.actionText,
                    { color: colors.primary },
                  ]}
                >
                  Call
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleDirections(selected)}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Navigation
                  size={18}
                  color="#fff"
                />
                <Text
                  style={[
                    styles.actionText,
                    { color: "#fff" },
                  ]}
                >
                  Directions
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleFavorite(selected)}
                style={[
                  styles.actionBtn,
                  {
                    borderColor: isFavorite(selected.placeId)
                      ? colors.error
                      : colors.border,
                    backgroundColor: isFavorite(selected.placeId)
                      ? colors.error + "18"
                      : colors.background,
                  },
                ]}
              >
                <Heart
                  size={18}
                  color={
                    isFavorite(selected.placeId)
                      ? colors.error
                      : colors.textSecondary
                  }
                  fill={
                    isFavorite(selected.placeId)
                      ? colors.error
                      : "none"
                  }
                />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      )}

      {/* GUEST AUTH PROMPT MODAL */}
      <Modal
        visible={showAuthModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAuthModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowAuthModal(false)}
        >
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <Heart
              size={36}
              color={colors.primary}
            />

            <Text
              style={[
                styles.modalTitle,
                { color: colors.textPrimary },
              ]}
            >
              Sign in to save favorites
            </Text>

            <Text
              style={[
                styles.modalSub,
                { color: colors.textSecondary },
              ]}
            >
              Create an account or sign in to save pharmacies
              and sync them across devices.
            </Text>

            <Pressable
              onPress={() => {
                setShowAuthModal(false);
                router.push("/(auth)/login");
              }}
              style={[
                styles.modalBtn,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.modalBtnText}>
                Sign in
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowAuthModal(false)}
            >
              <Text
                style={[
                  styles.modalLink,
                  { color: colors.textSecondary },
                ]}
              >
                Not now
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  chipsScroll: {
    flexGrow: 0,
  },

  chipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },

  toggleRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "transparent",
    gap: 6,
  },

  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "transparent",
  },

  toggleText: {
    fontSize: 13,
    fontWeight: "600",
  },

  mapContainer: {
    flex: 1,
    position: "relative",
  },

  mapOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },

  fab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  hint: {
    fontSize: 14,
  },

  list: {
    padding: 16,
    paddingBottom: 100,
    gap: 10,
  },

  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  cardName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    marginRight: 8,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  cardAddress: {
    fontSize: 13,
    marginBottom: 8,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  cardMeta: {
    fontSize: 12,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  markerPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    justifyContent: "flex-end",
  },

  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },

  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },

  sheetName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },

  sheetAddress: {
    fontSize: 13,
  },

  sheetBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },

  sheetMeta: {
    fontSize: 13,
  },

  sheetActions: {
    flexDirection: "row",
    gap: 10,
  },

  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
  },

  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCard: {
    width: "84%",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },

  modalSub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  modalBtn: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  modalBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  modalLink: {
    fontSize: 14,
    fontWeight: "500",
  },
});
