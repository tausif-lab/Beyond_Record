"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { offlineStorage } from "@/lib/offline-storage"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSyncCount, setPendingSyncCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Update pending sync count
    const updatePendingCount = () => {
      setPendingSyncCount(offlineStorage.getPendingSyncCount())
    }

    updatePendingCount()
    const interval = setInterval(updatePendingCount, 5000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  const handleSync = async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    try {
      await offlineStorage.syncPendingData()
      setPendingSyncCount(0)
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Online/Offline Status */}
      <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center space-x-1">
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        <span>{isOnline ? "Online" : "Offline"}</span>
      </Badge>

      {/* Pending Sync Indicator */}
      {pendingSyncCount > 0 && (
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            {pendingSyncCount} pending sync
          </Badge>
          {isOnline && (
            <Button variant="ghost" size="sm" onClick={handleSync} disabled={isSyncing} className="h-6 px-2">
              {isSyncing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
