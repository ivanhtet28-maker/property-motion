import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Navbar } from "@/components/layout/Navbar";
import {
  Video,
  Search,
  Download,
  Trash2,
  Play,
  Plus,
  ChevronUp,
} from "lucide-react";

interface VideoItem {
  id: string;
  address: string;
  createdAt: string;
  status: "ready" | "processing";
  thumbnailUrl?: string;
}

const mockVideos: VideoItem[] = [
  {
    id: "1",
    address: "123 Collins Street, Melbourne VIC 3000",
    createdAt: "2 hours ago",
    status: "ready",
  },
  {
    id: "2",
    address: "456 George Street, Sydney NSW 2000",
    createdAt: "1 day ago",
    status: "ready",
  },
  {
    id: "3",
    address: "789 Queen Street, Brisbane QLD 4000",
    createdAt: "3 days ago",
    status: "processing",
  },
  {
    id: "4",
    address: "321 King William Street, Adelaide SA 5000",
    createdAt: "1 week ago",
    status: "ready",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const videosUsed = 8;
  const videosLimit = 30;

  const filteredVideos = mockVideos.filter((video) => {
    const matchesSearch = video.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || video.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-12">
        {/* Usage Banner */}
        <div className="bg-accent border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {videosUsed} of {videosLimit} videos used this month
                  </span>
                  <span className="text-sm text-muted-foreground sm:hidden">
                    {Math.round((videosUsed / videosLimit) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(videosUsed / videosLimit) * 100}%` }}
                  />
                </div>
              </div>
              <Link
                to="/settings?tab=plan"
                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                <ChevronUp className="w-4 h-4" />
                Upgrade Plan
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 mt-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Videos</h1>
              <p className="text-muted-foreground mt-1">
                Manage and download your property videos
              </p>
            </div>
            <Button asChild variant="hero" size="lg">
              <Link to="/create">
                <Plus className="w-5 h-5" />
                Create Video
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-40 h-11">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 h-11">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Video Grid */}
          {filteredVideos.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="group bg-card rounded-xl border border-border overflow-hidden hover-lift"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-secondary relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {video.status === "ready" ? (
                        <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Play className="w-6 h-6 text-primary-foreground ml-1" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Video className="w-6 h-6 animate-pulse" />
                          <span className="text-sm">Processing...</span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                        video.status === "ready"
                          ? "bg-success text-success-foreground"
                          : "bg-warning text-warning-foreground"
                      }`}
                    >
                      {video.status === "ready" ? "Ready" : "Processing"}
                    </span>

                    {/* Action Buttons (visible on hover) */}
                    {video.status === "ready" && (
                      <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 rounded-lg bg-background/90 text-foreground hover:bg-background transition-colors"
                          aria-label="Download video"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg bg-background/90 text-destructive hover:bg-background transition-colors"
                          aria-label="Delete video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground truncate" title={video.address}>
                      {video.address}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{video.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No videos yet</h3>
              <p className="text-muted-foreground mb-8">
                Create your first professional listing video
              </p>
              <Button asChild variant="hero" size="lg">
                <Link to="/create">
                  <Plus className="w-5 h-5" />
                  Create Video
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
