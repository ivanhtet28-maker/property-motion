import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/Navbar";
import { User, CreditCard, Building2, Check, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    videos: 10,
    description: "Perfect for solo agents",
  },
  {
    id: "professional",
    name: "Professional",
    price: 99,
    videos: 30,
    description: "For busy agents",
    current: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: 199,
    videos: -1,
    description: "For agencies & teams",
  },
];

const billingHistory = [
  { date: "Jan 15, 2025", description: "Professional Plan", amount: "$99.00" },
  { date: "Dec 15, 2024", description: "Professional Plan", amount: "$99.00" },
  { date: "Nov 15, 2024", description: "Professional Plan", amount: "$99.00" },
  { date: "Oct 15, 2024", description: "Starter Plan", amount: "$49.00" },
];

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  const { toast } = useToast();

  const [agentName, setAgentName] = useState("John Smith");
  const [agentPhone, setAgentPhone] = useState("0412 345 678");
  const [agentEmail, setAgentEmail] = useState("john@raywhite.com.au");
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Settings saved!",
      description: "Your profile has been updated.",
    });
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    setIsUpdatingPassword(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsUpdatingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast({
      title: "Password updated!",
      description: "Your password has been changed.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-3xl font-bold text-foreground mt-8 mb-8">Account Settings</h1>

          <Tabs defaultValue={defaultTab} className="space-y-8">
            <TabsList className="bg-secondary p-1 rounded-lg">
              <TabsTrigger value="profile" className="rounded-md">
                Profile
              </TabsTrigger>
              <TabsTrigger value="plan" className="rounded-md">
                Plan
              </TabsTrigger>
              <TabsTrigger value="billing" className="rounded-md">
                Billing
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-8">
              {/* Email (Read Only) */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">Signed in as</span>
                </div>
                <p className="font-medium text-foreground">john@example.com</p>
              </div>

              {/* Default Agent Details */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">Default Agent Branding</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  These details will be used for all new videos
                </p>

                <div className="space-y-6">
                  {/* Agent Photo */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline">Upload Photo</Button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="agent-name">Agent Name</Label>
                      <Input
                        id="agent-name"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agent-phone">Phone Number</Label>
                      <Input
                        id="agent-phone"
                        value={agentPhone}
                        onChange={(e) => setAgentPhone(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="agent-email">Email</Label>
                      <Input
                        id="agent-email"
                        type="email"
                        value={agentEmail}
                        onChange={(e) => setAgentEmail(e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Agency Logo */}
                  <div className="flex items-center gap-4">
                    <div className="w-40 h-14 rounded-lg bg-secondary flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <Button variant="outline">Upload Logo</Button>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={isSaving} variant="hero">
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>

              {/* Change Password */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <Button
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword || !currentPassword || !newPassword}
                    variant="default"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-card rounded-xl border border-destructive/30 p-6">
                <h2 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </TabsContent>

            {/* Plan Tab */}
            <TabsContent value="plan" className="space-y-8">
              {/* Current Plan */}
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`rounded-xl p-6 ${
                      plan.current
                        ? "bg-primary text-primary-foreground border-2 border-primary"
                        : "bg-card border border-border"
                    }`}
                  >
                    {plan.current && (
                      <span className="inline-block px-2 py-1 bg-success text-success-foreground text-xs font-medium rounded-full mb-4">
                        Current Plan
                      </span>
                    )}
                    <h3 className={`text-lg font-bold ${plan.current ? "" : "text-foreground"}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm mt-1 ${plan.current ? "opacity-80" : "text-muted-foreground"}`}>
                      {plan.description}
                    </p>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className={`text-sm ${plan.current ? "opacity-80" : "text-muted-foreground"}`}>
                        /month
                      </span>
                    </div>
                    <p className={`mt-2 text-sm ${plan.current ? "opacity-80" : "text-muted-foreground"}`}>
                      {plan.videos === -1 ? "Unlimited" : plan.videos} videos/month
                    </p>
                    {plan.current ? (
                      <div className="mt-6 flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4" />
                        8 of {plan.videos} used
                      </div>
                    ) : (
                      <Button
                        variant={plan.current ? "secondary" : "outline"}
                        className="w-full mt-6"
                      >
                        {plan.price > 99 ? "Upgrade" : "Downgrade"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Feature Comparison */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3 className="font-semibold text-foreground">Feature Comparison</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-medium text-muted-foreground">Feature</th>
                        <th className="text-center p-4 font-medium text-muted-foreground">Starter</th>
                        <th className="text-center p-4 font-medium text-muted-foreground bg-accent">
                          Professional
                        </th>
                        <th className="text-center p-4 font-medium text-muted-foreground">Agency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Videos per month", "10", "30", "Unlimited"],
                        ["HD Quality", "✓", "✓", "✓"],
                        ["All Templates", "✓", "✓", "✓"],
                        ["Agent Branding", "✓", "✓", "✓"],
                        ["Priority Support", "—", "✓", "✓"],
                        ["Analytics", "—", "✓", "✓"],
                        ["White Label", "—", "—", "✓"],
                        ["Multi-user", "—", "—", "✓"],
                        ["API Access", "—", "—", "✓"],
                      ].map(([feature, starter, pro, agency], index) => (
                        <tr key={index} className="border-b border-border last:border-0">
                          <td className="p-4 text-foreground">{feature}</td>
                          <td className="p-4 text-center text-muted-foreground">{starter}</td>
                          <td className="p-4 text-center bg-accent text-foreground">{pro}</td>
                          <td className="p-4 text-center text-muted-foreground">{agency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-8">
              {/* Payment Method */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Payment Method</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-secondary rounded flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/26</p>
                    </div>
                  </div>
                  <Button variant="outline">Update</Button>
                </div>
              </div>

              {/* Billing History */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Billing History</h2>
                </div>
                <div className="divide-y divide-border">
                  {billingHistory.map((item, index) => (
                    <div key={index} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{item.description}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-foreground">{item.amount}</span>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
