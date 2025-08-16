import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, TrendingUp, Download, CheckCircle, AlertCircle } from "lucide-react";

interface StartupSimulatorProps {
  validationData?: {
    idea: string;
    targetCustomer: string;
    problemSolved: string;
    feedback: string;
  };
}

interface Customer {
  id: number;
  name: string;
  role: string;
  background: string;
  avatar: string;
  personality: string;
  painPoints: string[];
}

interface Message {
  id: number;
  customerId: number;
  isUser: boolean;
  text: string;
  timestamp: Date;
}

interface SimulationPhase {
  month: number;
  title: string;
  challenges: string[];
  wins: string[];
  revenue: number;
  users: number;
  keyDecisions: string[];
}

export default function StartupSimulator({ validationData }: StartupSimulatorProps) {
  const [currentPhase, setCurrentPhase] = useState<'start' | 'interviews' | 'simulation' | 'results'>('start');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [interviewsCompleted, setInterviewsCompleted] = useState<number[]>([]);
  const [simulationData, setSimulationData] = useState<SimulationPhase[]>([]);
  const [challengeResponses, setChallengeResponses] = useState<{[key: number]: string}>({});
  const [challengeFeedback, setChallengeFeedback] = useState<{[key: number]: string}>({});
  const [activeValChat, setActiveValChat] = useState<number | null>(null);
  const [valMessages, setValMessages] = useState<{[key: number]: any[]}>({});
  const [valQuestion, setValQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startSimulation = async () => {
    if (!validationData) {
      toast({
        title: "Validation Required",
        description: "Please complete the idea validation first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate customer personas from validation data
      const response = await apiRequest("POST", "/api/generate-customers", {
        idea: validationData.idea,
        targetCustomer: validationData.targetCustomer,
        problemSolved: validationData.problemSolved,
        feedback: validationData.feedback
      });

      const data = await response.json();
      // Handle both direct array and nested object responses
      const customers = Array.isArray(data.customers) ? data.customers : (data.customers?.personas || data.personas || []);
      setCustomers(customers);
      setCurrentPhase('interviews');
      
      toast({
        title: "Customers Generated!",
        description: "Ready to start customer interviews"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate customer personas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startCustomerInterview = async (customer: Customer) => {
    setActiveCustomer(customer);
    setIsLoading(true);
    
    try {
      // Generate initial personalized welcome message
      const response = await apiRequest("POST", "/api/customer-interview", {
        customerId: customer.id,
        customerPersona: customer,
        userQuestion: "", // Empty for initial greeting
        conversationHistory: [],
        validationData
      });

      const data = await response.json();
      
      setMessages([
        {
          id: 1,
          customerId: customer.id,
          isUser: false,
          text: data.response,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      // Fallback welcome message
      setMessages([
        {
          id: 1,
          customerId: customer.id,
          isUser: false,
          text: `Hi! I'm ${customer.name}, ${customer.role.toLowerCase()}. ${customer.background} I'd be interested to hear about your idea.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!currentQuestion.trim() || !activeCustomer) return;

    const userMessage: Message = {
      id: messages.length + 1,
      customerId: activeCustomer.id,
      isUser: true,
      text: currentQuestion,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion("");
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/customer-interview", {
        customerId: activeCustomer.id,
        customerPersona: activeCustomer,
        userQuestion: currentQuestion,
        conversationHistory: messages,
        validationData
      });

      const data = await response.json();
      
      const customerResponse: Message = {
        id: messages.length + 2,
        customerId: activeCustomer.id,
        isUser: false,
        text: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, customerResponse]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get customer response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeInterview = () => {
    if (activeCustomer && !interviewsCompleted.includes(activeCustomer.id)) {
      setInterviewsCompleted(prev => [...prev, activeCustomer.id]);
    }
    setActiveCustomer(null);
  };

  const moveToSimulation = async () => {
    setIsLoading(true);
    try {
      // Collect customer insights for simulation
      const customerInsights = customers.map(customer => ({
        persona: customer,
        keyPoints: messages
          .filter(m => m.customerId === customer.id && !m.isUser)
          .map(m => m.text.substring(0, 100)) // Extract key insights
      }));

      const response = await apiRequest("POST", "/api/generate-simulation", {
        validationData,
        customerInsights,
        landingPageContent: null // Will add web crawling later
      });

      const data = await response.json();
      // Handle both direct array and nested object responses
      const simulation = Array.isArray(data.simulation) ? data.simulation : (data.simulation?.phases || data.phases || []);
      setSimulationData(simulation);
      setCurrentPhase('simulation');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate simulation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitChallengeResponse = async (month: number, response: string) => {
    if (!response.trim()) return;
    
    setIsLoading(true);
    try {
      const apiResponse = await apiRequest("POST", "/api/challenge-feedback", {
        month,
        challenge: simulationData[month - 1]?.challenge || simulationData[month - 1]?.challenges?.[0],
        response,
        validationData,
        simulationData: simulationData[month - 1]
      });
      
      const data = await apiResponse.json();
      setChallengeFeedback(prev => ({ ...prev, [month]: data.feedback }));
      
      toast({
        title: "Val's Feedback Ready!",
        description: "See how you handled this challenge"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get feedback",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startValChat = (month: number) => {
    setActiveValChat(month);
    if (!valMessages[month]) {
      setValMessages(prev => ({
        ...prev,
        [month]: [{
          id: 1,
          isUser: false,
          text: `Hi! I'm Val, your startup mentor. I'm here to help you with Month ${month} challenges. What specific questions do you have about ${simulationData[month - 1]?.title.toLowerCase()} or the challenges you're facing?`,
          timestamp: new Date()
        }]
      }));
    }
  };

  const sendValMessage = async (month: number) => {
    if (!valQuestion.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      isUser: true,
      text: valQuestion,
      timestamp: new Date()
    };
    
    setValMessages(prev => ({
      ...prev,
      [month]: [...(prev[month] || []), userMessage]
    }));
    setValQuestion('');
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/val-chat", {
        month,
        question: valQuestion,
        conversationHistory: valMessages[month] || [],
        simulationData: simulationData[month - 1],
        validationData
      });
      
      const data = await response.json();
      const valResponse = {
        id: Date.now() + 1,
        isUser: false,
        text: data.response,
        timestamp: new Date()
      };
      
      setValMessages(prev => ({
        ...prev,
        [month]: [...(prev[month] || []), valResponse]
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get Val's response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSimulationRoadmap = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/generate-simulation-roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          validationData,
          simulationData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      // Handle text downloads for both reports
      if (reportType === 'pitch') {
        // Handle text pitch deck download
        const textContent = await response.text();
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${validationData?.idea.replace(/[^a-zA-Z0-9]/g, '_')}_PitchDeck.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Handle PDF download for business report
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${validationData?.idea.replace(/[^a-zA-Z0-9]/g, '_')}_BusinessReport.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      
      toast({
        title: "Download Started!",
        description: reportType === 'pitch' ? "Pitch deck downloaded" : "Business report downloaded"
      });
      
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="simulate" className="py-20 bg-gradient-to-br from-accent/25 via-background to-secondary/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg">
            <span className="w-8 h-8 bg-gradient-to-br from-accent to-secondary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              3
            </span>
            🎮 Startup Simulation
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black mb-6 gradient-text">
            Experience Your Startup Journey! <span className="text-4xl">🚀</span>
          </h2>
          <p className="text-xl text-foreground/70 mb-8">
            Chat with AI customers, discover insights, and see your 6-month startup simulation with realistic challenges and growth
          </p>
        </div>

        {!validationData && (
          <div className="text-center">
            <Card className="max-w-2xl mx-auto border-2 border-dashed border-muted-foreground/30 bg-muted/20">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold mb-3 text-muted-foreground">
                  Customer Simulation Will Appear Here
                </h3>
                <p className="text-muted-foreground">
                  Complete Steps 1 and 2 above to unlock customer interviews and startup simulation!
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {validationData && currentPhase === 'start' && (
          <div className="text-center">
            <Card className="max-w-2xl mx-auto border-2 border-primary/30 shadow-2xl shadow-primary/20 bg-gradient-to-br from-card/90 to-primary/5 backdrop-blur-sm animate-pulse-slow">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-2xl font-bold mb-4">Ready to Simulate Customer Conversations?</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Based on your validated idea, I'll create 3 AI customer personas for you to interview. 
                  These conversations will help refine your go-to-market strategy.
                </p>
                <Button
                  onClick={startSimulation}
                  disabled={isLoading}
                  size="lg"
                  className="px-8 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full" />
                      Generating Customers...
                    </div>
                  ) : (
                    <>
                      <span className="mr-2">🚀</span>
                      Simulate Customer Conversations
                      <span className="ml-2">✨</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {currentPhase === 'interviews' && (
          <div className="space-y-6">
            {/* Val's Instructions */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-green-500 shadow-lg animate-bounce-gentle">
                  <img 
                    src="/attached_assets/AIValFull_1754243498167.jpg" 
                    alt="Val - Your AI Mentor" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-lg border border-green-500/20 max-w-xs sm:max-w-md">
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-tight">
                    <span className="font-semibold text-green-600 dark:text-green-400">Val says:</span> I've created 3 potential customers for your idea! Chat with each one to understand their needs, then click DONE. After all THREE are complete, I'll generate your 6-month startup simulation! 🚀
                  </div>

                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {/* Customer List */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Your Potential Customers</h3>
                <p className="text-sm text-foreground/70">
                  Talk with each customer until you have your questions answered, then click <strong>DONE</strong>. After talking with customers, click the <strong>Generate Journey Simulation</strong> button below.
                </p>
              {customers.map((customer) => (
                <Card 
                  key={customer.id} 
                  className={`cursor-pointer transition-all ${
                    activeCustomer?.id === customer.id ? 'ring-2 ring-primary' : ''
                  } ${
                    interviewsCompleted.includes(customer.id) ? 'bg-green-50 dark:bg-green-900/20' : ''
                  }`}
                  onClick={() => startCustomerInterview(customer)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{customer.avatar}</div>
                      <div>
                        <h4 className="font-semibold">{customer.name}</h4>
                        <p className="text-sm text-muted-foreground">{customer.role}</p>
                        {interviewsCompleted.includes(customer.id) && (
                          <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {interviewsCompleted.length >= 1 && (
                <Button onClick={moveToSimulation} disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? (
                    <div className="flex items-center">
                      <span>Generating Simulation. Wait 30 seconds</span>
                      <span className="ml-1 animate-pulse">.</span>
                      <span className="animate-pulse" style={{animationDelay: '0.2s'}}>.</span>
                      <span className="animate-pulse" style={{animationDelay: '0.4s'}}>.</span>
                    </div>
                  ) : "Generate Journey Simulation"}
                </Button>
              )}
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              {activeCustomer ? (
                <Card className="h-96">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="mr-2" />
                      Interview with {activeCustomer.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                      {messages
                        .filter(m => m.customerId === activeCustomer.id)
                        .map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.isUser
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {message.text}
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="flex space-x-2">
                      <Textarea
                        placeholder="Ask about their pain points, budget, timeline..."
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        className="flex-1"
                        rows={2}
                      />
                      <div className="flex flex-col space-y-2">
                        <Button onClick={sendMessage} disabled={isLoading}>
                          Send
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={completeInterview}
                          size="sm"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <CardContent className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Click on a customer to start the interview
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
        )}

        {currentPhase === 'simulation' && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Your 6-Month Interactive Startup Journey</h3>
              <p className="text-muted-foreground">
                Based on your customer interviews - respond to challenges and chat with Val for guidance
              </p>
            </div>

            <div className="grid gap-8">
              {simulationData.map((phase, index) => (
                <Card key={phase.month} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/20 to-primary/40" />
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Month {phase.month}: {phase.title}</span>
                      <Badge variant="outline">
                        {phase.users?.toLocaleString()} Users
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Wins & Progress
                        </h4>
                        <ul className="space-y-1">
                          {phase.wins?.map((win, i) => (
                            <li key={i} className="text-sm text-green-600 dark:text-green-400">
                              • {win}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                          Challenges & Learnings
                        </h4>
                        <ul className="space-y-1">
                          {phase.challenges?.map((challenge, i) => (
                            <li key={i} className="text-sm text-amber-600 dark:text-amber-400">
                              • {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Interactive Challenge Section */}
                    {phase.challenge && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 mr-4">
                            <img 
                              src="/attached_assets/AIValFull_1754243498167.jpg" 
                              alt="Val - Your AI Mentor" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-blue-600 dark:text-blue-400">Challenge from Val</h4>
                            <p className="text-sm text-blue-500 dark:text-blue-300">How would you handle this situation?</p>
                          </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-300 dark:border-blue-700 mb-4">
                          <p className="font-medium text-gray-800 dark:text-gray-200">{phase.challenge}</p>
                        </div>

                        <div className="space-y-4">
                          <Textarea
                            placeholder="Type your response here... How would you address this challenge?"
                            value={challengeResponses[phase.month] || ''}
                            onChange={(e) => setChallengeResponses(prev => ({ ...prev, [phase.month]: e.target.value }))}
                            rows={3}
                            className="w-full"
                          />
                          
                          <div className="flex space-x-3">
                            <Button
                              onClick={() => submitChallengeResponse(phase.month, challengeResponses[phase.month] || '')}
                              disabled={!challengeResponses[phase.month]?.trim() || isLoading}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {isLoading ? "Getting Feedback..." : "Get Val's Feedback"}
                            </Button>
                            
                            <Button
                              variant="outline"
                              onClick={() => startValChat(phase.month)}
                              className="border-purple-500 text-white hover:bg-purple-50 dark:hover:bg-purple-950/30 bg-black"
                            >
                              <MessageCircle className="w-4 h-4 mr-2 text-white" />
                              Chat with Val
                            </Button>
                          </div>

                          {/* AI Feedback Display */}
                          {challengeFeedback[phase.month] && (
                            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex items-center mb-2">
                                <img 
                                  src="/attached_assets/AIValFull_1754243498167.jpg" 
                                  alt="Val" 
                                  className="w-6 h-6 rounded-full mr-2"
                                />
                                <span className="font-semibold text-green-600 dark:text-green-400">Val's Feedback:</span>
                              </div>
                              <p className="text-sm text-green-700 dark:text-green-300 whitespace-pre-line">
                                {challengeFeedback[phase.month]}
                              </p>
                            </div>
                          )}

                          {/* Val Chat Interface */}
                          {activeValChat === phase.month && (
                            <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                              <div className="flex items-center mb-3">
                                <img 
                                  src="/attached_assets/AIValFull_1754243498167.jpg" 
                                  alt="Val" 
                                  className="w-6 h-6 rounded-full mr-2"
                                />
                                <span className="font-semibold text-purple-600 dark:text-purple-400">Chat with Val - Month {phase.month}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setActiveValChat(null)}
                                  className="ml-auto"
                                >
                                  ✕
                                </Button>
                              </div>
                              
                              <div className="max-h-48 overflow-y-auto mb-3 space-y-2">
                                {valMessages[phase.month]?.map((msg, i) => (
                                  <div
                                    key={i}
                                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                                  >
                                    <div
                                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                        msg.isUser 
                                          ? 'bg-blue-600 text-white' 
                                          : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border'
                                      }`}
                                    >
                                      {msg.text}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="flex space-x-2">
                                <Textarea
                                  placeholder="Ask Val about this month's challenges..."
                                  value={valQuestion}
                                  onChange={(e) => setValQuestion(e.target.value)}
                                  rows={2}
                                  className="flex-1"
                                />
                                <Button
                                  onClick={() => sendValMessage(phase.month)}
                                  disabled={!valQuestion.trim() || isLoading}
                                  className="self-end bg-purple-600 hover:bg-purple-700"
                                >
                                  Send
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Users: {phase.users?.toLocaleString()}</span>
                        <span>Growth Rate: {index > 0 ? '+' + Math.round(((phase.users - simulationData[index-1]?.users || 0) / (simulationData[index-1]?.users || 1)) * 100) + '%' : 'Launch'}</span>
                      </div>
                      <Progress value={(phase.users / Math.max(...simulationData.map(p => p.users))) * 100} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center space-y-4">
              <p className="text-lg font-medium text-green-600">
                🎉 Simulation Complete!
              </p>
              <p className="text-sm text-muted-foreground text-center max-w-md mx-auto">
                You've successfully validated your startup idea through customer interviews and explored your 6-month journey. Use these insights to move forward with confidence!
              </p>
            </div>

            {/* Bubble CTA Section */}
            <div className="mt-12">
              <Card className="shadow-lg border-2 border-purple-400 hover:border-purple-500 shadow-purple-200/50 dark:shadow-purple-900/50 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 max-w-4xl mx-auto">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <a 
                      href="https://bubble.pxf.io/e1kn1O" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex-shrink-0"
                    >
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg p-2 hover:shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer">
                        <img 
                          alt="Bubble logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </a>
                    
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wide">
                        Website Builder
                      </div>
                      <h3 className="text-xl font-bold mb-2">Ready to Build Your Landing Page?</h3>
                      <p className="text-muted-foreground mb-4">
                        Create a professional landing page mockup in minutes. No coding required - perfect for validating your idea with real visitors.
                      </p>
                    </div>
                    
                    <Button 
                      asChild 
                      size="lg"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <a 
                        href="https://bubble.pxf.io/e1kn1O" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        Start Building
                        <span className="ml-2">→</span>
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gamma CTA Section */}
            <div className="mt-6">
              <Card className="shadow-lg border-2 border-purple-400 hover:border-purple-500 shadow-purple-200/50 dark:shadow-purple-900/50 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 max-w-4xl mx-auto">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <a 
                      href="https://try.gamma.app/9mp9k1gqybqf" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex-shrink-0"
                    >
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg p-2 hover:shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer">
                        <img 
                          src="/attached_assets/gamma_1755201488532.png"
                          alt="Gamma logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </a>
                    
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wide">
                        Presentations
                      </div>
                      <h3 className="text-xl font-bold mb-2">Create Your Pitch Deck</h3>
                      <p className="text-muted-foreground mb-4">
                        Build beautiful pitch decks powered by AI. Turn your idea validation into compelling presentation slides in minutes.
                      </p>
                    </div>
                    
                    <Button 
                      asChild 
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <a 
                        href="https://try.gamma.app/9mp9k1gqybqf" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        Create Deck
                        <span className="ml-2">→</span>
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}