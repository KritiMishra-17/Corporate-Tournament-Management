const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Event = require('./models/Event'); // Import Event model

// Certificate generator class
class CertificateGenerator {
    constructor() {
        // Load fonts
        this.regularFont = 'Helvetica';
        this.boldFont = 'Helvetica-Bold';
    }

    // Generate participant certificate
    async generateParticipantCertificate(data) {
        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4'
        });

        // Set up document
        this.setupDocument(doc);
        
        // Add certificate content
        doc.font(this.boldFont)
           .fontSize(30)
           .text('Certificate of Participation', { align: 'center' });

        doc.moveDown();
        doc.font(this.regularFont)
           .fontSize(16)
           .text('This is to certify that', { align: 'center' });

        doc.moveDown();
        doc.font(this.boldFont)
           .fontSize(24)
           .text(data.participantName, { align: 'center' });

        doc.moveDown();
        doc.font(this.regularFont)
           .fontSize(16)
           .text(`participated in ${data.eventName}`, { align: 'center' })
           .text(`as a member of team "${data.teamName}"`, { align: 'center' });
           
        doc.moveDown();
        doc.text(`Date: ${new Date(data.eventDate).toLocaleDateString()}`, { align: 'center' });

        return doc;
    }

    // Generate winner certificate
    async generateWinnerCertificate(data) {
        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4'
        });

        // Set up document
        this.setupDocument(doc);

        // Add certificate content
        doc.font(this.boldFont)
           .fontSize(30)
           .fillColor('#1a365d')
           .text('Certificate of Achievement', { align: 'center' });

        doc.moveDown();
        doc.font(this.regularFont)
           .fontSize(16)
           .text('This is to certify that', { align: 'center' });

        doc.moveDown();
        doc.font(this.boldFont)
           .fontSize(24)
           .text(data.participantName, { align: 'center' });

        doc.moveDown();
        doc.font(this.regularFont)
           .fontSize(16)
           .text(`secured ${data.position} position`, { align: 'center' })
           .text(`in ${data.eventName}`, { align: 'center' })
           .text(`as a member of team "${data.teamName}"`, { align: 'center' })
           .text(`with the codename "${data.codeName}"`, { align: 'center' });

        doc.moveDown();
        doc.text(`Date: ${new Date(data.eventDate).toLocaleDateString()}`, { align: 'center' });

        return doc;
    }

    // Common document setup
    setupDocument(doc) {
        // Add border
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
           .stroke();

        // Add background styling
        doc.fillColor('#f3f4f6')
           .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
           .fill();
        
        doc.fillColor('#000000'); // Reset fill color for text
    }
}

// Create a single instance of the generator
const certificateGenerator = new CertificateGenerator();

// Export route setup function
module.exports = function setupCertificateRoutes(app) {
    // Participant certificate route
    app.get('/events/:eventId/teams/:teamId/members/:memberId/certificate', async (req, res) => {
        try {
            const event = await Event.findById(req.params.eventId);
            if (!event) {
                return res.status(404).send('Event not found');
            }

            // Find team and member
            const team = event.teams.find(t => t._id.toString() === req.params.teamId);
            if (!team) {
                return res.status(404).send('Team not found');
            }

            const member = team.members.find(m => m._id.toString() === req.params.memberId);
            if (!member) {
                return res.status(404).send('Member not found');
            }

            const certificateData = {
                participantName: member.realName || member.email.split('@')[0],
                eventName: event.name,
                teamName: team.teamName,
                codeName: member.codeName,
                eventDate: event.date
            };

            const doc = await certificateGenerator.generateParticipantCertificate(certificateData);

            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=certificate-${member.codeName}.pdf`);

            // Pipe the PDF document to the response
            doc.pipe(res);
            doc.end();

        } catch (error) {
            console.error('Certificate generation error:', error);
            res.status(500).send('Error generating certificate');
        }
    });

    // Winner certificate route
    app.get('/events/:eventId/teams/:teamId/members/:memberId/winner-certificate/:position', async (req, res) => {
        try {
            const event = await Event.findById(req.params.eventId);
            if (!event) {
                return res.status(404).send('Event not found');
            }

            // Find team and member
            const team = event.teams.find(t => t._id.toString() === req.params.teamId);
            if (!team) {
                return res.status(404).send('Team not found');
            }

            const member = team.members.find(m => m._id.toString() === req.params.memberId);
            if (!member) {
                return res.status(404).send('Member not found');
            }

            const certificateData = {
                participantName: member.realName || member.email.split('@')[0],
                eventName: event.name,
                teamName: team.teamName,
                codeName: member.codeName,
                eventDate: event.date,
                position: req.params.position
            };

            const doc = await certificateGenerator.generateWinnerCertificate(certificateData);

            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=winner-certificate-${member.codeName}.pdf`);

            // Pipe the PDF document to the response
            doc.pipe(res);
            doc.end();

        } catch (error) {
            console.error('Certificate generation error:', error);
            res.status(500).send('Error generating certificate');
        }
    });
};
