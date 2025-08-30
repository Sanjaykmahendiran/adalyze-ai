import { jsPDF } from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export interface ApiResponse {
  ad_id: number;
  title: string;
  ad_type: string;
  video?: string;
  images: string[];
  uploaded_on: string;
  updated_on?: string;
  status: number;
  user_id: number;
  adanaly_id: number;
  ad_upload_id: number;
  industry: string;
  score_out_of_100: number;
  platform_suits: string[];
  platform_notsuits: string[];
  issues: string[];
  suggestions: string[];
  feedback_designer: string[];
  feedback_digitalmark: string[];
  visual_clarity: number;
  emotional_appeal: number;
  primary_emotion: string;
  text_visual_balance: number;
  cta_visibility: number;
  color_harmony: number;
  dominant_colors: string[];
  suggested_colors: string[];
  font_feedback: string;
  layout_symmetry_score: number;
  color_harmony_feedback: string;
  brand_alignment: number;
  text_readability: number;
  image_quality: number;
  scroll_stoppower: string;
  estimated_ctr: string;
  conversion_probability: string;
  roi_min: number;
  roi_max: number;
  budget_level: string;
  expected_cpm: string;
  predicted_reach: number;
  spend_efficiency: string;
  faces_detected: number;
  logo_visibility_score: number;
  text_percentage_score: number;
  urgency_trigger_score: number;
  fomo_score: number;
  trust_signal_score: number;
  engagement_score: number;
  viral_potential_score: number;
  budget_utilization_score: number;
  confidence_score: number;
  match_score: number;
  quick_win_tip: string;
  shareability_comment: string;
  emotional_boost_suggestions: string[];
  emotional_alignment: string;
  top_audience: string[];
  industry_audience: string[];
  mismatch_warnings: string[];
  created_date: string;
  ad_copies: Array<{
    platform: string;
    tone: string;
    copy_text: string;
    created_on: string;
  }>;
}

