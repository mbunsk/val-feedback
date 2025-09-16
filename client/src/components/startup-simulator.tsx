import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { 
  MessageCircle, 
  Users, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Target,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Play,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";

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
  const { user } = useAuth();

  // Reset phase when validationData changes
  useEffect(() => {
    if (!validationData) {
      setCurrentPhase('start');
      setCustomers([]);
      setActiveCustomer(null);
      setMessages([]);
      setCurrentQuestion("");
      setInterviewsCompleted([]);
      setSimulationData([]);
      setChallengeResponses({});
      setChallengeFeedback({});
      setActiveValChat(null);
      setValMessages({});
      setValQuestion('');
    }
  }, [validationData]);

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

      // Save simulation session to database
      if (user && validationData) {
        try {
          await apiRequest("POST", "/api/simulation-session", {
            userId: user.id,
            validationId: null, // validationData doesn't have an id
            idea: validationData.idea,
            targetCustomer: validationData.targetCustomer,
            problemSolved: validationData.problemSolved,
            customerPersonas: customers,
            conversationHistory: messages,
            simulationData: simulation
          });
        } catch (error) {
          console.error("Failed to save simulation session:", error);
          // Don't show error to user as this is not critical
        }
      }
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
        challenge: simulationData[month - 1]?.challenges?.[0] || '',
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
        throw new Error('Failed to generate simulation roadmap');
      }

      // Handle text download for simulation roadmap
      const textContent = await response.text();
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${validationData?.idea.replace(/[^a-zA-Z0-9]/g, '_')}_SimulationRoadmap.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started!",
        description: "Simulation roadmap downloaded"
      });
      
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to generate simulation roadmap",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section></section>
  );
}