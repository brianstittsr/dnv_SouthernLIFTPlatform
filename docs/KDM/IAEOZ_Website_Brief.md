# IAEOZ Summit Website Analysis Brief
## How the Website Works

**Document Version:** 1.0  
**Date:** January 12, 2026  
**Source:** https://iaeozsummit.com/

---

## Executive Summary

The IAEOZ Summit website is a single-page event marketing and registration platform for the annual Innovation in Agriculture & Energy Opportunity Zone Summit hosted by KDM & Associates. The site serves as a comprehensive hub for event information, speaker profiles, schedule details, ticket sales, sponsorship packages, and hotel reservations.

---

## Website Structure & Components

### 1. Hero Section
- **Event branding** with title, dates, and location
- **Primary CTAs**: Virtual event registration, hotel booking
- **Visual elements**: Event imagery, destination highlights

### 2. Featured Highlights Section
- **Event tagline**: "Powering Agriculture & Energy Innovation"
- **Value proposition**: Three days of insight on smart farming, renewable energy, and federal contracting
- **Destination showcase**: Puerto Rico culture, food, entertainment gallery

### 3. About Event Section
- **Detailed event description** (multi-paragraph)
- **Focus areas**: Agriculture, Energy, Government Contracting, Opportunity Zones
- **Supporting agencies**: DOE, USDA, NSF, HUD, NASA, DOD
- **Social sharing buttons**
- **Event tags** for categorization

### 4. Speakers Section
- **Speaker grid** with photos, names, titles, organizations
- **Expandable bios** with detailed backgrounds
- **Role indicators**: Keynote, Speaker, Moderator, Event Producer
- **Social links** per speaker

### 5. Schedule/Run of Show Section
- **Multi-day tabbed interface** (Sunday, Monday, Tuesday)
- **Session cards** with:
  - Time slots
  - Session titles
  - Speaker assignments
  - Session types (keynote, panel, networking, meal)
  - Sponsor attributions
- **View Speaker Details** links

### 6. Ticket/Registration Section
- **Ticket cards** with pricing
- **Virtual event option** ($125)
- **Hotel reservation** ($280/night with group rate)
- **Purchase buttons** linking to external payment

### 7. Sponsorship Packages Section
- **Tiered sponsorship levels**:
  - Titanium ($50,000)
  - Platinum ($25,000)
  - Gold ($15,000)
  - Bronze ($5,000)
  - Silver ($1,000)
- **Benefits lists** per tier
- **PayPal purchase links**

### 8. News/Articles Section
- **Related news articles** from kdm-assoc.com
- **Event-related content** and thought leadership

### 9. Sponsors Showcase
- **Logo grid** of current sponsors
- **Sponsor spotlight** feature

### 10. Contact Section
- **Contact form** (name, email, message)
- **Success confirmation** messaging

### 11. Footer Section
- **Key vitals**: Organizer info, venue directions, event dates
- **Newsletter signup**
- **Social links**
- **Legal links** (FAQ, Privacy, Terms)

---

## Technical Implementation

### Frontend Features
| Feature | Implementation |
|---------|----------------|
| Single Page Application | Smooth scroll navigation |
| Responsive Design | Mobile-first approach |
| Image Gallery | Carousel/slider for destination photos |
| Tabbed Interface | Schedule day switching |
| Accordion/Modal | Speaker bio expansion |
| Form Handling | Contact form with validation |
| External Links | PayPal, Passkey hotel booking, virtual event platform |

### Data Entities Identified
1. **Event** - Core event details
2. **Speakers** - Profiles with bios
3. **Schedule/Sessions** - Multi-day agenda
4. **Tickets** - Registration options
5. **Sponsorship Packages** - Tiered offerings
6. **Sponsors** - Current sponsor list
7. **News/Articles** - Related content
8. **Registrations** - Attendee data
9. **Contact Inquiries** - Form submissions

### External Integrations
- **PayPal** - Sponsorship payments
- **Passkey** - Hotel group booking
- **Virtual Event Platform** (iaeozvirtual.com)
- **KDM Website** - News articles, tags

---

## User Journeys

### Attendee Journey
1. Land on homepage → View event details
2. Browse speakers → Read bios
3. Review schedule → Plan attendance
4. Select ticket type → Purchase registration
5. Book hotel → Reserve room at group rate
6. Receive confirmation → Add to calendar

### Sponsor Journey
1. Land on homepage → View event details
2. Scroll to sponsorship section
3. Compare package tiers → Select level
4. Click purchase → Complete PayPal payment
5. Contact form → Discuss customization

### Speaker/Partner Journey
1. Contact form inquiry
2. Review event details
3. Submit speaker application

---

## Key Takeaways for KDM Integration

### Must-Have Features
1. **Event landing page** with all key information
2. **Speaker management** with profiles and bios
3. **Multi-day schedule builder** with session types
4. **Tiered sponsorship packages** with benefits
5. **Ticket/registration system** with payment integration
6. **Hotel booking integration** or group rate management
7. **Contact/inquiry forms**

### Nice-to-Have Features
1. **Virtual event integration**
2. **News/content integration**
3. **Sponsor logo showcase**
4. **Social sharing**
5. **Calendar integration**
6. **Email notifications**

---

*This brief serves as the foundation for the Event Management System database schema and admin interface design.*
