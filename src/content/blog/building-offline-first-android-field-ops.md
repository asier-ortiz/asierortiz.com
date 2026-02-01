---
title: "Building an Offline-First Android App for Field Operations with GeoPackage and Jetpack Compose"
description: "How I built a native Android app for field teams — offline spatial queries with GeoPackage, real-time GPS tracking, and sync with PostgreSQL."
pubDate: "2026-02-01"
image: "/assets/blog/offline-first-android.webp"
tags: ["android", "kotlin", "geopackage", "jetpack-compose", "offline-first"]
author: "Asier Ortiz"
draft: false
---

Some apps are built for ideal conditions — fast Wi-Fi, stable connections, users sitting at desks. This is not one of those apps.

This article covers the architecture and technical challenges behind a native Android application I built for **field operations teams** working on roads and highways. These teams patrol infrastructure, report incidents, manage emergencies, and log everything — often in areas with **zero cellular coverage**.

All I had to start with was a document briefly describing what the client needed: their field workers were filling out **paper forms** during road patrols, then manually entering the data into a web portal back at the office. They wanted to digitize and automate the entire process. That single document was my roadmap for the next several months.

Let's break down how it all came together.

---

## Table of Contents

<div class="not-prose mb-8 rounded-lg border border-base-700 bg-base-900 p-4">
  <ul class="flex flex-col gap-2">
    <li><a href="#1-the-challenge" class="text-base-300 hover:text-primary-400 transition-colors duration-300">1. The Challenge</a></li>
    <li><a href="#2-offline-first-architecture" class="text-base-300 hover:text-primary-400 transition-colors duration-300">2. Offline-First Architecture</a></li>
    <li><a href="#3-geopackage-for-offline-spatial-queries" class="text-base-300 hover:text-primary-400 transition-colors duration-300">3. GeoPackage for Offline Spatial Queries</a></li>
    <li><a href="#4-taming-gps-drift-with-kalman-filters" class="text-base-300 hover:text-primary-400 transition-colors duration-300">4. Taming GPS Drift with Kalman Filters</a></li>
    <li><a href="#5-real-time-gps-tracking-with-maplibre" class="text-base-300 hover:text-primary-400 transition-colors duration-300">5. Real-Time GPS Tracking with MapLibre</a></li>
    <li><a href="#6-hands-free-operation-with-voice-commands" class="text-base-300 hover:text-primary-400 transition-colors duration-300">6. Hands-Free Operation with Voice Commands</a></li>
    <li><a href="#7-postgresql-as-the-api-layer" class="text-base-300 hover:text-primary-400 transition-colors duration-300">7. PostgreSQL as the API Layer</a></li>
    <li><a href="#8-designing-ux-for-field-workers" class="text-base-300 hover:text-primary-400 transition-colors duration-300">8. Designing UX for Field Workers</a></li>
    <li><a href="#9-security-encryption-and-biometric-access" class="text-base-300 hover:text-primary-400 transition-colors duration-300">9. Security: Encryption and Biometric Access</a></li>
    <li><a href="#10-sync-strategy" class="text-base-300 hover:text-primary-400 transition-colors duration-300">10. Sync Strategy</a></li>
    <li><a href="#11-lessons-learned" class="text-base-300 hover:text-primary-400 transition-colors duration-300">11. Lessons Learned</a></li>
  </ul>
</div>

---

## 1. The Challenge

The requirements were straightforward on paper:

- Field teams drive along roads, performing surveillance patrols
- They need to **report incidents** (debris, animals, road damage) with exact location
- They manage **emergencies** with timestamps, assigned staff, photos, and detailed records
- Everything must work **without internet** — syncing when back in range
- Location data must be precise: which road, which kilometer marker, which direction
- Patrols where **nothing is found** should be logged automatically — no manual input needed

The hard part? Making all of this feel fast, reliable, and simple for users who are not tech-savvy — often operating the app one-handed while standing on the side of a highway. Or worse: while driving.

