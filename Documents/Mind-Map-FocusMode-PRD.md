# Product Requirements Document: Enhanced Note-Taking & Reading Modes

## Document Information
- **Product**: Nuxt eReader
- **Feature Set**: Mind Map Notes & Focus Reading Mode
- **Version**: 1.0
- **Date**: January 6, 2025
- **Author**: Product Management Team

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Objectives & Success Metrics](#objectives--success-metrics)
4. [User Personas](#user-personas)
5. [Feature Requirements](#feature-requirements)
6. [User Stories](#user-stories)
7. [User Flows](#user-flows)
8. [Technical Considerations](#technical-considerations)
9. [UI/UX Requirements](#uiux-requirements)
10. [Acceptance Criteria](#acceptance-criteria)
11. [Out of Scope](#out-of-scope)
12. [Dependencies & Risks](#dependencies--risks)
13. [Launch Strategy](#launch-strategy)

## Executive Summary

This PRD outlines two major enhancements to the Nuxt eReader:
1. **Mind Map Note-Taking System**: A visual, non-linear note-taking approach that allows readers to create interconnected thoughts and ideas while reading
2. **Focus Reading Mode**: A distraction-free, paragraph-by-paragraph reading experience with keyboard navigation

These features address the needs of academic readers, researchers, and focused learners who require advanced note organization and concentrated reading capabilities.

## Problem Statement

### Current State
- Users can only take linear, text-based notes in a traditional document format
- Notes are disconnected from the visual/spatial thinking many readers prefer
- Reading experience can be overwhelming with full chapters displayed
- No option for controlled, focused reading progression

### User Pain Points
1. **Information Overload**: Difficulty organizing complex ideas from dense texts
2. **Context Switching**: Losing focus when jumping between reading and note-taking
3. **Limited Note Organization**: Linear notes don't reflect how ideas connect
4. **Reading Pace Control**: Cannot control information flow for better comprehension
5. **Spatial Learning**: Visual learners lack tools to map relationships between concepts

## Objectives & Success Metrics

### Primary Objectives
1. Enable visual, hierarchical note organization through mind mapping
2. Provide seamless integration between reading and note-taking
3. Offer focused reading mode for improved comprehension
4. Maintain the privacy-first, client-side approach

### Success Metrics
- **Engagement**: 40% of active users adopt mind map notes within 3 months
- **Retention**: 25% increase in reading session duration with focus mode
- **Creation**: Average of 5+ mind map nodes per reading session
- **Satisfaction**: 4.5+ star rating for new features
- **Performance**: No degradation in app load time or responsiveness

## User Personas

### 1. Dr. Sarah Chen - Academic Researcher
- **Age**: 34
- **Role**: Post-doctoral researcher in cognitive science
- **Goals**: Extract and connect ideas from multiple research papers
- **Pain Points**: Linear notes don't capture idea relationships
- **Tech Savvy**: High
- **Reading Volume**: 10-15 papers per week

### 2. Marcus Johnson - Graduate Student
- **Age**: 26
- **Role**: Philosophy MA student
- **Goals**: Deep comprehension of complex texts
- **Pain Points**: Gets overwhelmed by dense philosophical works
- **Tech Savvy**: Medium
- **Reading Volume**: 3-5 books per month

### 3. Elena Rodriguez - Professional Learner
- **Age**: 42
- **Role**: Corporate trainer and lifelong learner
- **Goals**: Quickly extract actionable insights from business books
- **Pain Points**: Needs visual organization for training materials
- **Tech Savvy**: Medium
- **Reading Volume**: 2-3 books per month

## Feature Requirements

### 1. Mind Map Note-Taking System

#### Core Functionality
- **Node Creation**: Click/tap to create nodes anywhere on canvas
- **Node Types**: 
  - Central topic (book/chapter)
  - Main ideas (larger nodes)
  - Sub-ideas (smaller nodes)
  - Annotations (text snippets)
- **Connections**: Draw relationships between nodes
- **Node Content**:
  - Title (required)
  - Description (optional)
  - Color coding
  - Icons/emoji support
  - Link to specific paragraph/page

#### Interaction Features
- **Drag & Drop**: Rearrange nodes freely
- **Zoom & Pan**: Navigate large mind maps
- **Expand/Collapse**: Hide/show node branches
- **Search**: Find nodes by content
- **Templates**: Pre-made mind map structures

### 2. Chapter-Based Note Organization

#### Structure
- **Note Spaces**: Dedicated mind map canvas per chapter
- **Navigation**: Tab/dropdown to switch between chapters
- **Overview Mode**: See all chapter mind maps at once
- **Consolidation**: Merge chapter maps into master map

### 3. Side-by-Side View

#### Layout Options
- **Split Screen**: 50/50 default, adjustable divider
- **Overlay Panel**: Floating notes panel
- **Toggle View**: Quick switch between modes
- **Synchronized Scrolling**: Optional link between text and notes

### 4. Focus Reading Mode

#### Core Features
- **Single Paragraph Display**: One paragraph centered on screen
- **Progress Indicator**: Visual progress through chapter
- **Navigation**:
  - Spacebar: Next paragraph
  - Shift+Space: Previous paragraph
  - Arrow keys: Alternative navigation
  - Number keys: Jump to paragraph
- **Context Preview**: Subtle preview of next/previous paragraphs
- **Exit Options**: ESC key or button to return to normal view

## User Stories

### Epic 1: Mind Map Note-Taking

**User Story 1.1**: As a researcher, I want to create a mind map while reading so that I can visually organize complex ideas and their relationships.

**Acceptance Criteria**:
- I can create a new mind map for any chapter
- I can add nodes by clicking on the canvas
- I can connect nodes with lines
- I can edit node content inline
- My mind map auto-saves every 30 seconds

**User Story 1.2**: As a visual learner, I want to link mind map nodes to specific paragraphs so that I can quickly reference the source text.

**Acceptance Criteria**:
- I can right-click any paragraph to "Add to Mind Map"
- Clicking a linked node highlights the source paragraph
- Links are indicated with a special icon
- I can see a preview of linked text on hover

**User Story 1.3**: As a student, I want to use different colors and icons in my mind map so that I can categorize different types of information.

**Acceptance Criteria**:
- I can choose from 8+ colors for nodes
- I can add emoji or icons to nodes
- I can create a legend for my color coding
- Colors are preserved when exporting

### Epic 2: Chapter Note Management

**User Story 2.1**: As an academic, I want separate mind maps for each chapter so that I can organize notes without overwhelming complexity.

**Acceptance Criteria**:
- Each chapter has its own mind map canvas
- I can switch between chapter maps via tabs
- I can see which chapters have notes
- Empty chapter maps show helpful prompts

**User Story 2.2**: As a researcher, I want to create a master mind map from all chapter maps so that I can see the complete picture of the book's ideas.

**Acceptance Criteria**:
- I can access a "Consolidate Maps" feature
- The system intelligently merges related nodes
- I can manually adjust the consolidated map
- Original chapter maps remain unchanged

### Epic 3: Side-by-Side Reading

**User Story 3.1**: As a note-taker, I want to see my mind map alongside the text so that I can add notes without losing reading context.

**Acceptance Criteria**:
- I can toggle side-by-side view with one click
- The divider is draggable to adjust space
- Both panels are independently scrollable
- The layout is responsive on tablets

**User Story 3.2**: As a reader, I want my notes panel to follow my reading position so that relevant notes are always visible.

**Acceptance Criteria**:
- Optional "sync scrolling" toggle
- Smart positioning shows nearby nodes
- Smooth animation when switching chapters
- Manual override to explore other areas

### Epic 4: Focus Reading Mode

**User Story 4.1**: As someone with ADHD, I want to read one paragraph at a time so that I can maintain focus without distraction.

**Acceptance Criteria**:
- I can enter focus mode from any chapter
- Only one paragraph is shown prominently
- Background is dimmed/blurred
- Text is optimally sized and centered

**User Story 4.2**: As a careful reader, I want to control my reading pace with the spacebar so that I can fully digest each paragraph before moving on.

**Acceptance Criteria**:
- Spacebar advances to next paragraph
- Shift+Space returns to previous
- Smooth transition animation
- Audio/haptic feedback option

**User Story 4.3**: As a student, I want to see my reading progress in focus mode so that I know how much remains in the chapter.

**Acceptance Criteria**:
- Subtle progress bar at top/bottom
- Current paragraph number display
- Estimated reading time remaining
- Chapter completion celebration

## User Flows

### Flow 1: Creating First Mind Map
```
1. User opens book and navigates to chapter
2. User clicks "Mind Map" button in toolbar
3. System opens side-by-side view
4. User sees empty canvas with prompt
5. User clicks canvas to create first node
6. User types node title and presses Enter
7. User continues adding connected nodes
8. System auto-saves progress
```

### Flow 2: Entering Focus Mode
```
1. User reading normally in chapter view
2. User presses 'F' key or clicks focus icon
3. Screen transitions to single paragraph
4. User reads paragraph completely
5. User presses spacebar
6. Next paragraph slides into view
7. User presses ESC to exit focus mode
8. Returns to previous scroll position
```

### Flow 3: Linking Note to Text
```
1. User selects text in paragraph
2. Context menu appears with "Add to Mind Map"
3. User clicks option
4. Mind map panel activates (if hidden)
5. New node appears with selected text
6. User can edit/expand the node
7. Link indicator shows on both sides
```

## UI/UX Requirements

### Visual Design Principles
- **Consistency**: Match existing glass morphism aesthetic
- **Minimalism**: Clean, distraction-free interfaces
- **Accessibility**: High contrast options, keyboard navigation
- **Responsiveness**: Tablet-first, mobile-friendly

### Mind Map Interface
- **Canvas**: Light grid background, infinite scroll
- **Nodes**: Rounded rectangles with subtle shadows
- **Connections**: Curved bezier lines
- **Tools**: Floating toolbar with common actions
- **Minimap**: Overview in corner for large maps

### Focus Mode Design
- **Typography**: Larger font size (adjustable)
- **Spacing**: Generous line height and margins
- **Animation**: Smooth 300ms transitions
- **Controls**: Minimal, fade when not in use
- **Background**: Subtle gradient or blur effect

## Technical Considerations

### Performance Requirements
- Mind maps with 100+ nodes must remain responsive
- Canvas operations under 16ms for 60fps
- Auto-save without blocking UI
- Lazy loading for large mind maps

### Storage Strategy
- Mind maps stored in IndexedDB
- Compressed JSON format
- Incremental saves for changes
- Export to standard formats (PNG, SVG, JSON)

### Compatibility
- Touch support for tablet users
- Keyboard shortcuts for power users
- Screen reader compatibility
- Fallback for older browsers

## Acceptance Criteria

### Mind Map System
- [ ] Users can create, edit, and delete nodes
- [ ] Connections can be drawn between any nodes
- [ ] Mind maps persist between sessions
- [ ] Performance remains smooth with 100+ nodes
- [ ] Export functionality works correctly

### Focus Reading Mode
- [ ] Paragraph isolation works correctly
- [ ] Navigation is intuitive and responsive
- [ ] Progress tracking is accurate
- [ ] Mode can be entered/exited seamlessly
- [ ] User preferences are remembered

### Integration
- [ ] Side-by-side view works on all screen sizes
- [ ] No conflicts with existing features
- [ ] Consistent UI/UX with current design
- [ ] All keyboard shortcuts documented

## Out of Scope

The following items are explicitly not included in this release:
- Collaborative mind mapping
- AI-generated mind map suggestions
- Mind map sharing/publishing
- Audio narration in focus mode
- Mobile app specific features
- Integration with external mind mapping tools

## Dependencies & Risks

### Dependencies
- Existing note-taking system must be refactored
- Canvas rendering library selection
- Performance testing framework needed

### Risks
- **Technical**: Canvas performance on low-end devices
- **User Adoption**: Learning curve for mind mapping
- **Scope Creep**: Feature requests during development
- **Competition**: Similar features in competing apps

### Mitigation Strategies
- Progressive enhancement for older devices
- Comprehensive onboarding tutorial
- Clear scope boundaries in development
- Regular competitive analysis

## Launch Strategy

### Phase 1: Beta Launch (Week 1-4)
- Release to 10% of users
- Collect feedback via in-app surveys
- Monitor performance metrics
- Fix critical issues

### Phase 2: Gradual Rollout (Week 5-8)
- Expand to 50% of users
- A/B test default settings
- Refine based on usage data
- Prepare help documentation

### Phase 3: Full Launch (Week 9)
- Release to all users
- Marketing campaign
- Feature tutorial video
- Community feedback channels

### Success Criteria for Launch
- Less than 0.1% crash rate
- 80%+ positive feedback
- No performance regression
- 50%+ feature discovery rate

---

## Appendix: Mockup References

*Note: Detailed mockups and wireframes to be created during design phase*

### Key Screens to Design
1. Mind map canvas (empty state)
2. Mind map with 20+ nodes
3. Side-by-side reading view
4. Focus mode paragraph display
5. Settings/preferences panel
6. Onboarding flow

---

*This PRD is a living document and will be updated based on stakeholder feedback and technical feasibility assessments.*