# Portfolio Lab Showcase Redesign

Date: 2026-06-01
Project: `/Users/jensliew/MyPortfolio`
Surface: Portfolio landing experience and project showcase flow

## Summary

Redesign the current gesture-driven portfolio into a more disciplined `Lab Showcase` experience. The new direction should preserve the portfolio's experimental identity while improving first-impression credibility, manual usability, and fallback behavior when camera access is unavailable.

The portfolio should feel like a curated interactive lab for a serious cloud and software engineer, not a generic neon demo and not a conventional static resume site.

## Problem

The current portfolio has a distinctive concept, but its presentation is overloaded:

- The 3D and motion-heavy scene is visually memorable, but it competes with the content instead of framing it.
- Camera access is treated as a near-required path into the experience.
- When camera access is unavailable, the site can remain stuck in a loading-oriented state rather than degrading gracefully.
- Identity, technical proof, and navigation are harder to read quickly than they should be for engineering interviewers.
- Supporting controls such as help, language selection, and detail presentation are functional but visually crowded.

## Goals

- Preserve the portfolio as a standout interactive experience.
- Make the first 10 seconds communicate serious technical capability.
- Keep gesture interaction as a premium layer rather than the only way to browse.
- Provide a complete mouse and touch fallback path.
- Improve project scanning, navigation clarity, and project-detail readability.
- Reduce visual noise while keeping the experience bold and authored.
- Keep the redesign desktop-first with a solid smaller-screen fallback.
- Avoid breaking the existing portfolio content model and core gesture concepts.

## Non-Goals

- Do not turn the site into a conventional plain resume page.
- Do not remove gesture control from the product.
- Do not introduce a large framework migration as part of this redesign alone.
- Do not rewrite portfolio content or invent new projects.
- Do not optimize for a mobile-first interaction model in this pass.

## User Priorities Confirmed During Brainstorming

- Primary audience: engineering leaders and technical interviewers who will spend time exploring the work.
- First impression priority: serious engineering credibility over novelty.
- Creative direction: `Lab Showcase`.
- Device priority: strong desktop-first experience, with a usable fallback on smaller screens.
- Camera requirement: the site should remain complete without camera access.
- Interaction freedom: content and the core gesture idea should be preserved, but interaction structure can be redesigned.

## Design Foundation

### Design philosophy

The redesign should merge two qualities that usually drift apart:

- A credible engineering portfolio with immediate proof, scanability, and structural clarity.
- A curated experimental lab environment that makes interaction feel intentional and memorable.

The design should feel technical, calm, and sharp. It can be atmospheric, but not noisy. It should look like a system built by someone who understands product thinking, not just effects.

### Hierarchy rules

- Identity and proof must be readable before motion is understood.
- The immersive project stage remains the visual center, but not the only usable center.
- Motion should clarify state changes and project exploration, not create constant ambient distraction.
- Surface treatments should support depth and atmosphere without reducing contrast or legibility.

### Accessibility rules

- Manual navigation must always remain available, even when gesture mode is active.
- Camera mode must be opt-in.
- Reduced-motion users must receive a meaningful non-animated experience.
- Denied, blocked, or unavailable camera access must not prevent browsing.
- Core content must remain understandable without animation.

## Approved Layout Direction

### Desktop structure

The landing experience is organized into three primary surfaces:

1. Left identity rail
2. Center active showcase stage
3. Right project directory rail

#### Left identity rail

This rail provides immediate trust signals:

- Name and role summary
- Short credibility statement
- Education or proof summary
- Core stack snapshot
- Resume/contact actions
- Small note that gesture mode is an enhancement, not a requirement

This rail is comparatively quiet. It should not compete visually with the center stage.

#### Center active showcase stage

This remains the visual hero of the page:

- Displays the currently active project or profile stage
- Supports 3D or layered visual presentation
- Contains the most immersive motion and state transitions
- Shows key summary chips such as outcome, architecture, and contribution

This is where the experimental identity lives, but it should be framed by stronger product structure than the current site.

#### Right project directory rail

This rail acts as the primary manual navigation layer:

- Project and experience list
- Clear selected-state behavior
- Fast switching between portfolio entries
- Optional lightweight interaction hints

This should feel like a lab directory or system index, not a generic card list.

### Smaller-screen structure

On tablet and narrower layouts, the structure should collapse into:

- A top summary band for identity and actions
- A central active project panel
- A stacked or swipeable project index below

Manual browsing remains primary on smaller screens. Gesture mode can still exist if supported, but should not dominate the layout.

## Visual System

### Tone

The design language should feel like a live technical environment:

- serious
- composed
- precise
- atmospheric
- high-trust

It should not read as loud sci-fi wallpaper or generalized cyberpunk styling.

### Color strategy

Use deep neutral lab surfaces as the base.

- Base background: very dark, near-neutral navy or charcoal-black
- Secondary surface: slightly lifted dark panel tones
- Primary text: bright cool neutral for strong readability
- Active system accent: cyan
- Highlight or selected accent: rose

Accent colors should communicate state and focus rather than coating the whole interface.

### Typography

Typography should separate content signal from system flavor:

