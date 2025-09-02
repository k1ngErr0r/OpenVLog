"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

export function SetupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Organization settings
    orgName: "",
    orgDescription: "",

    // Administrator account
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock setup - in real app this would create the admin account
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to login
      window.location.href = "/login"
    }, 2000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Organization Settings */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Organization Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                placeholder="Acme Security Corp"
                value={formData.orgName}
                onChange={(e) => handleInputChange("orgName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgDescription">Description (Optional)</Label>
              <Textarea
                id="orgDescription"
                placeholder="Brief description of your organization..."
                value={formData.orgDescription}
                onChange={(e) => handleInputChange("orgDescription", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Administrator Account */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Administrator Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminFirstName">First Name</Label>
              <Input
                id="adminFirstName"
                placeholder="John"
                value={formData.adminFirstName}
                onChange={(e) => handleInputChange("adminFirstName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminLastName">Last Name</Label>
              <Input
                id="adminLastName"
                placeholder="Doe"
                value={formData.adminLastName}
                onChange={(e) => handleInputChange("adminLastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email Address</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@company.com"
                value={formData.adminEmail}
                onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.adminPassword}
                  onChange={(e) => handleInputChange("adminPassword", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              <span>Setting up OpenVLog...</span>
            </div>
          ) : (
            "Complete Setup"
          )}
        </Button>
      </div>
    </form>
  )
}
