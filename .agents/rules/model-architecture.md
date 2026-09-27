---
trigger: always_on
description: Core system architecture, model deployment flows, and the three AI components
---

# FoodPack AI — Model Concepts & Deployment Architecture

## 1. The Three "AI" Components
1. **Material Recommendation**:
   - **Type**: Rule-based engine + multi-criteria scoring
   - **Role**: Decides **WHAT** material and specification to use (primary decision maker, deterministic, never hallucinated).
2. **Shelf-Life Prediction**:
   - **Type**: Machine Learning (Physics-informed Random Forest)
   - **Role**: Estimates **HOW LONG** the food will last with that material (informational, non-decisional).
3. **LLM Explainer**:
   - **Type**: Large Language Model (Google Gemini API)
   - **Role**: Explains **WHY** the material was chosen, in plain language (never invents materials or numbers).

---

## 2. Model Deployment Workflows

### Normal Setup (Web AND Mobile — Online)
```
Web app  ──┐
           ├──→ calls FastAPI backend ──→ scikit-learn model runs on server ──→ returns prediction
Mobile app─┘
```
- Both web and mobile clients query the server-side FastAPI inference endpoint.
- scikit-learn model executes on the server and returns predicted shelf life + degradation risk curves.

### Special Case (Mobile ONLY — Offline Edge)
```
Mobile app (Expo) ──→ ONNX model bundled inside the app ──→ runs on the phone, no internet needed
```
- Built with **Expo (React Native)** + **Expo Router**.
- For rural farmers, mandis, and off-grid warehouses where internet connectivity is unavailable.
- scikit-learn model is converted to ONNX format (`skl2onnx`) and packaged directly inside the Expo app bundle.
- Runs on-device via `onnxruntime-react-native` with zero network dependency.
- Local persistence via `expo-sqlite` and type contracts via `@foodpack/shared`.

---

## 3. IoT Telemetry Architecture
- Hardware: ESP32 (`ESP32-S3-LAB-01`)
- Sensors: SHT35 (Temp & Humidity), MH-Z19B (CO₂), ZE03-O₂ (O₂)
- Dynamic computation of physiological Respiration Rate ($R_{CO_2}$)
- Integrated into wizard inputs (`storageTemperatureC`, `relativeHumidityPercent`, `respirationRateMlCo2PerKgPerHr`) via "Apply to Wizard".