That last point kept me up at night. These workers use the app **in a vehicle**. Touching a screen while driving is a safety problem I couldn't ignore.

---

## 2. Offline-First Architecture

"Offline-first" is not just caching API responses. It means the **local database is the source of truth**, and the server is something you sync with when you can.

### Room as the Local Database

The app uses **Room** (Android's SQLite abstraction) as its primary data store. Every entity — patrols, incidents, emergencies, photos — lives locally first.

```kotlin
@Entity(tableName = "emergencies")
data class EmergencyEntity(
    @PrimaryKey val uuid: String,
    val roadId: Int?,
    val km: Double?,
    val direction: String?,
    val status: String,
    val synced: Boolean = false,
    // ... more fields
)
```

### UUIDs Everywhere

Since records are created offline on multiple devices, auto-increment IDs would collide. Every record gets a **UUID** at creation time, which serves as the primary key. The server accepts these UUIDs and uses them for deduplication.

```kotlin
val newEmergency = EmergencyEntity(
    uuid = UUID.randomUUID().toString(),
    status = "ACTIVE",
    synced = false,
    // ...
)
```

### The `synced` Flag

Every entity has a `synced` boolean. When a record is created or modified locally, it's marked as `synced = false`. The sync process picks up all unsynced records and pushes them to the server. On success, the flag flips to `true`.

This pattern is simple but effective. It handles the common case (create offline, sync later) without the complexity of conflict resolution frameworks like CRDTs.

---

## 3. GeoPackage for Offline Spatial Queries

This was the most technically challenging part of the project — and honestly, the one that gave me the most headaches.

### The Problem

When a field worker reports an incident, they need to specify:
- **Which road** they're on
- **The kilometer marker** (KM point)
- **The direction** of travel

Doing this manually from a dropdown of hundreds of roads is impractical. The app needs to figure out this information **automatically from GPS coordinates** — and it needs to do it **offline**.

### Why Not a Geocoding API?

Services like Google's Geocoding API or Mapbox require an internet connection. These teams work in areas where that's not guaranteed. We needed the spatial data **on the device**.

### Enter GeoPackage

**GeoPackage** is an OGC standard for storing geospatial data in a SQLite container. It can hold vector features (points, lines, polygons) with their geometries and attributes — all in a single `.gpkg` file.

I'd never worked with GeoPackage before this project. The documentation is sparse, the Android community around it is tiny, and most examples I found online were either outdated or focused on desktop GIS tools. I spent days just figuring out how to properly query geometries and compute distances along road segments. There were moments where I questioned whether this was even the right approach — but the alternative (requiring internet for geocoding) was a non-starter.

The road network data — every road segment with its geometry, name, and kilometer markers — is packaged into a GeoPackage file and shipped with the app (or updated periodically via sync).

### How It Works

1. **Load the GeoPackage** on app start using the [NGA GeoPackage Android SDK](https://github.com/ngageoint/geopackage-android):

```kotlin
val manager = GeoPackageFactory.getManager(context)
manager.importGeoPackage(geoPackageFile)
val geoPackage = manager.open("roads")
```

2. **Query by proximity** — given GPS coordinates, find the nearest road:

```kotlin
val featureDao = geoPackage.getFeatureDao("road_segments")
val boundingBox = BoundingBox(
    lng - buffer, lat - buffer,
    lng + buffer, lat + buffer
)
val results = featureDao.queryForBoundingBox(boundingBox)
```

3. **Calculate the kilometer marker** — project the GPS point onto the nearest road segment and compute the distance along the line from the road's origin:

```kotlin
fun calculateKM(point: LatLng, roadGeometry: LineString): Double {
    val projected = projectPointOnLine(point, roadGeometry)
    return distanceAlongLine(roadGeometry.startPoint, projected)
}
```

4. **Determine direction** — based on the heading from GPS updates and the road segment's bearing.

### The Result

The user taps "Report Incident," and the app **instantly** fills in the road name, KM, and direction — all computed locally from GPS + GeoPackage data. No internet required. The spatial query runs in milliseconds.

This ended up being the feature that impressed everyone the most during demos. What previously required manually looking up road markers and typing values now happened automatically. The first time I showed it to the field workers and watched their reaction — that made all the frustration worth it.

---

## 4. Taming GPS Drift with Kalman Filters

Raw GPS data is messy. On a highway, the reported position can jump around by 10-20 meters between readings, especially near tunnels, bridges, or tall structures. When you're drawing a real-time route on a map and computing kilometer markers, those jumps are a problem.

The polyline would zigzag across lanes. The KM calculation would fluctuate. The user would see their marker bouncing around erratically.

### The Solution: Kalman Filtering

I implemented a **Kalman filter** to smooth GPS readings. The filter maintains a prediction of the device's position and velocity, and corrects it with each new GPS reading — weighting the prediction vs. the measurement based on their respective uncertainties.

```kotlin
class KalmanFilter {
    private var lat: Double = 0.0
    private var lng: Double = 0.0
    private var variance: Float = -1f

    fun process(newLat: Double, newLng: Double, accuracy: Float, timestamp: Long) {
        if (variance < 0) {
            // First reading — initialize
            lat = newLat
            lng = newLng
            variance = accuracy * accuracy
        } else {
            // Predict + correct
            val duration = (timestamp - lastTimestamp) / 1000.0
            variance += duration * speedVariance
            val gain = variance / (variance + accuracy * accuracy)
            lat += gain * (newLat - lat)
            lng += gain * (newLng - lng)
            variance *= (1 - gain)
        }
    }
}
```

The GPS `accuracy` field reported by the device is key here — it lets the filter automatically trust high-accuracy readings more and discount noisy ones.

The difference was dramatic. The polyline went from a jittery mess to a smooth line that actually followed the road. KM calculations became stable. It was one of those changes where the before/after was immediately obvious.

---

## 5. Real-Time GPS Tracking with MapLibre

The app includes a map view that tracks the user's patrol in real time, drawing the route as a polyline.

### MapLibre for Offline Maps

We use **MapLibre GL** (the open-source fork of Mapbox GL) for map rendering. Map tiles are cached locally for offline use, and the GeoPackage road data is overlaid as vector layers.

### Drawing the Route

As filtered GPS updates arrive, each coordinate is appended to a `LineString` geometry and the polyline source is updated:

```kotlin
locationCallback = object : LocationCallback() {
    override fun onLocationResult(result: LocationResult) {
        val location = result.lastLocation ?: return
        kalmanFilter.process(location)
        val point = Point.fromLngLat(kalmanFilter.lng, kalmanFilter.lat)

        routeCoordinates.add(point)
        updatePolylineSource(routeCoordinates)
        updateMarkerPosition(point)
    }
}
```

### Camera Behavior

One subtle UX challenge: the map camera should follow the user's position during a patrol, but the user should also be able to pan around freely to inspect the map. If you lock the camera, it feels restrictive. If you don't, they lose their position.

The solution: **auto snap-back**. If the user pans away, the camera stays free. But when a new GPS update places the marker close to the current camera center, the camera snaps back to tracking mode automatically. This gives users freedom without losing context.

### Battery Optimization

Continuous GPS tracking is a battery killer. These patrols can last hours, and a dead phone means no incident reporting. The app balances accuracy and battery life by:
- Using `PRIORITY_HIGH_ACCURACY` only during active patrols
- Switching to `PRIORITY_BALANCED_POWER_ACCURACY` when idle
- Batching location updates to reduce wake-ups

---

## 6. Hands-Free Operation with Voice Commands

Here's something I didn't anticipate when I started: the app would be used **while driving**. Field workers patrol roads in vehicles, and asking them to pull over every time they spot debris or a dead animal on the road isn't realistic.

I needed a way to interact with the app **without touching the screen**.

### VOSK for Offline Speech Recognition

Online services like Google Speech API weren't an option — again, no guaranteed connectivity. I integrated **[VOSK](https://alphacephei.com/vosk/)**, an open-source speech recognition toolkit that runs entirely on-device.

VOSK uses lightweight ML models (~50MB) that can be bundled with the app. It processes audio locally with decent accuracy for a focused vocabulary set.

The implementation listens for specific voice commands:
- **"Incidencia"** — opens the incident report with auto-filled location
- **"Emergencia"** — triggers the emergency creation flow
- **"Foto"** — captures a photo linked to the current patrol

The voice recognition doesn't need to be perfect — we're matching against a small set of known commands, not doing free-form dictation. This keeps the accuracy high even with road noise and regional accents.

This was another feature born from listening to the actual users. In a meeting room, the touchscreen UI seemed fine. But they told me — on a highway at 80 km/h, it would be a liability. Voice commands turned a safety problem into a solved problem.

---

## 7. PostgreSQL as the API Layer

The backend uses **PostgreSQL** with **PL/pgSQL functions** as the primary API interface — no ORM, no query builder.

### Functions as Endpoints

Every operation the mobile app needs maps to a PostgreSQL function:

```sql
CREATE OR REPLACE FUNCTION insert_emergency(
    p_uuid VARCHAR(50),
    p_road_id INTEGER,
    p_km NUMERIC(7,3),
    p_direction VARCHAR(20),
    p_status VARCHAR(20),
    -- ... more parameters
) RETURNS VOID AS $$
BEGIN
    INSERT INTO emergencies (uuid, road_id, km, direction, status)
    VALUES (p_uuid, p_road_id, p_km, p_direction, p_status);
END;
$$ LANGUAGE plpgsql;
```

A thin **Node.js/Express** layer sits in front, handling authentication and calling these functions via parameterized queries. The Express layer is deliberately minimal — it validates the request, calls the function, and returns the result.

### Why This Approach?

- **Performance**: No ORM overhead. Queries are optimized at the database level.
- **Consistency**: Business logic lives in one place. Whether data comes from the app, a web dashboard, or a future integration, the same rules apply.
- **Simplicity**: The Node.js layer stays thin and easy to maintain.

### The Trade-offs

- **Harder to test**: Unit testing PL/pgSQL functions requires a running database.
- **Vendor lock-in**: The logic is tightly coupled to PostgreSQL.
- **Developer experience**: Not every developer is comfortable writing and debugging stored procedures.

For this project, the trade-offs were acceptable. The data model is stable, the team is small, and performance matters more than portability.

---

## 8. Designing UX for Field Workers

Building for field workers is fundamentally different from building for office users. I learned this the hard way.

### The Context

- Users operate the app **outdoors**, often in rain or direct sunlight
- They may be wearing **gloves**
- They're standing on a highway shoulder with **traffic passing by**
- They are **not tech-savvy** — the app replaced paper forms they'd used for years
- They need to log information **quickly** and get back to work

The transition from paper to digital won't be smooth — I already know that. Some of these workers have been filling out the same paper forms for a decade. The app has to be **easier than paper**, not just "also digital." If it adds friction, they'll go back to the clipboard.

### Design Decisions

**Large touch targets**: Every button, every interactive element is oversized. Standard Material Design sizing is too small for gloved fingers on a bumpy highway shoulder.

**Minimal required fields**: When creating an emergency, the app lets you save with almost no data. Fill in the basics, get back to the situation, and complete the details later. This came directly from feedback during early demos — field workers pointed out that being forced to fill mandatory fields during an actual highway incident would be a liability. They were right.

**Haptic feedback**: Subtle vibrations confirm actions — a short pulse when saving, a double pulse when completing a task. On a noisy highway, visual feedback alone isn't enough. I spent time tuning the vibration patterns on different devices, because what felt right in a quiet office would feel completely different with traffic noise and adrenaline.

```kotlin
object HapticFeedback {
    fun confirm(context: Context) {
        vibrate(context, 50) // Short confirmation
    }

    fun success(context: Context) {
        // Double pulse for completion
        vibratePattern(context, longArrayOf(0, 50, 100, 50))
    }
}
```

**Automatic data population**: As described in the GeoPackage section, the app fills in location data automatically. Every field the user doesn't have to type is time saved and errors avoided. Automated patrols with no incidents detected get logged with zero manual input — just start the patrol, drive, and end it.

**Adaptive layout for tablets and phones**: The primary devices are **tablets** mounted in vehicles, but field workers may also need to use their personal phones for off-shift emergencies. The UI adapts to both form factors — larger touch targets and multi-column layouts on tablets, a more compact single-column flow on phones. Building adaptive layouts in Jetpack Compose with `WindowSizeClass` made this manageable, but it still meant testing every screen at multiple breakpoints.

**State machines, not free-form flows**: Emergencies follow a strict lifecycle — Active, Finalized, Canceled. The UI adapts to each state, showing only relevant actions and preventing invalid transitions.

---

## 9. Security: Encryption and Biometric Access

The app handles sensitive operational data — incident locations, emergency details, staff assignments, photos of road conditions. This data can't just sit unprotected on a device that might be lost or stolen.

### Encrypted Credentials

User credentials are stored using Android's **EncryptedSharedPreferences** with AES-256-GCM encryption, backed by the **Android Keystore**. This means login data is encrypted at rest with hardware-backed keys — even if someone extracts the app's data from the device, the credentials are unreadable without the Keystore.

Passwords are also hashed with SHA-256 for offline login validation, so the app can authenticate users even without a server connection.

### Biometric Authentication

The app supports **biometric authentication** (fingerprint or face recognition) for quick access. After a successful login, users can enable biometric unlock so they don't have to type credentials every time.

The implementation uses Android's **BiometricPrompt API**, which handles the variety of biometric hardware across manufacturers gracefully. It detects the available biometric type on the device and adapts accordingly — fingerprint, face, or both.

If a phone is left unattended in a vehicle (which happens), the session and credentials remain protected behind the device's biometric lock.

---

## 10. Sync Strategy

The sync process is the bridge between the offline-first local database and the central server.

### How It Works

1. **Detect connectivity**: The app monitors network state. When a connection becomes available, it triggers a sync attempt.

2. **Push local changes**: All records with `synced = false` are collected and sent to the server in batch. This includes new records, updates, and photos.

3. **Pull server updates**: After pushing, the app pulls any new reference data — updated road lists, staff directories, configuration changes.

4. **Mark as synced**: On successful push, records are flagged as `synced = true`.

### Photo Sync

Photos deserve special mention. They're captured offline and stored locally as files with metadata in Room. During sync, each photo is uploaded individually (they can be several MB each), and only marked as synced on successful upload.

```kotlin
suspend fun syncPhotos() {
    val unsyncedPhotos = photoDao.getUnsynced()

    for (photo in unsyncedPhotos) {
        try {
            val file = File(photo.localPath)
            apiService.uploadPhoto(photo.uuid, photo.registryUuid, file)
            photoDao.markSynced(photo.uuid)
        } catch (e: Exception) {
            // Will retry on next sync cycle
        }
    }
}
```

### Conflict Handling

The current approach is **last-write-wins** at the record level. Since field workers operate in different zones and rarely edit the same records, conflicts are rare in practice. The server timestamps every update, and the most recent write takes precedence.

For the rare case where two users modify the same emergency, the server-side function uses `COALESCE` to merge non-null fields, preserving data from both writes where possible.

---

## 11. Lessons Learned

After months of development and real-world deployment, here are the key takeaways:

### GeoPackage is underrated — and under-documented

For Android apps that need offline spatial data, GeoPackage is a hidden gem. But be prepared to struggle. The documentation is sparse, the community is small, and there's very little practical content about it online. I spent more time reading source code than documentation. That said, the technology itself is solid. Being able to run spatial queries locally on a phone — with sub-millisecond response times — was a game changer once I got it working.

### Offline-first is a mindset, not a feature

You can't bolt offline support onto an app designed for connectivity. It has to be the foundation. Every screen, every flow, every data model must assume the network doesn't exist. When you design this way, the online case becomes trivially easy — it's just sync.

### The office is not the field

The most valuable feedback didn't come from meetings or design reviews. It came from the field workers themselves during early demos. Features I thought were intuitive weren't. Buttons I thought were big enough were too small. They told me the screen would be unreadable in direct sunlight. The vibrations I'd tuned in a quiet room would be imperceptible next to a highway. The app isn't fully deployed yet — we're about to start sending beta invitations through **Firebase App Distribution** — but the feedback from these sessions has already reshaped entire flows. You have to listen to the people who will actually use the app, ideally before launch.

### A single document can be enough — if you listen carefully

The entire project started from a brief document describing the client's pain points. No detailed specs, no wireframes, no user stories. Understanding what they actually needed (vs. what they literally wrote) required reading between the lines and asking a lot of questions. The document said "digitize forms." What they really needed was "eliminate manual data entry entirely."

### Simple sync beats clever sync

I initially considered more sophisticated sync strategies — operational transforms, vector clocks, conflict resolution UIs. In practice, `synced = false` + last-write-wins covers 99% of real-world usage. Don't over-engineer sync unless you have evidence of actual conflicts.

### PostgreSQL functions are polarizing but effective

The "functions as API" approach wasn't my choice — it was already the established pattern at the company when I joined the project. I'll admit I was skeptical at first. But after working with it for months, I came to appreciate its strengths: excellent performance, business logic centralized in one place, and a very thin backend layer. It's not what I'd pick for every project, but for a stable schema with a small team, it works well. I wouldn't recommend it for a team of 20 with a rapidly changing data model, though.

### Jetpack Compose changes everything

Coming from the XML/View system, building complex UIs with Compose was dramatically faster. State management with `StateFlow`, reactive UIs that update automatically, and the ability to create reusable components made the entire development experience more enjoyable. The learning curve is real, but the productivity gains are worth it.

---

## Final Thoughts

Building this app pushed me into territory I hadn't explored before — geospatial computing, offline architecture, GPS signal processing, on-device ML for voice recognition, hardware integration with haptics. It's the kind of project that doesn't fit neatly into a "frontend" or "backend" box.

I'll be honest: there were moments where I felt completely out of my depth. Staring at GeoPackage geometry calculations at 2 AM, wondering if I'd chosen the wrong approach entirely. Debugging GPS drift on a highway shoulder in the rain. Trying to translate vague requirements into concrete features when the client knew they wanted *something* digital but wasn't sure exactly *what*.

But piece by piece, it came together. And the first time I watched a full patrol — start to finish, zero manual input, all data logged automatically — I knew the hard parts were worth it.

If you're working on something similar — an app that needs to work in harsh conditions, offline, with spatial data — I hope this breakdown gives you useful starting points. The stack (Kotlin + Jetpack Compose + Room + GeoPackage + MapLibre + PostgreSQL + VOSK) proved to be robust and capable.

The app is currently in testing, with beta distribution about to begin through Firebase App Distribution. We're also using **Firebase Crashlytics** to catch issues early before the full rollout. But from what the field workers have seen so far, the reaction has been overwhelmingly positive — they can already tell this will replace their stacks of paper forms with a few taps and voice commands. That's the kind of impact that makes the technical challenges worth it.

---

**Thanks for reading. If you found this useful, feel free to share it with anyone tackling similar challenges.**
