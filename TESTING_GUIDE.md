# RevenueCat Subscription Testing Guide

## Prerequisites Checklist

### ✅ Code Setup (DONE)
- [x] RevenueCat SDK installed
- [x] Subscription service implemented
- [x] Entitlement hook created
- [x] All Pro checks replaced
- [x] API key configured in .env

### ⚠️ RevenueCat Dashboard Setup
1. **Products in App Store Connect / Google Play Console:**
   - Create in-app purchase products with these exact IDs:
     - `monthly` (subscription)
     - `yearly` (subscription)
     - `lifetime` (non-consumable)
   - Note: Product IDs must match exactly (case-sensitive)

2. **Link Products in RevenueCat:**
   - Go to RevenueCat Dashboard → Products
   - Create/attach products with IDs: `monthly`, `yearly`, `lifetime`
   - Attach them to "Cadence Studio Pro" entitlement

3. **Create Offerings:**
   - Go to RevenueCat Dashboard → Offerings
   - Create a "default" offering
   - Add all three products to the offering

### ⚠️ Build Requirements
- **Cannot use Expo Go** (native modules required)
- Must build with EAS Build or `expo run:ios` / `expo run:android`

## Testing Steps

### 1. Build the App

#### Option A: Development Build (Recommended for Testing)
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

#### Option B: EAS Build
```bash
# Build for testing
eas build --profile development --platform ios
# or
eas build --profile development --platform android
```

### 2. Verify Initialization

**Check Console Logs:**
- Look for: `"RevenueCat initialized successfully"`
- If you see an error, check:
  - API key is correct in `.env`
  - `.env` file is in project root
  - App was rebuilt after adding `.env`

**How to Check:**
1. Open app
2. Check Metro bundler console or device logs
3. Should see: `RevenueCat initialized successfully`

### 3. Test Pro Entitlement Check

**What to Test:**
1. Open Settings screen
2. Go to "Pro Features" section
3. Should show "Free tier" message (if no subscription)
4. Try to create 6th session → Should show Pro upgrade modal
5. Try to create 21st activity → Should show Pro upgrade modal
6. Try to export session → Should show Pro upgrade modal

**Expected Behavior:**
- All Pro features should be locked
- Upgrade modals should appear when hitting limits
- "Go Pro" button should navigate to GoProScreen

### 4. Test GoPro Screen

**What to Check:**
1. Navigate to GoPro screen (Settings → Go Pro)
2. Products should load (may show fallback prices if products not configured)
3. Check console for any errors loading products

**Expected:**
- Three pricing options visible
- Loading spinner while fetching products
- Real prices from App Store/Play Store (if configured)
- Or fallback prices: $2.99/$24.99/$54.99

### 5. Test Purchase Flow (Sandbox Testing)

**iOS Sandbox Testing:**
1. Sign out of App Store on device
2. Create sandbox test account in App Store Connect
3. Try to purchase → Will prompt for sandbox account
4. Complete purchase with sandbox account
5. Check if Pro features unlock

**Android Testing:**
1. Use test account (license testing in Play Console)
2. Or use real account in test mode
3. Complete purchase
4. Check if Pro features unlock

**What to Verify:**
- Purchase completes successfully
- Success alert appears
- Pro features immediately unlock
- Settings shows "Pro tier" message
- Can create unlimited sessions/activities
- Can use custom categories
- Can export sessions

### 6. Test Restore Purchases

**What to Test:**
1. After making a purchase, uninstall app
2. Reinstall app
3. Go to Settings → Restore Purchases
4. Should restore subscription and unlock Pro

**Expected:**
- Success message appears
- Pro features unlock
- No need to purchase again

### 7. Verify Pro Features Work

**Test Each Pro Feature:**
- ✅ Create > 5 sessions (should work)
- ✅ Create > 20 activities (should work)
- ✅ Create custom categories (should work)
- ✅ Export sessions (should work)
- ✅ Change history retention (should work)

## Troubleshooting

### Issue: "RevenueCat API key not found"
**Solution:**
- Check `.env` file exists in project root
- Verify `REVENUECAT_API_TEST_KEY=test_yuaqswDjxMvfbOswuZriulTbLbp`
- Rebuild app after adding `.env`

### Issue: "No current offering available"
**Solution:**
- Create a "default" offering in RevenueCat dashboard
- Add products to the offering
- Products must be attached to "Cadence Studio Pro" entitlement

### Issue: Products not loading
**Solution:**
- Verify product IDs match exactly: `monthly`, `yearly`, `lifetime`
- Check products are created in App Store Connect / Play Console
- Verify products are linked in RevenueCat
- Check offering is set as "default"

### Issue: Purchase fails
**Solution:**
- Use sandbox/test account
- Verify products are approved in App Store Connect
- Check RevenueCat dashboard for purchase events
- Verify entitlement is correctly configured

### Issue: Pro features not unlocking after purchase
**Solution:**
- Check console for errors
- Verify entitlement ID matches: "Cadence Studio Pro"
- Check RevenueCat dashboard → Customer → Entitlements
- Try restore purchases

## Verification Checklist

- [ ] RevenueCat initializes without errors
- [ ] GoPro screen loads products (or shows fallback prices)
- [ ] Pro limits work (5 sessions, 20 activities)
- [ ] Upgrade modals appear when hitting limits
- [ ] Purchase flow works (sandbox)
- [ ] Pro features unlock after purchase
- [ ] Restore purchases works
- [ ] Pro status persists after app restart

## Next Steps After Testing

1. **If everything works:**
   - Configure production API keys
   - Submit to App Store / Play Store
   - Set up production products

2. **If issues found:**
   - Check RevenueCat dashboard for errors
   - Verify product IDs match exactly
   - Check console logs for detailed errors
   - Review RevenueCat documentation

