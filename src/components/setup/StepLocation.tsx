import { Box, TextLabel, Input, Tap } from "@/components/ui/native";
import { View, TextInput } from "react-native";
import { getCurrentPosition } from "@/platform/location";
import { useEffect, useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { NICARAGUA_EXTRA_CITIES } from "@/data/locations";
type CountryItem = {
  code: string;
  name: string;
};
type CountryData = {
  iso2: string;
  country: string;
  cities: string[];
};
export default function StepLocation({ onNext, next, back }: any) {
  const { t } = useLanguage();
  const [allCountries, setAllCountries] = useState<CountryData[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<CountryItem[]>([]);
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<View>(null);
  const inputRef = useRef<TextInput>(null);
  const centerAmericanCodes = ["BZ", "CR", "SV", "GT", "HN", "NI", "PA"];
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/Countries",
        );
        const data = await res.json();
        if (data.data) {
          const countryList = data.data
            .filter((c: any) => centerAmericanCodes.includes(c.iso2))
            .map((c: any) => ({
              iso2: c.iso2,
              country: c.country,
              cities: c.cities || [],
            }));
          setAllCountries(countryList);
          setFilteredCountries(
            countryList.map((c: CountryData) => ({
              code: c.iso2,
              name: c.country,
            })),
          );
        }
      } catch {
        setFilteredCountries(
          centerAmericanCodes.map((code) => ({ code, name: code })),
        );
      } finally {
        setLoading(false);
      }
    };
    if (allCountries.length === 0) {
      fetchData();
    }
  }, []);
  useEffect(() => {
    if (!country) {
      setCities([]);
      setFilteredCities([]);
      setCity("");
      return;
    }
    const countryData = allCountries.find((c) => c.iso2 === country);
    if (countryData) {
      const base =
        country === "NI"
          ? [...countryData.cities, ...NICARAGUA_EXTRA_CITIES]
          : countryData.cities;
      const sortedCities = [...new Set(base)].sort((a, b) =>
        a.localeCompare(b, "es"),
      );
      setCities(sortedCities);
      setFilteredCities(sortedCities);
    }
  }, [country, allCountries]);
  const handleCitySearch = (value: string) => {
    setCity(value);
    if (!value.trim()) {
      setFilteredCities(cities);
    } else {
      const lowerValue = value.toLowerCase();
      setFilteredCities(
        cities.filter((c) => c.toLowerCase().includes(lowerValue)),
      );
    }
  };
  const selectCity = (selectedCity: string) => {
    setCity(selectedCity);
    setShowDropdown(false);
    inputRef.current?.blur();
  };
  const canNext = !!country && !!city;
  const handle = () => {
    if (!country || !city) return;
    onNext("location", { country_code: country, city });
    next();
  };
  return (
    <Box>
      <TextLabel className="font-display">{t("step_location.title")}</TextLabel>
      <Box className="grid grid-cols-2 gap-4">
        <Box>
          <Label>{t("step_location.country")}</Label>
          <Select
            value={country}
            onValueChange={(val) => {
              setCountry(val);
              setCity("");
              setFilteredCities([]);
              setShowDropdown(false);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  loading
                    ? t("step_location.loading")
                    : t("step_location.select_country")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>
                  {t("step_location.loading")}
                </SelectItem>
              ) : (
                filteredCountries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Box>
        <Box ref={dropdownRef} className="relative">
          <Label>{t("step_location.city")}</Label>
          <Input
            ref={inputRef}
            type="text"
            placeholder={
              country
                ? t("step_location.search_city")
                : t("step_location.select_country_first")
            }
            value={city}
            onChange={(e) => handleCitySearch(e.target.value)}
            onFocus={() => country && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            disabled={!country}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          {showDropdown && country && filteredCities.length > 0 && (
            <Box className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredCities.map((c, i) => (
                <Box
                  key={`${c}-${i}`}
                  onPress={() => selectCity(c)}
                  className="px-3 py-2 cursor-pointer hover:bg-muted text-sm"
                >
                  {c}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Box className="flex gap-2 mt-3 flex-row">
        <Tap onPress={back} className="px-4 py-2 rounded">
          {t("step_location.back")}
        </Tap>
        <Tap
          onPress={handle}
          className="px-4 py-2 rounded bg-primary text-white"
          disabled={!canNext}
        >
          {t("step_location.continue")}
        </Tap>
      </Box>
    </Box>
  );
}
