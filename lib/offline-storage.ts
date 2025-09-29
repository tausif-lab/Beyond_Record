// Offline-first storage utilities for the dummy prototype
// In production: implement proper offline sync with service workers and IndexedDB

export interface OfflineData {
  timestamp: number
  data: any
  synced: boolean
}

export class OfflineStorage {
  private static instance: OfflineStorage
  private syncQueue: string[] = []

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage()
    }
    return OfflineStorage.instance
  }

  // Store data with offline capability
  setItem(key: string, data: any, requiresSync = false): void {
    if (typeof window === "undefined") return

    const offlineData: OfflineData = {
      timestamp: Date.now(),
      data,
      synced: !requiresSync,
    }

    localStorage.setItem(key, JSON.stringify(offlineData))

    if (requiresSync) {
      this.addToSyncQueue(key)
    }
  }

  // Retrieve data from offline storage
  getItem(key: string): any {
    if (typeof window === "undefined") return null

    const stored = localStorage.getItem(key)
    if (!stored) return null

    try {
      const offlineData: OfflineData = JSON.parse(stored)
      return offlineData.data
    } catch {
      return null
    }
  }

  // Check if data exists and is recent
  hasRecentData(key: string, maxAgeMs = 5 * 60 * 1000): boolean {
    if (typeof window === "undefined") return false

    const stored = localStorage.getItem(key)
    if (!stored) return false

    try {
      const offlineData: OfflineData = JSON.parse(stored)
      return Date.now() - offlineData.timestamp < maxAgeMs
    } catch {
      return false
    }
  }

  // Add item to sync queue
  private addToSyncQueue(key: string): void {
    if (!this.syncQueue.includes(key)) {
      this.syncQueue.push(key)
      this.saveQueue()
    }
  }

  // Save sync queue to localStorage
  private saveQueue(): void {
    if (typeof window === "undefined") return
    localStorage.setItem("sync_queue", JSON.stringify(this.syncQueue))
  }

  // Load sync queue from localStorage
  private loadQueue(): void {
    if (typeof window === "undefined") return

    const stored = localStorage.getItem("sync_queue")
    if (stored) {
      try {
        this.syncQueue = JSON.parse(stored)
      } catch {
        this.syncQueue = []
      }
    }
  }

  // Simulate sync with server (in production: implement real sync)
  async syncPendingData(): Promise<void> {
    this.loadQueue()

    for (const key of this.syncQueue) {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mark as synced
        const stored = localStorage.getItem(key)
        if (stored) {
          const offlineData: OfflineData = JSON.parse(stored)
          offlineData.synced = true
          localStorage.setItem(key, JSON.stringify(offlineData))
        }

        console.log(`[Offline Storage] Synced ${key}`)
      } catch (error) {
        console.error(`[Offline Storage] Failed to sync ${key}:`, error)
      }
    }

    // Clear sync queue
    this.syncQueue = []
    this.saveQueue()
  }

  // Get pending sync items count
  getPendingSyncCount(): number {
    this.loadQueue()
    return this.syncQueue.length
  }

  // Clear all offline data
  clearAll(): void {
    if (typeof window === "undefined") return

    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith("offline_") || key === "sync_queue") {
        localStorage.removeItem(key)
      }
    })
    this.syncQueue = []
  }
}

// Utility functions for common offline operations
export const offlineStorage = OfflineStorage.getInstance()

export function saveUserProgress(userId: string, progress: any): void {
  offlineStorage.setItem(`offline_progress_${userId}`, progress, true)
}

export function getUserProgress(userId: string): any {
  return offlineStorage.getItem(`offline_progress_${userId}`)
}

export function saveDraftData(key: string, data: any): void {
  offlineStorage.setItem(`offline_draft_${key}`, data, true)
}

export function getDraftData(key: string): any {
  return offlineStorage.getItem(`offline_draft_${key}`)
}
