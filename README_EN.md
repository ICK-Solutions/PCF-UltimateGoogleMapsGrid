# Google Maps Grid — PCF for Dynamics 365

**Your records are in a table.**
**They should be on a map.**

![Comptes Comptes actifs (Map) - Dynamics 365 et 6 pages de plus - Travail  Microsoft Edge](https://github.com/user-attachments/assets/638df0c8-15cf-4690-852a-6a14aa7481f9)

Google Maps Grid turns any Dynamics 365 view into an interactive Google Maps canvas. Accounts, contacts, leads, custom entities — if you have a latitude and a longitude, you have a map.

> Published by **Frédérick GROBOST** — Dynamics 365 CE Consultant
> [partnr365.fr](https://partnr365.fr) | [LinkedIn](https://www.linkedin.com/in/frederickgrobost/) | contact@partnr365.fr

---

## What this PCF does

**Map display**
- Records rendered as markers on Google Maps
- Auto-center and auto-zoom to fit all visible points
- Automatic clustering when markers are close together
- Works on any entity (Account, Contact, Lead, custom)

**13 marker shapes**
- Choose the shape of your markers: `pin`, `diamond`, `circle`, `square`, `star`, `store`, `building`, `person`, `question`, `target`, `distributor`, `truck`, `wrench`

**Shape + color mapping per option set value**
- Map a shape and a color to each option set value via a JSON configuration
- Mixed mode: shape driven by one option set, color driven by another

**Dynamic filtering**
- Real-time search bar (searches across all columns in the view)
- Auto-generated filters for every option set column in your view
- Simple option sets: dropdown list
- Multi-select option sets: checkboxes with "Select all"
- Lookup filters: dropdown on relationship fields
- Zero configuration: add a column to the view, the filter appears

**Smart colors**
- Color your markers based on an option set field (e.g. customer type)
- Colors pulled directly from Dynamics 365 metadata

**Info-window on click**
- Click a marker: all columns from your view are displayed
- Direct link to the Dynamics 365 record

**Reliability**
- French decimal format (comma) and English format (period) both handled automatically
- Records without coordinates silently ignored
- Automatic loading — no need to click Refresh
- Up to 5,000 records per view (automatic pagination)

---

## Package contents

```
GoogleMapsGrid_PARTNR365/
├── GoogleMapGridSolution_managed.zip   <- Import this into Dynamics 365
├── README.md                           <- This file
└── Guide_Cle_API_Google_Maps.pdf       <- How to create your Google Maps API key
```

---

## Prerequisites

1. **Dynamics 365 CE** (Sales, Service, or Custom) — Model-Driven App
2. **Google Maps API key** with the Maps JavaScript API enabled
   - Follow the PDF guide included (5 steps, 10 minutes)
   - Google provides $200/month in free credits — more than enough for an SMB
3. **Latitude/longitude fields** populated on your records
   - Native fields: `address1_latitude` / `address1_longitude`
   - Or custom fields

---

## Installation (5 minutes)

### Step 1 — Import the solution

1. Go to **make.powerapps.com** > **Solutions**
2. Click **Import**
3. Select `GoogleMapGridSolution_managed.zip`
4. Click **Next** > **Import**

### Step 2 — Prepare your view

1. Open the target table (e.g. Accounts)
2. Create or edit a view
3. Add columns:
   - **Latitude** and **Longitude** (required for positioning)
   - **Name** (required, displayed in the info-window)
   - Any other useful column (city, phone, customer type…)
   - Option set and lookup columns automatically become filters

![0 Create view with mandatory columns and specific ones](https://github.com/user-attachments/assets/17fe23c2-621e-46cb-a147-cede96fe0a1b)

4. Save and publish the view

### Step 3 — Enable the control

1. Open the view
2. Go to **Controls** > **Add a control**

![1 In View Open Components](https://github.com/user-attachments/assets/bafd5f4b-6a57-42de-ab23-a721b2aa59b8)
![2  Add a componant](https://github.com/user-attachments/assets/b9e89f48-6655-4dd7-830b-6072a645b97d)
![3  Get More Components](https://github.com/user-attachments/assets/b7382ef8-0f54-4318-a4d0-00c4775b8fdb)

3. Select **Google Maps Grid**

![4  Google Maps](https://github.com/user-attachments/assets/df6393f1-1c9c-486c-8e6b-77c8b1139c2a)

4. Enable it for **Web**
5. Configure the properties:

![5  Fill data](https://github.com/user-attachments/assets/79d1fe14-bf3e-43b1-ab31-e3c69669ef80)

| Property | Description | Required |
|----------|-------------|----------|
| Google Maps API Key | Your Google Maps API key | Yes |
| Latitude Field | Logical name of the latitude field (e.g. `address1_latitude`) | Yes |
| Longitude Field | Logical name of the longitude field (e.g. `address1_longitude`) | Yes |
| Title Field | Logical name of the title field (e.g. `name`) | Yes |
| Primary Marker Shape | Shape for markers (default: `pin`) | No |
| Marker Style Mapping (JSON) | JSON mapping option set values to a shape and color | No |
| Color Option Set Field | Option set field used to color markers (e.g. `customertypecode`) | No |
| Map Height (px) | Map height in pixels (default: `500`, `0` = automatic) | No |

6. Save and publish.

---

## Advanced configuration

### Available marker shapes

| Shape | Description |
|-------|-------------|
| `pin` | Classic pin (default) |
| `diamond` | Diamond |
| `circle` | Circle |
| `square` | Square |
| `star` | Star |
| `store` | Store / shop |
| `building` | Building |
| `person` | Person |
| `question` | Question mark |
| `target` | Target / crosshair |
| `distributor` | Hand truck / dolly |
| `truck` | Truck |
| `wrench` | Wrench |

### Marker Style Mapping (JSON)

Map a shape and a color to each option set value:

```json
{
  "fieldName": "customertypecode",
  "mappings": [
    { "value": 1, "shape": "star",     "color": "#E53935", "label": "Key account" },
    { "value": 2, "shape": "circle",   "color": "#1E88E5", "label": "Prospect" },
    { "value": 3, "shape": "building", "color": "#43A047", "label": "Partner" }
  ],
  "default": { "shape": "pin", "color": "#9E9E9E" }
}
```

---

## Using the PCF on a form (sub-grid)

The PCF also works on a sub-grid inside a form:

1. Add a sub-grid to the form
2. Point it to a view that contains lat/lng fields
3. Add the Google Maps Grid control to the sub-grid
4. Same configuration as on a view

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Map does not display | Check your Google Maps API key |
| Grey map | Add `*.dynamics.com/*` to your API key restrictions |
| No markers | Check that your records have coordinates populated |
| Markers in the wrong place | Check coordinate format (both FR comma and EN period are handled) |
| No filters | Add option set or lookup columns to your view |
| All markers the same color | Set colors on the option set customization in Dynamics 365 |

---

## Premium features

Need to overlay multiple entities on the same map (accounts + contacts + leads), a radius circle on click, or other field-level features?

These are available in **Google Maps Grid Premium** by PARTNR.365.

👉 [partnr365.fr](https://partnr365.fr) | contact@partnr365.fr

---

## Need help?

This PCF is provided free of charge.

If you need support for:
- Dynamics 365 CE implementation
- Advanced view and form configuration
- Address geocoding (automatically populating lat/lng)
- Custom PCF development

**Get in touch**

- Web: [partnr365.fr](https://partnr365.fr)
- Email: contact@partnr365.fr
- LinkedIn: [Frédérick Grobost](https://www.linkedin.com/in/frederickgrobost/)

---

## Technical information

| Item | Value |
|------|-------|
| Publisher | PARTNR.365 |
| Version | 3.0.14 |
| Control name | Google Maps Grid |
| Type | Dataset (view / sub-grid) |
| Framework | React, Google Maps JavaScript API |
| Compatibility | Model-Driven Apps (Dynamics 365 CE) |
| License | MIT |

---

*PARTNR.365 — People and process before tools.*