- Main headings: sturdy, technical, high-legibility display sans
- Body copy: calm, readable sans optimized for scanning
- Metadata and labels: mono or mono-adjacent system accent usage

The typographic system should make interviewers feel that the content is organized and intentional before they notice the styling.

### Surface treatment

The redesign should reduce the current number of competing effects.

Preferred:

- stronger panel edges
- restrained glass usage
- selective glow
- a smaller number of atmospheric background layers
- clearer contrast between passive and active surfaces

Avoid:

- too many floating decorative objects
- constant background activity
- overuse of blur and glow
- multiple equally loud visual focal points

## Interaction Model

### Default mode

The portfolio opens in complete browse mode by default.

Visitors can:

- inspect identity and proof
- switch projects manually
- open project details
- navigate the portfolio with mouse or touch only

Camera access is not requested on first load.

### Gesture mode

Gesture mode is enabled explicitly through a visible control such as `Enable gesture mode`.

When enabled:

- camera permission is requested
- a compact gesture status HUD appears
- calibration or status feedback is visible
- manual controls remain available in parallel

Core gesture behaviors remain conceptually consistent with the current experience:

- open hand navigates
- spread enters detail
- pinch exits detail
- vertical motion can scroll long detail content

The exact thresholds and feedback may be refined during implementation.

### Privacy and permission flow

The current full-screen privacy blocker should be replaced by a lighter opt-in permission flow:

- explain that processing happens in-browser
- request access only when gesture mode is chosen
- allow a clean fallback if permission is denied

If access fails, the site remains fully usable in browse mode.

### Project detail presentation

The current detail modal should evolve into a more intentional project dossier experience:

- desktop: expanding side panel or stage-linked dossier panel
- smaller screens: full-screen sheet

The transition should feel connected to the active showcase, not like a disconnected overlay abruptly covering the experience.

### Supporting controls

- Help content should be calmer and more compact.
- Language switching should move into a help/settings area or similar secondary control zone.
- Interaction hints should appear contextually, rather than occupying constant high-attention space.

## Motion Strategy

Motion should follow the approved `Lab Showcase` discipline:

### Motion focus areas

- active project transitions
- directory hover and selection response
- gesture mode enable and disable states
- project detail open and close behavior
- limited stage atmosphere

### Quiet areas

- identity rail
- body copy
- contact and proof actions
- non-interactive structural surfaces

### Motion style

- GSAP timelines for related transitions
- opacity plus transform as the default language
- premium easing without bounce-heavy behavior
- minimal idle motion compared with the current version
- reduced-motion alternative paths

The page should feel alive while interacting, not constantly animated at rest.

## Feature Preservation Requirements

The redesign must preserve or improve the following capabilities:

- project content browsing
- project detail viewing
- gesture-based navigation concept
- bilingual support
- manual navigation path
- existing portfolio data as source content

The redesign may change layout, surface placement, and control presentation as long as these capabilities remain available.

## Implementation Direction

### Architectural approach

Keep the portfolio as a single-page experience, but reorganize it into clearer layers:

- content/data layer
- UI state layer
- stage/rendering layer
- manual navigation layer
- gesture/camera layer

Introduce explicit UI states such as:

- `browse`
- `camera-opt-in`
- `gesture-active`
- `project-detail`

This will make fallback behavior more reliable and reduce the current coupling between loading, camera state, and browsing state.

### Refactor priorities

Implementation should prioritize:

1. confirming the active entry surface and preserving in-progress changes
2. building complete manual browse mode
3. restructuring layout and hierarchy
4. rebuilding permission and fallback flow
5. reintroducing gesture mode into the new structure
6. refining motion and atmospheric layers

### Current repo constraint

The portfolio currently uses an existing single-file entry surface at `index.html`, and that file is already modified in the working tree. Implementation should treat it as the active redesign target while preserving any unrelated in-progress changes that are already present there.

## Verification Requirements

Implementation is not complete unless the following are verified:

- browse mode works with no camera permission granted
- browse mode works when camera hardware is unavailable
- gesture mode can be enabled intentionally
- denied camera permission returns cleanly to browse mode
- manual project switching works
- project detail open and close works
- gesture navigation still works after redesign
- language switching still works
- desktop layout feels intentional
- smaller-screen fallback remains usable
- reduced-motion behavior remains coherent
- no loading dead-end remains in the experience

## Risks

- The `Lab Showcase` direction can easily become effect-heavy again if the credibility rails are underemphasized.
- Reworking the layout without separating state concerns can recreate the same camera-loading fragility.
- Over-preserving old visual behaviors could weaken the clarity gains from the redesign.
- Under-preserving the experimental stage could make the site feel too conventional.

## Recommended Execution Principle

When trade-offs appear, prefer:

1. clarity before decoration
2. trust before spectacle
3. interaction depth before ambient motion
4. complete fallback behavior before experimental polish

## Design Approval State

Approved during brainstorming:

- `Lab Showcase` as the overall direction
- three-part landing structure
- darker technical visual system with reduced noise
- camera as opt-in enhancement
- complete manual fallback
- disciplined motion system
- explicit verification focus to avoid breaking existing capabilities
