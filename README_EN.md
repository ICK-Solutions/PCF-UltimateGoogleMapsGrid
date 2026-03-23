# Google Maps Grid — PCF for Dynamics 365

**Your records are in a table.**
**They should be on a map.**

![Comptes Comptes actifs (Map) - Dynamics 365 et 6 pages de plus - Travail  Microsoft Edge](https://github.com/user-attachments/assets/638df0c8-15cf-4690-852a-6a14aa7481f9)



Google Maps Grid turns any Dynamics 365 view into an interactive Google Maps map. Accounts, contacts, leads, custom entities — if you have a latitude and a longitude, you have a map.

> Published by **Frédérick GROBOST** — Dynamics 365 CE Consultant
> [partnr365.fr](https://partnr365.fr) | https://www.linkedin.com/in/frederickgrobost/ | contact@partnr365.fr

---

## What this PCF does

**Map display**
- Your records displayed as markers on Google Maps
- Auto-centering and auto-zoom on all data points
- Automatic clustering when many markers are close together
- Works on any entity (Account, Contact, Lead, custom)

**Dynamic filtering**
- Real-time search bar (searches across all columns in the view)
- Auto-generated filters for each optionset column in your view
- Simple optionsets: dropdown list
- Multi-select optionsets: checkboxes with "Select all"
- Zero configuration: add an optionset column to your view, the filter appears

**Smart colors**
- Color your markers based on an optionset field (e.g. customer type)
- Colors are pulled directly from Dynamics 365

**Info-window on click**
- Click a marker: your view columns are displayed
- Direct link to the D365 record

**Robustness**
- French decimal format (comma) and English (dot) handled automatically
- Records without coordinates silently ignored
- Automatic loading, no need to click "Refresh"
- Up to 5,000 records per view

---

## Package contents

```
GoogleMapsGrid_PARTNR365/
├── GoogleMapGridSolution_managed.zip   <- Import into Dynamics 365
├── README.md                           <- This file
└── Guide_Cle_API_Google_Maps.pdf       <- How to create your Google Maps API key
```

---

## Prerequisites

1. **Dynamics 365 CE** (Sales, Service, or Custom) — Model-Driven App
2. **Google Maps API key** with the Maps JavaScript API enabled
   - Follow the provided PDF (5 steps, 10 minutes)
   - Google offers $200/month in free credits — more than enough for an SMB
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
3. Add the columns:
   - **Latitude** and **Longitude** (required for positioning)
   - **Name** (required, displayed in the info-window)
   - Any other useful columns (city, phone, customer type...)
   - Optionset columns automatically become filters

  ![0 Create view with mandatory columns and specific ones](https://github.com/user-attachments/assets/17fe23c2-621e-46cb-a147-cede96fe0a1b)

4. Save and publish the view

### Step 3 — Enable the control

1. Open the view
2. Go to **Controls** > **Add a control**
![1 In View Open Components](https://github.com/user-attachments/assets/bafd5f4b-6a57-42de-ab23-a721b2aa59b8)
![2  Add a componant](https://github.com/user-attachments/assets/b9e89f48-6655-4dd7-830b-6072a645b97d)
![3  Get More Components](https://github.com/user-attachments/assets/b7382ef8-0f54-4318-a4d0-00c4775b8fdb)

4. Select **Google Maps**
![4  Google Maps](https://github.com/user-attachments/assets/df6393f1-1c9c-486c-8e6b-77c8b1139c2a)

5. Configure the properties:
![5  Fill data](https://github.com/user-attachments/assets/79d1fe14-bf3e-43b1-ab31-e3c69669ef80)

| Property | Value | Required |
|----------|-------|----------|
| Google Maps API Key | Your API key | Yes |
| Latitude Field | `address1_latitude` | Yes |
| Longitude Field | `address1_longitude` | Yes |
| Title Field | `name` | Yes |
| Color OptionSet Field | e.g. `customertypecode` | No |
| Map Height (px) | `0` | No |

6. Save and publish. You're all set.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Map doesn't display | Check your Google Maps API key |
| No markers | Check that your records have coordinates |
| Misplaced markers | Check the coordinate format (the PCF handles both FR and EN formats) |
| Grey map | Add `*.dynamics.com/*` to your API key restrictions |
| No filters | Add optionset columns to your view |
| All markers same color | Configure colors in the D365 optionset customization |

---

## Need help?

This PCF is provided for free.

If you need support with:
- Dynamics 365 CE implementation
- Advanced configuration of your views and forms
- Geocoding your addresses (automatically populating lat/lng)
- Custom PCF development

**Get in touch**

- Web: [partnr365.fr](https://partnr365.fr)
- Email: contact@partnr365.fr
- LinkedIn: [Frederick Grobost](https://www.linkedin.com/in/frederickgrobost/)

---

## Technical information

| Item | Value |
|------|-------|
| Publisher | PARTNR.365 |
| Control name | Google Maps Grid |
| Type | Dataset (view / sub-grid) |
| Framework | React, Google Maps JavaScript API |
| Compatibility | Model-Driven Apps (Dynamics 365 CE) |
| License | MIT |
