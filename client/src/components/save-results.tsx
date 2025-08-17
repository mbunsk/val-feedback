import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface SaveResultsProps {
  validationData: {
    idea: string;
    targetCustomer: string;
    problemSolved: string;
    feedback: string;
  };
}

export default function SaveResults({ validationData }: SaveResultsProps) {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    setGenerating(true);
    try {
      // Create a clean text version of the feedback with proper sections
      let cleanFeedback = validationData.feedback
        // Remove code blocks and markdown artifacts first
        .replace(/```html/gi, '')
        .replace(/```/g, '')
        .replace(/`/g, '')
        // Replace HTML elements with proper spacing
        .replace(/<div[^>]*>/gi, '\n\n')
        .replace(/<\/div>/gi, '')
        .replace(/<h3[^>]*>/gi, '\n\n**')
        .replace(/<\/h3>/gi, '**\n')
        .replace(/<h4[^>]*>/gi, '\n\n**')
        .replace(/<\/h4>/gi, '**\n')
        .replace(/<p[^>]*>/gi, '\n')
        .replace(/<\/p>/gi, '')
        .replace(/<ul[^>]*>/gi, '\n')
        .replace(/<\/ul>/gi, '')
        .replace(/<li[^>]*>/gi, '\n• ')
        .replace(/<\/li>/gi, '')
        .replace(/<strong[^>]*>/gi, '**')
        .replace(/<\/strong>/gi, '**')
        .replace(/<em[^>]*>/gi, '')
        .replace(/<\/em>/gi, '')
        // Remove any remaining HTML tags
        .replace(/<[^>]*>/g, '')
        // Clean HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&hellip;/g, '...')
        // Clean up excessive whitespace
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s{2,}/g, ' ')
        .trim();

      // Simple approach - split feedback into organized sections by detecting headers
      const feedbackSections = [];
      
      // Split by double newlines first to separate major sections  
      const majorSections = cleanFeedback.split(/\n\n+/);
      
      let currentSection = { title: "", content: "" };
      
      for (const section of majorSections) {
        const lines = section.trim().split('\n');
        if (lines.length === 0) continue;
        
        const firstLine = lines[0].trim();
        
        // Check if first line looks like a header (short line, contains key words, no periods at end)
        const isHeader = firstLine.length < 100 && 
                        !firstLine.endsWith('.') && 
                        (firstLine.includes('Score') || firstLine.includes('Special') || 
                         firstLine.includes('Market') || firstLine.includes('Customer') || 
                         firstLine.includes('Steps') || firstLine.includes('Revenue') || 
                         firstLine.includes('Timeline') || firstLine.includes('Risk') || 
                         firstLine.includes('Success') || firstLine.includes('Suggestion') ||
                         firstLine.includes('Simulation') || firstLine.includes('Analysis') ||
                         firstLine.match(/^(Overall|What|Find|Next|Launch|One|Business)/));
        
        if (isHeader) {
          // Save previous section if it has content
          if (currentSection.title && currentSection.content.trim()) {
            feedbackSections.push(currentSection);
          }
          
          // Start new section
          currentSection = {
            title: firstLine,
            content: lines.slice(1).join('\n').trim()
          };
        } else {
          // Add to current section
          if (currentSection.title) {
            currentSection.content += '\n\n' + section;
          } else {
            // First section without clear header
            currentSection = {
              title: "Analysis Overview",
              content: section
            };
          }
        }
      }
      
      // Add the last section
      if (currentSection.title && currentSection.content.trim()) {
        feedbackSections.push(currentSection);
      }
      
      // If no sections were found, create them from the full text
      if (feedbackSections.length === 0) {
        feedbackSections.push({
          title: "Val's Complete Analysis",
          content: cleanFeedback
        });
      }
      
      // Create PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("STARTUP IDEA VALIDATION REPORT", pageWidth / 2, yPosition, { align: "center" });
      yPosition += lineHeight * 2;

      // Subtitle
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Generated by ValidatorAI.com", pageWidth / 2, yPosition, { align: "center" });
      yPosition += lineHeight;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += lineHeight * 3;

      // Content sections - include individual feedback sections
      const sections = [
        { title: "IDEA", content: validationData.idea },
        { title: "TARGET CUSTOMER", content: validationData.targetCustomer },
        { title: "PROBLEM SOLVED", content: validationData.problemSolved },
        ...feedbackSections.map(section => ({
          title: `VAL'S ANALYSIS: ${section.title.toUpperCase()}`,
          content: section.content.trim()
        }))
      ];

      sections.forEach((section, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = margin;
        }

        // Add separator line (except for first section)
        if (index > 0) {
          doc.setLineWidth(0.5);
          doc.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
          yPosition += 5;
        }

        // Section title with background box
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 12, 'F');
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text(section.title, margin + 5, yPosition + 3);
        yPosition += lineHeight * 2.5;

        // Section content
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const splitText = doc.splitTextToSize(section.content, pageWidth - 2 * margin - 10);
        splitText.forEach((line: string) => {
          if (yPosition > pageHeight - 25) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin + 5, yPosition);
          yPosition += lineHeight;
        });
        yPosition += lineHeight * 2;
      });

      // Footer
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      const footerText = "Generated by ValidatorAI.com - Your AI Startup Mentor";
      doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });

      // Save the PDF with a short, unique name
      const ideaWords = validationData.idea.split(' ').slice(0, 3).join('-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits for uniqueness
      doc.save(`val-report-${ideaWords}-${timestamp}.pdf`);

      toast({
        title: "PDF Downloaded!",
        description: "Your validation report has been saved as a PDF",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="shadow-lg border-2 border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-green-500/10">
      <CardContent className="p-6">
        <h4 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
          💾 Save Your Results
        </h4>
        <p className="text-sm text-foreground/80 mb-4">
          Download your complete validation report to keep and share with others!
        </p>
        
        <div className="flex justify-center">
          <Button
            onClick={generatePDF}
            disabled={generating}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
{generating ? "Generating PDF..." : "Download PDF Report"}
          </Button>
        </div>
        
        {/* Encouragement section */}
        <div style={{ display: 'none' }}   className="mt-8 text-center p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
          <div className="mb-4"></div>
          <div className="mb-4"></div>
          <p className="text-foreground/80 text-lg mb-2">
            <span className="font-semibold">Great work exploring your idea!</span> 🎉
          </p>
          <p className="text-foreground/70 mb-3">
            Here is the next step to validate. Create a free landing page mockup to visualize your idea clearly. It's free.
          </p>
          <div className="flex justify-center">
            <ArrowDown className="w-6 h-6 text-primary animate-bounce" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}