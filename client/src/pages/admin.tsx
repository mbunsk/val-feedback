import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, BarChart3, Clock, TrendingUp, MessageCircle, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LinkClick {
  id: string;
  company: string;
  linkType: string;
  url: string;
  clickCount: number;
  lastClicked: string;
  createdAt: string;
}

interface CompanyStats {
  company: string;
  logoClicks: number;
  buttonClicks: number;
  totalClicks: number;
  logoUrl: string;
  buttonUrl: string;
  lastClicked?: string;
}

interface SimulationSession {
  id: string;
  idea: string;
  targetCustomer: string;
  problemSolved: string;
  customerPersonas: any[];
  conversationHistory: any[];
  simulationData: any[];
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  validation?: {
    id: string;
    feedback: string;
  } | null;
}

interface SimulationSessionsResponse {
  sessions: SimulationSession[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<LinkClick[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [validationCount, setValidationCount] = useState(0);
  const [loadingValidationCount, setLoadingValidationCount] = useState(false);
  const [simulationSessions, setSimulationSessions] = useState<SimulationSession[]>([]);
  const [loadingSimulationSessions, setLoadingSimulationSessions] = useState(false);
  const [simulationPagination, setSimulationPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedSession, setSelectedSession] = useState<SimulationSession | null>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const { toast } = useToast();

  // Check if already logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/admin/link-stats");
      if (response.ok) {
        setIsLoggedIn(true);
        fetchStats();
        fetchValidationCount();
        fetchSimulationSessions();
      }
    } catch (error) {
      // Not logged in, which is fine
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsLoggedIn(true);
        setPassword("");
        fetchStats();
        fetchValidationCount();
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard",
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch("/api/admin/link-stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch stats",
        variant: "destructive",
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchValidationCount = async () => {
    setLoadingValidationCount(true);
    try {
      const response = await fetch("/api/admin/validation-count");
      if (response.ok) {
        const data = await response.json();
        setValidationCount(data.count);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch validation count",
        variant: "destructive",
      });
    } finally {
      setLoadingValidationCount(false);
    }
  };

  const fetchSimulationSessions = async (page: number = 1) => {
    setLoadingSimulationSessions(true);
    try {
      const response = await fetch(`/api/admin/simulation-sessions?page=${page}&pageSize=10`);
      if (response.ok) {
        const data: SimulationSessionsResponse = await response.json();
        setSimulationSessions(data.sessions);
        setSimulationPagination(data.pagination);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch simulation sessions",
        variant: "destructive",
      });
    } finally {
      setLoadingSimulationSessions(false);
    }
  };

  // Process stats into company groups
  const companyStats: CompanyStats[] = ["base44",  "liveplan"].map(company => {
    const logoStat = stats.find(s => s.company === company && s.linkType === "logo");
    const buttonStat = stats.find(s => s.company === company && s.linkType === "button");
    
    const logoClicks = logoStat?.clickCount || 0;
    const buttonClicks = buttonStat?.clickCount || 0;
    const totalClicks = logoClicks + buttonClicks;
    
    const lastClickedLogo = logoStat?.lastClicked ? new Date(logoStat.lastClicked) : null;
    const lastClickedButton = buttonStat?.lastClicked ? new Date(buttonStat.lastClicked) : null;
    const lastClicked = [lastClickedLogo, lastClickedButton]
      .filter(Boolean)
      .sort((a, b) => b!.getTime() - a!.getTime())[0];

    return {
      company: company.charAt(0).toUpperCase() + company.slice(1),
      logoClicks,
      buttonClicks,
      totalClicks,
      logoUrl: logoStat?.url || "",
      buttonUrl: buttonStat?.url || "",
      lastClicked: lastClicked?.toLocaleDateString(),
    };
  }).sort((a, b) => b.totalClicks - a.totalClicks);

  const totalClicks = companyStats.reduce((sum, stat) => sum + stat.totalClicks, 0);
  const topCompany = companyStats[0];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Partner Link Analytics</h1>
            <p className="text-muted-foreground mt-1">Track affiliate partner engagement</p>
          </div>
          <Button 
            onClick={fetchStats} 
            disabled={loadingStats}
            variant="outline"
          >
            {loadingStats ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold">{totalClicks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Top Partner</p>
                  <p className="text-2xl font-bold">{topCompany?.company || "None"}</p>
                  <p className="text-xs text-muted-foreground">{topCompany?.totalClicks} clicks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Partners</p>
                  <p className="text-2xl font-bold">{companyStats.filter(s => s.totalClicks > 0).length}</p>
                  <p className="text-xs text-muted-foreground">of 6 partners</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold">
                    {loadingValidationCount ? "..." : validationCount}
                  </p>
                  <p className="text-xs text-muted-foreground">since Aug 17, 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Partner Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companyStats.map((company, index) => (
                <div 
                  key={company.company}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent text-white rounded-full font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{company.company}</h3>
                      {company.lastClicked && (
                        <p className="text-sm text-muted-foreground">Last clicked: {company.lastClicked}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Logo Clicks */}
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">Logo</Badge>
                        {company.logoUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(company.logoUrl, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{company.logoClicks}</p>
                      <p className="text-xs text-muted-foreground">clicks</p>
                    </div>

                    {/* Button Clicks */}
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">Button</Badge>
                        {company.buttonUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(company.buttonUrl, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-green-600">{company.buttonClicks}</p>
                      <p className="text-xs text-muted-foreground">clicks</p>
                    </div>

                    {/* Total */}
                    <div className="text-center">
                      <Badge className="mb-1">Total</Badge>
                      <p className="text-3xl font-bold text-primary">{company.totalClicks}</p>
                      <p className="text-xs text-muted-foreground">clicks</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalClicks === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No link clicks tracked yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Clicks will appear here once users interact with the partner links.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Simulation Sessions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Simulation Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSimulationSessions ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading simulation sessions...</p>
              </div>
            ) : simulationSessions.length > 0 ? (
              <div className="space-y-4">
                {simulationSessions.map((session) => (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full font-bold">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg truncate max-w-md">{session.idea}</h3>
                          <p className="text-sm text-muted-foreground">
                            {session.user?.name || 'Anonymous'} • {new Date(session.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="ml-14">
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Target:</strong> {session.targetCustomer}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Problem:</strong> {session.problemSolved.substring(0, 100)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <Badge variant="secondary" className="mb-1">
                          Customers
                        </Badge>
                        <p className="text-lg font-bold text-blue-600">
                          {session.customerPersonas?.length || 0}
                        </p>
                      </div>

                      <div className="text-center">
                        <Badge variant="secondary" className="mb-1">
                          Messages
                        </Badge>
                        <p className="text-lg font-bold text-green-600">
                          {session.conversationHistory?.length || 0}
                        </p>
                      </div>

                      <Button
                        onClick={() => {
                          setSelectedSession(session);
                          setShowChatDialog(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        View Chat
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {simulationPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {((simulationPagination.page - 1) * simulationPagination.pageSize) + 1} to{' '}
                      {Math.min(simulationPagination.page * simulationPagination.pageSize, simulationPagination.total)} of{' '}
                      {simulationPagination.total} sessions
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSimulationSessions(simulationPagination.page - 1)}
                        disabled={simulationPagination.page <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {simulationPagination.page} of {simulationPagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSimulationSessions(simulationPagination.page + 1)}
                        disabled={simulationPagination.page >= simulationPagination.totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No simulation sessions found.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Sessions will appear here once users start customer conversations.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Dialog */}
        <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Conversation</DialogTitle>
            </DialogHeader>
            {selectedSession && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Startup Idea</h3>
                  <p className="text-sm">{selectedSession.idea}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p><strong>Target Customer:</strong> {selectedSession.targetCustomer}</p>
                    <p><strong>Problem Solved:</strong> {selectedSession.problemSolved}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Customer Personas</h4>
                  {selectedSession.customerPersonas?.map((persona, index) => (
                    <div key={index} className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                      <p className="font-medium">{persona.name} - {persona.role}</p>
                      <p className="text-sm text-muted-foreground">{persona.background}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 text-black">
                  <h4 className="font-semibold">Conversation History</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedSession.conversationHistory?.map((message, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg ${
                          message.isUser 
                            ? 'bg-blue-100 dark:bg-blue-900/30 ml-8' 
                            : 'bg-gray-100 dark:bg-gray-800 mr-8'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">
                            {message.isUser ? 'User' : `Customer ${message.customerId}`}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedSession.simulationData && selectedSession.simulationData.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Simulation Data</h4>
                    <div className="space-y-2">
                      {selectedSession.simulationData.map((month, index) => (
                        <div key={index} className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                          <p className="font-medium">Month {month.month}: {month.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Revenue: ${month.revenue} | Users: {month.users}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}