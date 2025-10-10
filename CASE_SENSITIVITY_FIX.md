# Case-Sensitivity Build Error Fix

## Issue
Build was failing on Vercel (Linux) due to case-sensitive file system, while it worked on Windows (case-insensitive).

## Error
```
Could not resolve "../styles/LoginSecurity.module.css" from "src/components/loginsecurity.tsx"
```

## Root Cause
CSS module files were named with different casing than the imports:
- Import: `LoginSecurity.module.css` 
- Actual file: `loginsecurity.module.css`

Windows doesn't care about case, but Linux (Vercel) does!

## Files Fixed

### 1. loginsecurity.tsx
```diff
- import styles from '../styles/LoginSecurity.module.css';
+ import styles from '../styles/loginsecurity.module.css';
```

### 2. PurchaseProtection.tsx
```diff
- import styles from "../styles/PurchaseProtection.module.css";
+ import styles from "../styles/purchaseProtection.module.css";
```

### 3. SixpineApp.tsx
```diff
- import styles from "../styles/SixpineApp.module.css";
+ import styles from "../styles/sixpineApp.module.css";
```

### 4. Supply.tsx
```diff
- import styles from '../styles/Supply.module.css';
+ import styles from '../styles/supply.module.css';
```

## Verification
All imports now match the exact casing of the actual CSS module files.

## Status
✅ **Fixed** - Build should now work on Vercel/Linux environments

---
**Date**: October 10, 2025
**Build Platform**: Vercel (case-sensitive file system)
