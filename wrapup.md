You are helping me ship my React Native + Expo Timer App. The app currently has “Pro” features controlled by a manual dev/testing toggle in Settings. I need to ship to production, so:

GOAL
1) Remove the dev/testing Pro toggle from the UI.
2) Replace all Pro gating logic with an entitlement check based on an active subscription.
3) Make Pro unlocking work on Android and iOS production builds.

CONSTRAINTS
- Do not refactor unrelated code.
- Make changes minimal and easy to review.
- Add clear comments where Pro entitlement is checked.
- If you need to introduce a single “source of truth” function/hook, do it.
- Provide a step-by-step plan BEFORE editing code. Wait for my approval before applying changes.


