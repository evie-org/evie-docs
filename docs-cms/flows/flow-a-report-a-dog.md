---
title: Flow A — Help a dog
sidebar_position: 2
---
# Flow A — Help a dog

From the home feed a signed-in member chooses how to help a dog: report it to the group
(moderated case flow) or help it themselves (offline, with optional logging).

| Field | Value |
| --- | --- |
| **Actor** | Rescuer / Member |
| **Goal** | Get help to a dog — via the community or directly |
| **Preconditions** | Signed in via phone OTP ([rfc-001](../rfcs/rfc-001-phone-otp-login.md)); member of at least one locality group (PRD §3.2) |
| **Trigger** | User taps “Help a dog” on the home feed |
| **Postcondition** | A “Submitted / Unverified” case, a `CareLog` entry, or nothing — depending on the branch |

## Diagram

```mermaid
flowchart LR
    Start([Open app]) --> Feed["Home feed"]
    Feed -. optional .-> Loc[/"Switch location"/]
    Loc -.-> Feed

    Feed --> Choice{Action?}
    Choice -->|Open a case| OpenCase["Open existing<br/>case thread"]
    Choice -->|Help a dog| How{How does the user<br/>want to help?}

    %% Branch 1 — Report to the group
    How -->|Report to the group| QRq{Dog has<br/>QR tag?}
    QRq -->|Yes — preferred| Scan["Scan QR tag<br/>pre-fill details"]
    QRq -->|No — fallback| Manual["Enter manually"]
    Scan --> Form["Add photo, location,<br/>type, condition, note"]
    Manual --> Form
    Form --> Submit[/"Submit"/]
    Submit --> Pending["Submitted / Unverified<br/>greyed card"]
    Pending --> Gate{Moderator<br/>Gate 1}
    Gate -->|Validate + severity| Active["Active case<br/>on feed"]
    Gate -->|Reject| Rejected([Rejected])
    Active --> NewThread["Case thread:<br/>updates, replies,<br/>request closure"]

    %% Branch 2 — Help it myself (TBD)
    How -->|Help it myself| Resources["Resources screen TBD<br/>partner vets, emergency,<br/>auto drivers, etc."]
    Resources --> Action(["User acts offline"])
    Action -. optional later .-> LogPrompt{Log this rescue?}
    LogPrompt -->|Skip| End1([Done])
    LogPrompt -->|Yes — quick| LogForm[/"Minimal log:<br/>location, type, outcome<br/>optional photo + QR"/]
    LogForm --> SelfLog["CareLog created<br/>view-only, no gate"]
    SelfLog --> End2([Logged])

    OpenCase --> Coord([Coordinate])
    NewThread --> Coord

    classDef se fill:#e8f5e9,stroke:#2e7d32,color:#1b5e20;
    classDef dec fill:#fff3e0,stroke:#ef6c00,color:#e65100;
    classDef tbd fill:#fce4ec,stroke:#ad1457,color:#880e4f,stroke-dasharray: 4 3;
    class Start,Coord,Rejected,End1,End2,Action se;
    class Choice,How,QRq,Gate,LogPrompt dec;
    class Resources,LogForm,SelfLog tbd;
```

**Legend:** green = entry/exit, orange = decision, dashed pink = TBD / not yet in the
PRD.

## Branches

**Report to the group (moderated).** The standard case flow.
Gate 1 — moderator validation — is the bottleneck for time-to-first-response (see the
“Moderator availability” risk, PRD §10).

**Help it myself (offline + optional log).** Serve first, capture second: the Resources
screen (content TBD) appears with no form in the way, and logging a `CareLog` is
optional and after the fact.
Rationale in [memo-001](../memos/memo-001-self-help-capture.md); the `CareLog` model is
deferred to a follow-up RFC and is not yet in PRD §7.

## Doc gaps surfaced by this flow

| Concept | Where it belongs | Status |
| --- | --- | --- |
| “Help a dog” button (entry point) | PRD §5.2 Home Feed | not specified |
| Location switcher (top bar) | PRD §5.2 | not specified |
| QR-tag → Dog identity | PRD §5.3 + §7 | WIP |
| “Help it myself” → Resources screen | new PRD §5.X | not specified |
| `CareLog` entity & lifecycle | PRD §7 + future RFC | see [memo-001](../memos/memo-001-self-help-capture.md) |
