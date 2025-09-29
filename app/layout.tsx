import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import ClientLayout from "./client-layout"

export const metadata: Metadata = {
    title: "Beyond Record",
    description: "Comprehensive education management system",
    generator: "v0.app",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>)
{
    return (
        <html lang="en">
            <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    )
}
