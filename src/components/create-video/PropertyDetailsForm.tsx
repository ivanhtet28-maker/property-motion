import { MapPin, Bed, Bath, Car, Ruler, DollarSign, Home, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PropertyDetails {
  streetAddress: string;
  suburb: string;
  state: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  landSize: string;
  features: string[];
}

const bedroomOptions = [0, 1, 2, 3, 4, 5];
const bathroomOptions = [0, 1, 2, 3, 4, 5];
const carOptions = [0, 1, 2, 3, 4, 5];

const featureOptions = [
  { label: "Pool", icon: "🏊" },
  { label: "Garage", icon: "🚗" },
  { label: "Renovated Kitchen", icon: "🍳" },
  { label: "Ocean View", icon: "🌊" },
  { label: "Garden", icon: "🌳" },
  { label: "Solar", icon: "☀️" },
  { label: "Fireplace", icon: "🔥" },
  { label: "Smart Home", icon: "🏠" },
];

interface PropertyDetailsFormProps {
  details: PropertyDetails;
  onChange: (details: PropertyDetails) => void;
}

export function PropertyDetailsForm({ details, onChange }: PropertyDetailsFormProps) {
  const toggleFeature = (feature: string) => {
    const newFeatures = details.features.includes(feature)
      ? details.features.filter((f) => f !== feature)
      : [...details.features, feature];
    onChange({ ...details, features: newFeatures });
  };

  const ToggleButtonGroup = ({
    label,
    options,
    value,
    onChange: onValueChange,
    icon: Icon,
  }: {
    label: string;
    options: number[];
    value: number;
    onChange: (val: number) => void;
    icon: React.ElementType;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <Label className="text-sm font-medium text-foreground">{label}</Label>
      </div>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onValueChange(opt)}
            className={`flex-1 h-11 rounded-xl text-sm font-semibold transition-all duration-200 ${
              value === opt
                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-[1.02] border border-border/50"
            }`}
          >
            {opt === 5 ? "5+" : opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Property Details</h2>
          <p className="text-sm text-muted-foreground">Enter address and key details</p>
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <Home className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Address</span>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="street" className="text-muted-foreground text-xs uppercase tracking-wide">Street Address</Label>
          <Input
            id="street"
            placeholder="27 Alamanda Boulevard"
            value={details.streetAddress}
            onChange={(e) => onChange({ ...details, streetAddress: e.target.value })}
            className="h-12 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="suburb" className="text-muted-foreground text-xs uppercase tracking-wide">Suburb</Label>
            <Input
              id="suburb"
              placeholder="Point Cook"
              value={details.suburb}
              onChange={(e) => onChange({ ...details, suburb: e.target.value })}
              className="h-12 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" className="text-muted-foreground text-xs uppercase tracking-wide">State</Label>
            <Input
              id="state"
              placeholder="VIC"
              value={details.state}
              onChange={(e) => onChange({ ...details, state: e.target.value })}
              className="h-12 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <Label htmlFor="price" className="text-sm font-medium text-foreground">Asking Price</Label>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-semibold text-lg">$</span>
          <Input
            id="price"
            placeholder="1,250,000"
            value={details.price}
            onChange={(e) => onChange({ ...details, price: e.target.value })}
            className="h-14 pl-9 text-lg font-semibold bg-background/50 border-border/50 focus:border-primary/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Property Stats Grid */}
      <div className="space-y-5">
        <ToggleButtonGroup
          label="Bedrooms"
          options={bedroomOptions}
          value={details.bedrooms}
          onChange={(val) => onChange({ ...details, bedrooms: val })}
          icon={Bed}
        />
        <ToggleButtonGroup
          label="Bathrooms"
          options={bathroomOptions}
          value={details.bathrooms}
          onChange={(val) => onChange({ ...details, bathrooms: val })}
          icon={Bath}
        />
        <ToggleButtonGroup
          label="Car Spaces"
          options={carOptions}
          value={details.carSpaces}
          onChange={(val) => onChange({ ...details, carSpaces: val })}
          icon={Car}
        />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-primary" />
            <Label htmlFor="landSize" className="text-sm font-medium text-foreground">Land Size</Label>
          </div>
          <div className="relative">
            <Input
              id="landSize"
              placeholder="372"
              value={details.landSize}
              onChange={(e) => onChange({ ...details, landSize: e.target.value })}
              className="h-12 pr-14 bg-secondary/30 border-border/50 focus:border-primary/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium bg-secondary/80 px-2 py-1 rounded-md">
              m²
            </span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium text-foreground">Property Features</Label>
        </div>
        <div className="flex flex-wrap gap-2">
          {featureOptions.map((feature) => (
            <button
              key={feature.label}
              onClick={() => toggleFeature(feature.label)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                details.features.includes(feature.label)
                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/50 hover:scale-[1.02]"
              }`}
            >
              <span>{feature.icon}</span>
              {feature.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
