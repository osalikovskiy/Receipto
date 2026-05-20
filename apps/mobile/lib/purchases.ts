import { Platform } from 'react-native'
import Purchases, { type PurchasesPackage } from 'react-native-purchases'

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? ''
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? ''

export const ENTITLEMENT_PRO = 'pro'

export function initPurchases(userId?: string): void {
  const apiKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY
  if (!apiKey) return
  try {
    Purchases.configure({ apiKey })
    if (userId) void Purchases.logIn(userId)
  } catch {
    // RevenueCat init failure must not crash the app
  }
}

export async function getOfferings() {
  try {
    const offerings = await Purchases.getOfferings()
    return offerings.current ?? null
  } catch {
    return null
  }
}

export type PurchaseResult =
  | { success: true }
  | { success: false; userCancelled: boolean; message: string }

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg)
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_PRO] !== undefined
    if (isPro) return { success: true }
    return {
      success: false,
      userCancelled: false,
      message: 'Entitlement not active after purchase',
    }
  } catch (e: unknown) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'userCancelled' in e &&
      (e as { userCancelled: boolean }).userCancelled
    ) {
      return { success: false, userCancelled: true, message: '' }
    }
    return {
      success: false,
      userCancelled: false,
      message: e instanceof Error ? e.message : 'Purchase failed',
    }
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases()
    return customerInfo.entitlements.active[ENTITLEMENT_PRO] !== undefined
  } catch {
    return false
  }
}

export async function checkIsPro(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo()
    return customerInfo.entitlements.active[ENTITLEMENT_PRO] !== undefined
  } catch {
    return false
  }
}
