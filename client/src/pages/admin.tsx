import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Calendar, Globe, User, FileText, ExternalLink, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Submission, Validation } from "@shared/schema";

interface AdminLoginProps {
  onLogin: () => void;
}

function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiRequest("POST", "/api/admin/login", { password });
      
      if (response.ok) {
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard",
        });
        onLogin();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Pagination component
function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void; 
}) {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Pagination state for submissions
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const submissionsPerPage = 10;
  
  // Pagination state for validations
  const [validationsPage, setValidationsPage] = useState(1);
  const validationsPerPage = 10;

  const { data: submissions, isLoading: submissionsLoading } = useQuery<Submission[]>({
    queryKey: ["/api/admin/submissions"],
  });

  const { data: validations, isLoading: validationsLoading } = useQuery<Validation[]>({
    queryKey: ["/api/admin/validations"],
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/logout"),
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      window.location.reload();
    },
  });

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Unknown";
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "base44": return "bg-blue-500";
      case "lovable": return "bg-pink-500";
      case "bubble": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  // Calculate pagination for submissions
  const submissionsStartIndex = (submissionsPage - 1) * submissionsPerPage;
  const submissionsEndIndex = submissionsStartIndex + submissionsPerPage;
  const paginatedSubmissions = submissions?.slice(submissionsStartIndex, submissionsEndIndex) || [];
  const totalSubmissionsPages = Math.ceil((submissions?.length || 0) / submissionsPerPage);

  // Calculate pagination for validations
  const validationsStartIndex = (validationsPage - 1) * validationsPerPage;
  const validationsEndIndex = validationsStartIndex + validationsPerPage;
  const paginatedValidations = validations?.slice(validationsStartIndex, validationsEndIndex) || [];
  const totalValidationsPages = Math.ceil((validations?.length || 0) / validationsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">ValidatorAI Data Management</p>
          </div>
          <Button
            onClick={() => logoutMutation.mutate()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold">{submissions?.length || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Validations</p>
                  <p className="text-2xl font-bold">{validations?.length || 0}</p>
                </div>
                <Lightbulb className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">
                    {submissions?.filter(s => {
                      if (!s.createdAt) return false;
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      const submissionDate = typeof s.createdAt === 'string' ? new Date(s.createdAt) : s.createdAt;
                      return submissionDate > weekAgo;
                    }).length || 0}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unique Platforms</p>
                  <p className="text-2xl font-bold">
                    {submissions?.length || 0}
                  </p>
                </div>
                <Globe className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Submissions Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Share Idea Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissionsLoading ? (
              <div className="text-center py-8">Loading submissions...</div>
            ) : submissions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No submissions yet
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedSubmissions.map((submission) => (
                    <Card key={submission.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h3 className="text-lg font-semibold text-primary">
                                {submission.projectName}
                              </h3>
                              <Badge className="bg-primary text-white">
                                Submission
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-4 h-4" />
                              <span>{submission.name}</span>
                              <span>•</span>
                              <span>{submission.email}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(submission.createdAt)}</span>
                            </div>

                            {submission.siteUrl && (
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-primary" />
                                <a
                                  href={submission.siteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1"
                                >
                                  {submission.siteUrl}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold mb-2">Project Summary:</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {submission.projectSummary}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">What They Need:</h4>
                              <p className="text-sm font-medium text-primary bg-primary/10 p-2 rounded">
                                {submission.whatDoYouNeed || 'Not specified'}
                              </p>
                            </div>

                            {submission.screenshotPath && (
                              <div>
                                <h4 className="font-semibold mb-2">Screenshot:</h4>
                                <img
                                  src={`/${submission.screenshotPath}`}
                                  alt={`${submission.projectName} screenshot`}
                                  className="w-full max-w-sm rounded-lg border"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {totalSubmissionsPages > 1 && (
                  <Pagination
                    currentPage={submissionsPage}
                    totalPages={totalSubmissionsPages}
                    onPageChange={setSubmissionsPage}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Validations Section */}
        <Card >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Idea Validations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validationsLoading ? (
              <div className="text-center py-8">Loading validations...</div>
            ) : validations?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No validations yet
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedValidations.map((validation) => (
                    <Card key={validation.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h3 className="text-lg font-semibold text-yellow-600">
                                Idea Validation
                              </h3>
                              <Badge className="bg-yellow-500 text-white">
                                Validation
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(validation.createdAt)}</span>
                            </div>

                            {validation.user && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="w-4 h-4" />
                                <span>{validation.user.name}</span>
                                <span>•</span>
                                <span>{validation.user.email}</span>
                              </div>
                            )}

                            <div>
                              <h4 className="font-semibold mb-2">Idea:</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {validation.idea}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Target Customer:</h4>
                              <p className="text-sm font-medium text-yellow-600 bg-yellow-50 p-2 rounded">
                                {validation.targetCustomer}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Problem Solved:</h4>
                              <p className="text-sm font-medium text-yellow-600 bg-yellow-50 p-2 rounded">
                                {validation.problemSolved}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold mb-2">AI Feedback:</h4>
                              <div 
                                className="text-sm text-muted-foreground leading-relaxed max-h-64 overflow-y-auto"
                                dangerouslySetInnerHTML={{ __html: validation.feedback }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {totalValidationsPages > 1 && (
                  <Pagination
                    currentPage={validationsPage}
                    totalPages={totalValidationsPages}
                    onPageChange={setValidationsPage}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/submissions", {
          credentials: 'include'
        });
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Not authenticated, stay on login page
      }
    };

    checkAuth();
  }, []);

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return <AdminDashboard />;
}