export const generatePDFReport = async (apiData: ApiResponse) => {
  if (!apiData) return;

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  let yPos = 20;

  // Helper Functions
  const checkNewPage = (requiredHeight: number) => {
    if (yPos + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, i: number) => {
      pdf.text(line, x, y + i * 5);
    });
    return lines.length * 5;
  };

  const addSectionHeader = (title: string, icon = "") => {
    checkNewPage(14);
    pdf.setFontSize(15);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${icon} ${title}`, margin, yPos);
    yPos += 8;
    pdf.setLineWidth(0.4);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const safeArray = (arr: any): any[] => {
    return Array.isArray(arr) ? arr : [];
  };

  try {
    // Header
    pdf.setFontSize(22).setFont("helvetica", "bold");
    pdf.text("AD ANALYSIS REPORT", pageWidth / 2, yPos, { align: "center" });
    yPos += 12;

    pdf.setFontSize(14).setFont("helvetica", "normal");
    pdf.text(apiData.title || "Untitled Ad", pageWidth / 2, yPos, { align: "center" });
    yPos += 8;

    pdf.setFontSize(9);
    pdf.text(
      `Generated on: ${new Date().toLocaleDateString()} | AI-powered insights`,
      pageWidth / 2,
      yPos,
      { align: "center" }
    );
    yPos += 20;

    // Ad Overview
    addSectionHeader("AD OVERVIEW");
    pdf.setFontSize(11).setFont("helvetica", "bold");
    pdf.text("Basic Information", margin, yPos);
    yPos += 5;

    pdf.setFontSize(9).setFont("helvetica", "normal");
    pdf.text(`Industry: ${apiData.industry || 'N/A'}`, margin, yPos);
    pdf.text(`Ad Type: ${apiData.ad_type || 'N/A'}`, margin + 80, yPos);
    yPos += 5;
    pdf.text(`Upload Date: ${apiData.uploaded_on ? formatDate(apiData.uploaded_on) : 'N/A'}`, margin, yPos);
    yPos += 10;

    // Performance Scores
    const scoreBoxWidth = (pageWidth - 2 * margin - 10) / 2;
    const scoreBoxHeight = 12;

    const drawScoreRow = (leftLabel: string, leftValue: string, rightLabel: string, rightValue: string) => {
      checkNewPage(scoreBoxHeight + 6);
      pdf.rect(margin, yPos, scoreBoxWidth, scoreBoxHeight);
      pdf.rect(margin + scoreBoxWidth + 10, yPos, scoreBoxWidth, scoreBoxHeight);

      pdf.setFontSize(9).setFont("helvetica", "normal");
      pdf.text(leftLabel, margin + 2, yPos + 5);
      pdf.setFont("helvetica", "bold");
      pdf.text(leftValue, margin + scoreBoxWidth - 5, yPos + 5, { align: "right" });

      pdf.setFont("helvetica", "normal");
      pdf.text(rightLabel, margin + scoreBoxWidth + 12, yPos + 5);
      pdf.setFont("helvetica", "bold");
      pdf.text(rightValue, margin + 2 * scoreBoxWidth + 5, yPos + 5, { align: "right" });

      yPos += scoreBoxHeight + 4;
    };

    drawScoreRow(
      "Performance Score",
      `${apiData.score_out_of_100 || 0}/100`,
      "Confidence Score",
      `${apiData.confidence_score || 0}/100`
    );
    drawScoreRow(
      "Match Score",
      `${apiData.match_score || 0}/100`,
      "Engagement Score",
      `${apiData.engagement_score || 0}/100`
    );

    yPos += 10;

    // Engagement Metrics
    addSectionHeader("ENGAGEMENT & PERFORMANCE METRICS");
    const halfWidth = (pageWidth - 2 * margin - 10) / 2;

    pdf.setFontSize(11).setFont("helvetica", "bold");
    pdf.text("Engagement Metrics", margin, yPos);
    pdf.text("Technical Analysis", margin + halfWidth + 10, yPos);
    yPos += 6;

    pdf.setFontSize(9).setFont("helvetica", "normal");
    
    const engagementMetrics = [
      { label: "Viral Potential", value: `${apiData.viral_potential_score || 0}/100` },
      { label: "FOMO Score", value: `${apiData.fomo_score || 0}/100` },
      { label: "Trust Signal", value: `${apiData.trust_signal_score || 0}/100` },
      { label: "Urgency Trigger", value: `${apiData.urgency_trigger_score || 0}/100` }
    ];

    const technicalMetrics = [
      { label: "Faces Detected", value: `${apiData.faces_detected || 0}` },
      { label: "Logo Visibility", value: `${apiData.logo_visibility_score || 0}/100` },
      { label: "Text Percentage", value: `${apiData.text_percentage_score || 0}/100` },
      { label: "Budget Utilization", value: `${apiData.budget_utilization_score || 0}/100` }
    ];

    let leftY = yPos;
    let rightY = yPos;

    engagementMetrics.forEach((metric, i) => {
      pdf.text(`${metric.label}: ${metric.value}`, margin, leftY);
      leftY += 5;
      
      if (i < technicalMetrics.length) {
        pdf.text(`${technicalMetrics[i].label}: ${technicalMetrics[i].value}`, margin + halfWidth + 10, rightY);
        rightY += 5;
      }
    });

    yPos = Math.max(leftY, rightY) + 10;

    // Traffic & Budget Insights
    addSectionHeader("TRAFFIC & BUDGET INSIGHTS");
    
    pdf.setFontSize(9).setFont("helvetica", "normal");
    pdf.text(`Scroll Stop Power: ${apiData.scroll_stoppower || 'N/A'}`, margin, yPos);
    pdf.text(`Estimated CTR: ${apiData.estimated_ctr || 'N/A'}`, margin + halfWidth + 10, yPos);
    yPos += 5;
    pdf.text(`Conversion Probability: ${apiData.conversion_probability || 'N/A'}`, margin, yPos);
    pdf.text(`Expected CPM: ${apiData.expected_cpm || 'N/A'}`, margin + halfWidth + 10, yPos);
    yPos += 5;
    pdf.text(`Predicted Reach: ${apiData.predicted_reach || 'N/A'}`, margin, yPos);
    pdf.text(`Spend Efficiency: ${apiData.spend_efficiency || 'N/A'}`, margin + halfWidth + 10, yPos);
    yPos += 5;
    pdf.text(`ROI Range: ${apiData.roi_min || 0}x - ${apiData.roi_max || 0}x`, margin, yPos);
    pdf.text(`Budget Level: ${apiData.budget_level || 'N/A'}`, margin + halfWidth + 10, yPos);
    yPos += 15;

    // Visual Quality Assessment
    addSectionHeader("VISUAL QUALITY ASSESSMENT");
    
    const visualMetrics = [
      { label: "Visual Clarity", value: apiData.visual_clarity || 0 },
      { label: "Emotional Appeal", value: apiData.emotional_appeal || 0 },
      { label: "Text-Visual Balance", value: apiData.text_visual_balance || 0 },
      { label: "CTA Visibility", value: apiData.cta_visibility || 0 },
      { label: "Color Harmony", value: apiData.color_harmony || 0 },
      { label: "Brand Alignment", value: apiData.brand_alignment || 0 },
      { label: "Text Readability", value: apiData.text_readability || 0 },
      { label: "Image Quality", value: apiData.image_quality || 0 }
    ];

    visualMetrics.forEach((metric, i) => {
      if (i % 2 === 0) {
        pdf.text(`${metric.label}: ${Math.round(metric.value)}/100`, margin, yPos);
      } else {
        pdf.text(`${metric.label}: ${Math.round(metric.value)}/100`, margin + halfWidth + 10, yPos);
        yPos += 5;
      }
    });

    yPos += 10;

    // Emotional Analysis
    addSectionHeader("EMOTIONAL & COLOR ANALYSIS");
    
    pdf.text(`Primary Emotion: ${apiData.primary_emotion || 'N/A'}`, margin, yPos);
    yPos += 5;
    pdf.text(`Emotional Alignment: ${apiData.emotional_alignment || 'N/A'}`, margin, yPos);
    yPos += 5;
    pdf.text(`Layout Symmetry Score: ${apiData.layout_symmetry_score || 0}/100`, margin, yPos);
    yPos += 10;

    if (apiData.font_feedback) {
      pdf.setFontSize(10).setFont("helvetica", "bold");
      pdf.text("Font Feedback:", margin, yPos);
      yPos += 5;
      pdf.setFontSize(9).setFont("helvetica", "normal");
      const fontHeight = addWrappedText(apiData.font_feedback, margin, yPos, pageWidth - 2 * margin);
      yPos += fontHeight + 5;
    }

    if (apiData.color_harmony_feedback) {
      pdf.setFontSize(10).setFont("helvetica", "bold");
      pdf.text("Color Harmony Feedback:", margin, yPos);
      yPos += 5;
      pdf.setFontSize(9).setFont("helvetica", "normal");
      const colorHeight = addWrappedText(apiData.color_harmony_feedback, margin, yPos, pageWidth - 2 * margin);
      yPos += colorHeight + 10;
    }

    // Quick Wins & Insights
    addSectionHeader("QUICK WINS & INSIGHTS");
    
    if (apiData.quick_win_tip) {
      pdf.setFontSize(10).setFont("helvetica", "bold");
      pdf.text("Quick Win Tip:", margin, yPos);
      yPos += 5;
      pdf.setFontSize(9).setFont("helvetica", "normal");
      const tipHeight = addWrappedText(apiData.quick_win_tip, margin, yPos, pageWidth - 2 * margin);
      yPos += tipHeight + 5;
    }

    if (apiData.shareability_comment) {
      pdf.setFontSize(10).setFont("helvetica", "bold");
      pdf.text("Shareability Comment:", margin, yPos);
      yPos += 5;
      pdf.setFontSize(9).setFont("helvetica", "normal");
      const shareHeight = addWrappedText(apiData.shareability_comment, margin, yPos, pageWidth - 2 * margin);
      yPos += shareHeight + 10;
    }

    // Issues & Suggestions
    addSectionHeader("ISSUES & SUGGESTIONS");
    
    pdf.setFontSize(11).setFont("helvetica", "bold");
    pdf.text("Issues Detected", margin, yPos);
    pdf.text("Suggestions for Improvement", margin + halfWidth + 10, yPos);
    yPos += 6;

    pdf.setFontSize(9).setFont("helvetica", "normal");
    const issues = safeArray(apiData.issues);
    const suggestions = safeArray(apiData.suggestions);
    const maxItems = Math.max(issues.length, suggestions.length);

    for (let i = 0; i < maxItems; i++) {
      let issueHeight = 0, suggHeight = 0;
      if (i < issues.length) {
        issueHeight = addWrappedText(`• ${issues[i]}`, margin, yPos, halfWidth - 5);
      }
      if (i < suggestions.length) {
        suggHeight = addWrappedText(`• ${suggestions[i]}`, margin + halfWidth + 10, yPos, halfWidth - 5);
      }
      yPos += Math.max(issueHeight, suggHeight, 6) + 2;
      checkNewPage(10);
    }

    // Ad Copies
    const adCopies = safeArray(apiData.ad_copies);
    if (adCopies.length > 0) {
      addSectionHeader("AI-GENERATED AD COPIES");
      adCopies.forEach((adCopy) => {
        checkNewPage(15);
        pdf.setFontSize(10).setFont("helvetica", "bold");
        pdf.text(`${adCopy.platform || 'N/A'} | ${adCopy.tone || 'N/A'}`, margin, yPos);
        yPos += 6;
        pdf.setFontSize(9).setFont("helvetica", "normal");
        const h = addWrappedText(adCopy.copy_text || 'No copy text available', margin, yPos, pageWidth - 2 * margin);
        yPos += h + 4;
      });
    }

    // Footer
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8).setFont("helvetica", "normal");
      pdf.text(
        `Page ${i} of ${totalPages} | Generated by AdAlyze AI`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    const fileName = `${(apiData.title || 'Ad_Analysis').replace(/[^a-z0-9]/gi, "_")}_Analysis_Report.pdf`;
    pdf.save(fileName);

  } catch (e) {
    console.error("PDF generation failed", e);
    throw new Error("Failed to generate PDF report. Please try again.");
  }
};
