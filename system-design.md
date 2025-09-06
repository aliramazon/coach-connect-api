# Coaching Platform – Database Design

This document describes the **database entities, relationships, and lifecycle flows** for the coaching scheduling platform.  
It uses **Prisma** with **PostgreSQL** and is designed for **production-quality systems**.

---

## 📦 Entities

### User

- Represents both coaches and students.
- Differentiated by `role` (`COACH` or `STUDENT`).
- Coaches create slots; students book them.

### Slot

- A block of time created by a coach.
- Status:
    - `AVAILABLE`: slot can be booked.
    - `UNAVAILABLE`: slot has been booked.
- Only deletable if `AVAILABLE`.

### Booking

- Created when a student reserves a slot.
- Exactly one booking per slot (`slotId` is unique).
- Lifecycle statuses:
    - `ACTIVE`: reserved but not finished.
    - `COMPLETED`: session happened.
    - `CANCELLED`: session cancelled before completion.
    - `NO_SHOW`: session missed by student or coach.
- Tracks:
    - `noShowBy`: who did not show (`STUDENT` or `COACH`).
    - `completedAt`: when it was marked completed.

### CallReview

- Optional feedback linked 1:1 with a booking.
- Includes satisfaction score (1–5) and optional notes.

### CoachStats

- One-to-one with each coach.
- Tracks total calls, average rating, total slots, and completed slots.
- Updated when bookings complete.

---

## 🗄️ Entity–Relationship Diagram (ERD)

> Mermaid ERD notes: use lowercase types (`string`, `int`, `float`, `datetime`).  
> Keys can be marked `PK`, `FK`, `UK`. Use **comments** (quoted strings) to hint references.

```mermaid
erDiagram
    USER ||--o{ SLOT : "creates"
    USER ||--o{ BOOKING : "books as student"
    USER ||--o{ BOOKING : "fulfills as coach"
    USER ||--|| COACHSTATISTICS : "has stats"
    SLOT ||--o| BOOKING : "has"
    BOOKING ||--|| CALLREVIEW : "has"

    USER {
      string   id PK
      string   email UK
      string   firstName
      string   lastName
      string   phoneNumber
      string   role        "COACH | STUDENT"
      datetime createdAt
      datetime updatedAt
    }

    SLOT {
      string   id PK
      string   coachId FK     "references USER.id"
      datetime startTime
      datetime endTime
      string   status         "AVAILABLE | UNAVAILABLE"
      datetime createdAt
      datetime updatedAt
    }

    BOOKING {
      string   id PK
      string   slotId   FK    "references SLOT.id"
      string   studentId FK   "references USER.id"
      string   coachId  FK    "references USER.id"
      string   status         "ACTIVE | COMPLETED | CANCELLED | NO_SHOW"
      string   noShowBy       "STUDENT | COACH (nullable)"
      datetime completedAt
      datetime createdAt
      datetime updatedAt
    }

    CALLREVIEW {
      string   id PK
      string   bookingId FK   "references BOOKING.id"
      int      satisfactionScore
      string   notes
      datetime createdAt
      datetime updatedAt
    }

    COACHSTATS {
      string   id PK
      string   coachId FK,UK  "references USER.id; one-to-one"
      int      totalCalls
      float    averageRating
      int      totalSlots
      int      completedSlots
      datetime lastUpdated
    }
```

## Slot & Booking Lifecycle

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE

    AVAILABLE --> UNAVAILABLE : student books slot

    state UNAVAILABLE {
        ACTIVE --> COMPLETED : auto after endTime (or manual)
        ACTIVE --> CANCELLED : cancelled by student/coach
        ACTIVE --> NO_SHOW   : student or coach did not show
    }

    COMPLETED --> [*]
    CANCELLED --> [*]
    NO_SHOW   --> [*]
```

## Process Flow

```mermaid
flowchart TD
    A[Coach creates slot] -->|status: AVAILABLE| B[Student books slot]
    B -->|status: UNAVAILABLE, Booking: ACTIVE| C[Session time arrives]

    C -->|call finished| D[Booking COMPLETED]
    C -->|student cancels| E[Booking CANCELLED]
    C -->|coach cancels| E
    C -->|no one shows| F[Booking NO_SHOW]

    D --> G[CallReview optional]
    E --> G
    F --> G

    G --> H[CoachStats update]
```
