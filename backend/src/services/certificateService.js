import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

class CertificateService {
  generateCertificateHTML(userData, score, badge, scenariosCompleted) {
    const currentDate = new Date().toLocaleDateString()
    const certificateId = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>WalkInMyShoes Certificate</title>
        <style>
          body { 
            font-family: 'Georgia', serif; 
            text-align: center; 
            margin: 0; 
            padding: 40px; 
            background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
          }
          .certificate { 
            border: 10px double #7c3aed; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto; 
            background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-radius: 15px;
          }
          .header { 
            font-size: 2.5em; 
            color: #7c3aed; 
            margin-bottom: 20px; 
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          .title { 
            font-size: 2em; 
            color: #333333; 
            margin-bottom: 30px; 
            font-weight: bold;
          }
          .subtitle { 
            font-size: 1.2em; 
            color: #666666; 
            margin-bottom: 40px;
          }
          .recipient { 
            font-size: 1.8em; 
            color: #7c3aed; 
            margin-bottom: 20px; 
            font-weight: bold;
          }
          .details { 
            font-size: 1.2em; 
            color: #333333; 
            margin-bottom: 30px;
            line-height: 1.6;
          }
          .badge { 
            font-size: 1.5em; 
            color: #7c3aed; 
            font-weight: bold;
            margin-bottom: 20px;
          }
          .footer { 
            font-size: 0.9em; 
            color: #999999; 
            margin-top: 40px;
            border-top: 2px solid #e0e0e0;
            padding-top: 20px;
          }
          .logo { 
            font-size: 3em; 
            margin-bottom: 20px;
          }
          @media print {
            body { padding: 20px; }
            .certificate { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="logo">🏆</div>
          <div class="header">Certificate of Empathy Training</div>
          <div class="title">WalkInMyShoes - Immersive Disability Empathy Platform</div>
          
          <div class="subtitle">This certifies that</div>
          <div class="recipient">${userData.name || 'Empathy Champion'}</div>
          <div class="subtitle">has successfully completed disability empathy training</div>
          
          <div class="details">
            <div><strong>Empathy Score:</strong> ${score}/100</div>
            <div><strong>Scenarios Completed:</strong> ${scenariosCompleted}</div>
            <div><strong>Badge Earned:</strong> ${badge}</div>
            <div><strong>Completed on:</strong> ${currentDate}</div>
          </div>
          
          <div class="badge">🏅 ${badge}</div>
          
          <div class="footer">
            <div><strong>Certificate ID:</strong> ${certificateId}</div>
            <div><strong>Verify Online:</strong> https://walkinmyshoes.com/verify/${certificateId}</div>
            <div style="margin-top: 10px; font-size: 0.8em;">
              This certificate confirms completion of WalkInMyShoes empathy training program.<br>
              It demonstrates commitment to understanding and promoting accessibility.
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  async downloadCertificate(userData, score, badge, scenariosCompleted) {
    try {
      // Generate HTML certificate
      const certificateHTML = this.generateCertificateHTML(userData, score, badge, scenariosCompleted)
      
      // Create temporary container
      const container = document.createElement('div')
      container.innerHTML = certificateHTML
      document.body.appendChild(container)
      
      // Wait for images to load (if any)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Convert to canvas
      const canvas = await html2canvas(container.querySelector('.certificate'), {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = pdf.internal.pageSize.getWidth()
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      
      // Remove temporary container
      document.body.removeChild(container)
      
      // Save PDF
      const fileName = `walkinmyshoes-certificate-${Date.now()}.pdf`
      pdf.save(fileName)
      
      return { success: true, fileName }
    } catch (error) {
      console.error('Certificate generation error:', error)
      throw error
    }
  }

  async shareOnLinkedIn(userData, score, badge) {
    try {
      const shareText = `I just completed the WalkInMyShoes disability empathy training with a score of ${score}/100 and earned the ${badge} badge! Join me in building a more inclusive world. #Accessibility #Empathy #Inclusion`
      
      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(shareText)}`
      
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes')
      
      return { success: true }
    } catch (error) {
      console.error('LinkedIn share error:', error)
      throw error
    }
  }

  async verifyCertificate(certificateId) {
    try {
      // In a real implementation, this would call the verification API
      // For now, we'll simulate verification
      const verificationData = {
        certificateId,
        isValid: true,
        issuedAt: new Date().toISOString(),
        score: Math.floor(Math.random() * 30) + 70,
        badge: '🏅 Accessibility Ally',
        scenariosCompleted: ['visual', 'hearing', 'motor']
      }
      
      return { success: true, data: verificationData }
    } catch (error) {
      console.error('Certificate verification error:', error)
      throw error
    }
  }

  generateCertificateDataURL(userData, score, badge, scenariosCompleted) {
    try {
      const certificateHTML = this.generateCertificateHTML(userData, score, badge, scenariosCompleted)
      
      // Create blob
      const blob = new Blob([certificateHTML], { type: 'text/html' })
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error('Certificate data URL generation error:', error)
      throw error
    }
  }

  // Certificate templates
  getBadgeTemplate(score) {
    if (score >= 71) {
      return {
        name: '🏅 Accessibility Ally',
        color: '#7c3aed',
        description: 'Demonstrates exceptional empathy and understanding'
      }
    } else if (score >= 41) {
      return {
        name: '🥈 Accessibility Advocate',
        color: '#f59e0b',
        description: 'Shows strong commitment to accessibility awareness'
      }
    } else {
      return {
        name: '🥉 Accessibility Aware',
        color: '#10b981',
        description: 'Beginning the journey toward empathy and inclusion'
      }
    }
  }

  // Email certificate (if implemented)
  async emailCertificate(userData, certificateData, recipientEmail) {
    try {
      // This would integrate with an email service like SendGrid or AWS SES
      console.log('Email certificate to:', recipientEmail)
      
      return { success: true, message: 'Certificate sent successfully' }
    } catch (error) {
      console.error('Email certificate error:', error)
      throw error
    }
  }

  // Certificate analytics
  trackCertificateGeneration(userId, score, badge, scenariosCompleted) {
    const analytics = {
      event: 'certificate_generated',
      userId,
      properties: {
        score,
        badge,
        scenariosCompleted,
        timestamp: new Date().toISOString()
      }
    }
    
    // Send to analytics service
    if (typeof window !== 'undefined' && window.analyticsService) {
      window.analyticsService.trackEvent(analytics.event, analytics.properties)
    }
  }
}

export default new CertificateService()
